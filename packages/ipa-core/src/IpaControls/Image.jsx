import React, {useEffect, useState} from "react"
import FileHelpers from "../IpaUtils/FileHelpers"

import clsx from "clsx";

import ScriptHelper from "../IpaUtils/ScriptHelper"

import './Image.scss'

const Image = ({script, url, filename, styles, navigateTo, query, dashboard, padding}) => {

  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        let resolvedUrl = null
        if (url)
          resolvedUrl = url
        else if (filename)
          resolvedUrl = await FileHelpers.getFileUrlForFilename(filename)
        else if (script) {
          const result = await ScriptHelper.executeScript(script)
          if (result && result.fileId) resolvedUrl = await FileHelpers.getFileUrl(result.fileId)
        }
        if (!cancelled) setImageUrl(resolvedUrl || null)
      } catch (e) {
        // a missing file or failed script should not leave the panel stuck on "Loading"
        console.error("Image: unable to resolve image", e)
        if (!cancelled) setImageUrl(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    fetchData()
    return () => { cancelled = true }
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
  
  
  let component

  if (loading) {
    component = <div className="configured-image-loading">Loading</div>
  } else if (imageUrl) {

    styles = styles ? styles : {maxWidth: "100%", maxHeight: "100%"}

    component = <div className={clsx("configured-image-container", navigateTo && dashboard && 'clickable')} onClick={handleClick}>
      <img src={imageUrl} style={styles}/>
    </div>
  } else {
    // resolution finished with no image (missing file / no fileId) - show a placeholder
    // instead of an indefinite "Loading" state
    component = <div className="configured-image-placeholder" role="img" aria-label="No image available">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
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
