# create-twinit-app react application scaffold

create-twinit-app scaffolds a basic React application that uses ipa-core and the Twinit platform api node modules.
It is intended to be a starting point and as such will likely not meet your needs 100% out of the box, may include
more libraries than you require, or use tools that you don't use. It is expected that you will make the
changes you need to this scaffolded client.

There are three files you will most likely to adjust further:

- package.json: edit as you would for any react client application
- app/public/config.js: edit if you need to point your client to another Twinit instance or change your applciation id
- app/ipaCore/ipaConfig.js: edit as outlined in the ipa-core documentation to configure your client application

## Run Local Development

If you have provided to correct information when running create-twinit-app then to run the client all you need to do is:

1. npm install
2. npm run watch

## Build Deployable Client

The following command will build the client and wirte it to the build folder.

1. npm run build