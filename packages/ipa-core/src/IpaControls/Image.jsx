import React, {useEffect, useState} from "react"
import FileHelpers from "../IpaUtils/FileHelpers"

import clsx from "clsx";

import ScriptHelper from "../IpaUtils/ScriptHelper"

import './Image.scss'

const Image = ({script, url, filename, styles, navigateTo, query, dashboard, padding}) => {

  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      
      if (url)
        setImageUrl(url)
      else if (filename) {
        FileHelpers.getFileUrlForFilename(filename).then((url) => {
          
          setImageUrl(url)
        })
      }
      else {
        const result = await ScriptHelper.executeScript(script)
        if (result.fileId) FileHelpers.getFileUrl(result.fileId).then(url => setImageUrl(url))
      }
    }
    fetchData()
  }, [script, url, filename])
  
  const handleClick = () => {
    
    if (navigateTo && dashboard) {
      let action = {
        type: 'navigate',
        navigateTo: navigateTo,
        query: query
      }
      
      dashboard.doAction(action)
    }
    
  }
  
  
  let component = <div>Loading</div>
  
  if (imageUrl) {
    
    styles = styles ? styles : {maxWidth: "100%", maxHeight: "100%"}
    
    component = <div className={clsx("configured-image-container", navigateTo && dashboard && 'clickable')} onClick={handleClick}>
      <img src={imageUrl} style={styles}/>
    </div>
  }

  return (
    <div style={{padding: padding? padding : '15px', width: '100%', height: '100%'}}>
      <div className="configured-image-component">
        {component}
      </div>
    </div>
  )

}

export const ImageFactory = {
  create: ({config, data}) => {
    
    return <Image {...config} {...data} />
    
  }
}

export default Image
