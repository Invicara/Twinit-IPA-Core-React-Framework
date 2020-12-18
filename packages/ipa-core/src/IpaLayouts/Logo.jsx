import React, {useState, useEffect} from 'react';
import FileHelpers from '../IpaUtils/FileHelpers'
import './Logo.scss'

const Logo = ({appName, children, homepage, contextProps}) => {
  
  console.log(contextProps)
  
  const [imgSrc, setImgSrc] = useState(require('./img/invicara-logo_white.svg'))
  
  useEffect(() => {
    const getImgSrc = async (settings) => {
      if (!settings)
        setImgSrc(require('./img/invicara-logo_white.svg'))
      else if (imgSettings && imgSettings.url)
        setImgSrc(imgSettings.url)
      else if (imgSettings && imgSettings.filename) {
        let imgSrc = await FileHelpers.getFileUrlForFilename(imgSettings.filename)
        setImgSrc(imgSrc)
      }
    }
    
    let imgSettings = contextProps.userConfig.settings && contextProps.userConfig.settings.appImage ? contextProps.userConfig.settings.appImage : null
    getImgSrc(imgSettings)
    
  }, [contextProps])
  
  return (
  
    <div id="logo" className='logo-wrapper'>
      {children ? children :
        <a href={homepage}>
          <img src={imgSrc}/>
      </a>}
      <span className='appName'>{appName}</span>
    </div>
          
  )
}




export default Logo;
