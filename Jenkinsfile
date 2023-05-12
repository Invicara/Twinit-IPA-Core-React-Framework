pipeline {
  agent {
    label "Npm1"
  }

  environment {
    APP_NAME    = "InvicaraPlatformApplication"
    REPO_NAME   = "InvicaraPlatformApplication"
    NODEJS_CONF = "564cbc2d-4c5a-4f4f-857c-9c84722f0d10"
    NOTIFY      = "harlan.barnes@invicara.com"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: "30"))
    disableConcurrentBuilds()
  }

  stages {
    stage("Build") {
      steps {
        script {
          // checkout scm
          git branch: "${env.BRANCH_NAME}", url: "git@github.com:Invicara/${env.REPO_NAME}.git"

          properties([
            // set github push trigger
            pipelineTriggers([githubPush()]),
            // set authorization for this job
            authorizationMatrix(
              [
                'com.cloudbees.plugins.credentials.CredentialsProvider.View:authenticated',
                'hudson.model.Item.Build:authenticated',
                'hudson.model.Item.Cancel:authenticated',
                'hudson.model.Item.Discover:authenticated',
                'hudson.model.Item.Read:authenticated',
                'hudson.model.Item.Workspace:authenticated',
                'hudson.model.Run.Delete:authenticated',
                'hudson.model.Run.Replay:authenticated',
                'hudson.model.Run.Update:authenticated',
                'hudson.scm.SCM.Tag:authenticated'
              ]
            )
          ])

          // set nodejs tool environment
          nodejs(configId: '564cbc2d-4c5a-4f4f-857c-9c84722f0d10', nodeJSInstallationName: 'nodejs-14.19.3') {
            ansiColor('xterm') {
              sh "npm cache clean --force"
              sh "npm install --no-package-lock && npm run publish"
              sh "echo node version"
              sh "node -v"
              sh "echo npm version"
              sh "npm -v"
            }
          }
        }
      }
    }
  }

  post {
    always {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }

    aborted {
      script {
        office365ConnectorSend(
          webhookUrl: env.DEV_WEBHOOK_URL,
          message: "${env.REPO_NAME}/${env.BRANCH_NAME} [build id ${env.BUILD_NUMBER}](${env.BUILD_URL}) aborted",
          status: "Aborted",
          color: "#FFFF00"
        )
      }
    }

    success {
      script {
        // find the last real build and see if it is different, if so then send out "fixed"
        def previous = currentBuild.previousBuild
        while (previous && previous.displayName ==~ /^#\d+ skip$/) {
          previous = previous.previousBuild
        }
        if (previous && previous.result != currentBuild.result) {
          // alert channel if build returns to normal
          office365ConnectorSend(
            webhookUrl: env.DEV_WEBHOOK_URL,
            message: "${env.REPO_NAME}/${env.BRANCH_NAME} [build id ${env.BUILD_NUMBER}](${env.BUILD_URL}>) back to normal",
            status: "Back to Normal",
            color: "#008000"
          )

          // alert explicit recipients and any developers from commit for fixes
          emailext(
            attachLog: true,
            to: env.NOTIFY,
            recipientProviders: [[$class: "DevelopersRecipientProvider"]],
            body: "For more information:\n\n${env.BUILD_URL}",
            subject: "FIXED: ${env.REPO_NAME}/${env.BRANCH_NAME} build id ${env.BUILD_NUMBER} back to normal"
          )
        }
      }
    }

    failure {
      script {
        // alert channel if any build fails
        office365ConnectorSend(
          webhookUrl: env.DEV_WEBHOOK_URL,
          message: "${env.REPO_NAME}/${env.BRANCH_NAME} [build id ${env.BUILD_NUMBER}](${env.BUILD_URL}) failed",
          status: "Failed",
          color: "#FF0000"
        )

        // alert explicit recipients and any developers from commit for all failures
        emailext(
          attachLog: true,
          to: env.NOTIFY,
          recipientProviders: [[$class: "DevelopersRecipientProvider"]],
          body: "For more information:\n\n${env.BUILD_URL}",
          subject: "FAILURE: ${env.REPO_NAME}/${env.BRANCH_NAME} build id ${env.BUILD_NUMBER} failed"
        )
      }
    }
  }
}
