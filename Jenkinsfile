@Library('jenkins-core-library') _

publishPackages(
  application: "digitaltwin-factory-framework",
  name: "digitaltwinfactoryframework",
  file: "Dockerfile",
  secrets: [
    [
      name: "npm-settings",
      credential: [
        id: "npmrc",
        type: "file",
      ]
    ]
  ]
)
