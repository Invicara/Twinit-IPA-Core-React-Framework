import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly';

export const InstallCodeBlock = (() => {
   const moduleMap = {
        "localhost": "@whitelabel",
        "twinit.dev": "@invicara",
        "mirrana.dev": "@mirrana",
   }

   return <BrowserOnly>{() => <div class="codeBlockContainer_J+bg">
          <div className="codeBlockContent_csEI bash">
               <pre tabindex="0" className="prism-code language-bash codeBlock_rtdJ thin-scrollbar" style={{color: 'rgb(57, 58, 52)', backgroundColor: 'rgb(246, 248, 250)'}}>
                    <code className="codeBlockLines_1zSZ">
                         <span className="token-line" style={{color: 'rgb(57, 58, 52)'}}>
                              <span className="token function" style={{color: 'rgb(215, 58, 73)'}}>npm</span>
                              <span className="token plain"> </span>
                              <span className="token function" style={{color: 'rgb(215, 58, 73)'}}>install</span>
                              <span className="token plain"> {moduleMap[window.location.hostname]}/ipa-core</span>
                         </span>
                    </code>
               </pre>
          </div>
     </div>}</BrowserOnly>
})
