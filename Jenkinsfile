@Library('jenkins-core-library') _

publishPackages(
  application: "digitaltwin-factory-framework",
  images: [
    [
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
    ]
)
