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

            let appidOptions = {prompt: "Application ID (required):", default: "None"}
            read(appidOptions).then((appId) => {

               let cfgUserTypeOptions = {prompt: "Config _userType: (required)", default: "None"}
               read(cfgUserTypeOptions).then((cfgtype) => {

                  let twinitOptions = {prompt: "Twinit URL:", default: "https://sandbox-api.invicara.com"}
                  read(twinitOptions).then((url) => {

                     decompress(path.join(__dirname, 'starter-app-source.zip'), './', {strip: 1}).then(() => {
                        console.log(' extraction complete')
         
                        package.name = appName.replaceAll(' ', '-').toLowerCase()
                        package.description = desc
                        package.version = version
                        package.author = author
         
                        fs.writeFileSync('./package.json', JSON.stringify(package, null, 3))
                        fs.writeFileSync('./app/public/config.js', `const endPointConfig = {
                           itemServiceOrigin: '${url}',
                           passportServiceOrigin: '${url}',
                           fileServiceOrigin: '${url}',
                           datasourceServiceOrigin: '${url}',
                           graphicsServiceOrigin: '${url}',
                           baseRoot: 'http://localhost:8084',
                           applicationId: '${appId}'
                        }`)
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
                     
                  })

               })

            })

         })

      })
   })
   
})




