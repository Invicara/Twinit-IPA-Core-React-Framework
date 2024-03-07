#! /usr/bin/env node

const decompress = require('decompress')
const path = require('path')
const fs = require('fs')
const { read } = require('read')

let package = require('./package.json')

let nameOptions = {prompt: "Twinit app name:", default: "my-twinit-react-client"}
read(nameOptions).then((appName) => {
   
   let descOptions = {prompt: "Twinit app description:", default: "My Twinit React Client Description"}
   read(descOptions).then((desc) => {

      let verOptions = {prompt: "Version:", default: "1.0.0"}
      read(verOptions).then((version) => {

         let authorOptions = {prompt: "Author:", default: "None"}
         read(authorOptions).then((author) => {

            let appidOptions = {prompt: "Application ID (required - default = dev-training):", default: "77b2cdca-c1a3-4d27-9d19-7b5358e3b337"}
            read(appidOptions).then((appId) => {

               let cfgUserTypeOptions = {prompt: "Config _userType: (required - default = dev-training)", default: "dev-train"}
               read(cfgUserTypeOptions).then((cfgtype) => {

                  let twinitOptions = {prompt: "Twinit URL:", default: "https://sandbox-api.invicara.com"}
                  read(twinitOptions).then((url) => {

                     console.log('--> Extracting source files')
                     decompress(path.join(__dirname, 'starter-app-source.zip'), './', {strip: 1}).then(() => {
         
                        package.name = appName.replaceAll(' ', '-').toLowerCase()
                        package.description = desc
                        package.version = version
                        package.author = author
         
                        fs.writeFileSync('./package.json', JSON.stringify(package, null, 3))
                        console.log('--> Created package.json file')

                        fs.writeFileSync('./app/public/config.js', `const endPointConfig = {
                           itemServiceOrigin: '${url}',
                           passportServiceOrigin: '${url}',
                           fileServiceOrigin: '${url}',
                           datasourceServiceOrigin: '${url}',
                           graphicsServiceOrigin: '${url}',
                           baseRoot: 'http://localhost:8084',
                           applicationId: '${appId}'
                        }`)
                        console.log('--> Created ./app/public/config.js file')


                        fs.writeFileSync('./app/ipaCore/ipaConfig.js', `const ipaConfig = {
                           appName: "${appName}",
                           configUserType: "${cfgtype}",
                           scriptPlugins: [],
                           css: [],
                           redux: {
                           slices: []
                           },
                           components: {
                           dashboard: [],
                           entityData: [],
                           entityAction: []
                           }
                        }
                        
                           export default ipaConfig`)
                        })
                        console.log('--> Created ./app/ipaCore/ipaConfig.js file')

                        console.log('--> New Twinit React Client App Setup Complete')
                        console.log('--> Run "npm install" to install node modules')
                        console.log('--> Run "npm run watch" to start local client')
                        console.log('--> Client will be served at http://localhost:8084')
                  })

               })

            })

         })

      })
   })
   
})




