
import React from 'react';
import './GenericIframe.scss'

const GenericIframe = ({url, allowFullscreen, width, height}) => {

  let isValidConfig = () => {
    return !!url
  }

  let component = <div>Loading</div>
  
  if (!isValidConfig()){
    component = <span>Please provide a valid url configuration!</span>
  } else if (url) {
    
    let styles = {
      maxWidth: width ? width : '100%',
      minWidth: width ? width : '100%',
      minHeight: height ? height : '100%',
      maxHeight: height ? height : '100%'
    }
  
    component = <iframe src={url}
                    style={styles}
                    className="responsive-iframe"
                    frameBorder="0" 
                    allowFullScreen={!!allowFullscreen}
                    allow="xr-spatial-tracking" >
                </iframe>
   }

  return (
    <div style={{padding: '15px'}}>
      <div className="generic-iframe-container">
        {component}
      </div>
    </div>
  )

}

export const GenericIframeFactory = {
  create: ({config, data}) => {
    
    //data and options provided by the script will do a shallow replace
    //so properties of options are not merged, just one options object
    //replaces the other. In most cases I believe a script will only
    //be supplying the url and not the options anyway
    let options = {...config.config, ...data}
  
    return <GenericIframe {...options} {...config.config}/>
    
  }
}

export default GenericIframe
