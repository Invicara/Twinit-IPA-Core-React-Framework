import React, { useEffect, useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export const ImportModulesCodeBlock = (({modules}) => {
   const moduleMap = {
        "TWINIT": "@invicara",
        "MIRRANA": "@mirrana",
   }

   const [moduleName, setModuleName] = useState('')

   const {siteConfig} = useDocusaurusContext()

   useEffect(() => {

     let module = moduleMap[siteConfig.customFields.platformName.toUpperCase()]
     if (!module) module = moduleMap['TWINIT']

     setModuleName(module)

   }, [])

   return <BrowserOnly>{() => <div className="codeBlockContainer_node_modules-@docusaurus-theme-classic-lib-next-theme-CodeBlock-styles-module">
     <div className="codeBlockContent_node_modules-@docusaurus-theme-classic-lib-next-theme-CodeBlock-styles-module jsx">
          <pre className="prism-code language-jsx codeBlock_node_modules-@docusaurus-theme-classic-lib-next-theme-CodeBlock-styles-module thin-scrollbar" style={{color: 'rgb(57, 58, 52)', backgroundColor: 'rgb(246, 248, 250)'}}>
               <code className="codeBlockLines_node_modules-@docusaurus-theme-classic-lib-next-theme-CodeBlock-styles-module">
                    <span className="token-line" style={{color: 'rgb(57, 58, 52)'}}>
                         <span className="token keyword" style={{color: 'rgb(0, 0, 159)'}}>import</span>
                         <span className="token plain"> </span>
                         <span className="token punctuation" style={{color: 'rgb(57, 58, 52)'}}>{'{ '}</span>
                         <span className="token plain"> {modules.join(', ')} </span>
                         <span className="token punctuation" style={{color: 'rgb(57, 58, 52)'}}>{' }'}</span>
                         <span className="token plain"> </span>
                         <span className="token keyword" style={{color: 'rgb(0, 0, 159)'}}>from</span>
                         <span className="token plain"> </span>
                         <span className="token string" style={{color: 'rgb(227, 17, 108)'}}>'{moduleName}/ipa-core'</span>
                    </span>
               </code>
          </pre>
     </div>
     </div>}</BrowserOnly>
})

