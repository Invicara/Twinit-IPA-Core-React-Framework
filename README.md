# InvicaraPlatformApplication

## Development

Process:

1. Run `npm install --no-package-lock` in the root of the repository
1. Run `npm run bootstrap` in the root of the repository which will run `npm install` for each package and `npm link` each module dependency together.
1. Run `npm run build-dev` to run `npm build-dev` in for each package
1. Make changes to modules as necessary
1. Commit all your changes together as a single commit

Notes:

* The branch should always represent a working version of all the modules. Do not commit changes to a single module that are required by another module.
* If you would like to run a command on a single package, use the `--scope` option for lerna:
  ```
  npx lerna run build-dev --scope @invicara/platform-api
  ```
  The usage of `npx` in the root directory will allow you to use lerna without installing it globally.
* Jenkins will run on every commit. This will only catch the simplest of commit errors, but it's better than nothing!
* It is still possible to run commands like `npm install` or `npm run build-dev` by hand in individual packages as needed.
* If you run `npm install` in a package by hand, either remove the `package-lock.json` file OR run `npm install --no-package-lock`

## Release

When the package owner is ready to create a new release, follow this process:

1. Run `npm run release`
1. Lerna will ask you which version you would like to increment (or if you would like to entire a custom version):
   ```
   lerna notice cli v3.19.0
   lerna info versioning independent
   lerna info Looking for changed packages since @invicara/classify-iaf@0.9.3
   ? Select a new version for @invicara/classify-iaf (currently 0.9.3) (Use arrow keys)
   ❯ Patch (0.9.4)
     Minor (0.10.0)
     Major (1.0.0)
     Prepatch (0.9.4-alpha.0)
     Preminor (0.10.0-alpha.0)
     Premajor (1.0.0-alpha.0)
     Custom Prerelease
     Custom Version
   ```
   Lerna will iterate through each package that has changed since the **LAST RELEASE**.
1. To ignore a package, you can use the `--ignore changes` command:
   ```
   npm run release -- --ignore-changes 'packages/core-utils/**'
   ```
   or
   ```
   npm run release -- --ignore-changes 'packages/core-utils/**' --ignore-changes 'packages/script-iaf/**'
   ```
   NOTE: The quotes are very important. If you don't include the quotes, the wildcards will glob at the shell level and will not exclude what you need.
   You can also "test" to see if your wildcards work by using:
   ```
   npm run changed -- --ignore-changes 'packages/core-utils/**'
   ```
1. Lerna will update the `package.json` for each individual package with the new version number. Further, it will update any package that depends on that package:
   ```
   {
      "name": "@invicara/classify-iaf",
      "description": "BIM Classify IAF APIs.",
   -  "version": "0.9.3",
   +  "version": "0.9.2",
      "main": "dist/classify-iaf.js",
      "publishConfig": {
        "registry": "https://nexus.bimassure.com/repository/npm-test/"
   @@ -11,7 +11,7 @@
        "build-dev": "rollup -c rollup.config.js && npm link"
      },
      "dependencies": {
   -    "@invicara/platform-api": "0.9.3"
   +    "@invicara/platform-api": "0.9.2"
      },
      "devDependencies": {
        "rollup": "^1.0.2",
   ```
1. Lerna will automatically make a commit of these changes and tag those changes with the package name and version number.

### Advanced

To release ALL modules you can use the `lerna` command directly and the `--force-publish` option.

Also, please use the `--exact` option to make the dependency to the exact same version being released. 

For example:

```
npx lerna version --force-publish --exact
```

If you are updating the minor versions of ALL the modules, you can avoid having to answer all the interactive questions by simply:

```
npx lerna version minor --force-publish --exact
```

It will still list all the changes and allow you to confirm them before the commit and tag.

## Publish

The publish process will happen automatically when the commit is pushed. Jenkins will run:

1. `npm run bootstrap`
1. `npm run build`
1. `npm run publish` - This will only publish the package if the version isn't already on the NPM repository.
