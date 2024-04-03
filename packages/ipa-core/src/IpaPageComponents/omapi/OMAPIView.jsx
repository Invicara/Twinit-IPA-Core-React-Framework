import React, {useEffect, useState} from "react"
import { IafItemSvc } from "@invicara/platform-api"

import { OMAPICard } from './OMAPICard'
import './OMAPIView.scss'


const OMAPIView = ({onLoadComplete, selectedItems, token}) => {

  const [ready, setReady] = useState(false)
  const [apiConfig, setApiConfig] = useState(null)
  const [rootUrl, setRootUrl] = useState('')
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {

    async function fetchApiConfig() {
      let configs = await IafItemSvc.getAllNamedUserItems({query: {_userType: "api_config"}})

      if (!configs || !configs.length) {
        setError("Project Configuration Error: No Object Model API config found!")
      }
      else if (configs.length > 2) {
        setError("Project Configuration Error: More than one Object Model API config found!")
      } else {
        try {
          let apiConfig = JSON.parse(configs[0]._versions[0]._userData)
          if (!apiConfig) {
            setError("Object Model API Configuration Error: Error parsing Object Model API config!")
          } else {
            setApiConfig(apiConfig[0])
            let resources = Object.keys(apiConfig[0].endpoints)
            let expanded = {}
            resources.forEach(r => expanded[r] = false)
            setExpanded(expanded)
          }
        } catch(err) {
          setError("Object Model API Configuration Error: Error parsing Object Model API config!")
        }
      }
      setReady(true)
      onLoadComplete(true)
    }
    setRootUrl(endPointConfig.itemServiceOrigin+'/omapi/'+selectedItems.selectedProject._namespaces[0])
    fetchApiConfig()
    
  }, [])

  const toggleExpand = (resource) => {
    let currentExpand = Object.assign({}, expanded)
    currentExpand[resource] = !expanded[resource]
    setExpanded(currentExpand)
  }

  const hasOptionsMethod = (resource) => {
    let optionsPath = apiConfig.endpoints[resource].paths.filter(p => p.method === 'OPTIONS')
    return optionsPath && optionsPath.length === 1
  }

  return <div>
    {ready && <div className='omapi-page'>
      <div className='page-header'><h1>Object Model API Documentation</h1></div>
      {error && <div className='error-msg'>
      <i class="fas fa-exclamation-circle"></i>
        {error}
      </div>}
      <hr/>
      <div className="root-info">
        <i className="fas fa-map-marker-alt fa-2x"></i>
        <span className='root-label'>Root url:</span>
        <span className='root-url'>{rootUrl}</span>
      </div>
      <div>
        {apiConfig && apiConfig.endpoints && Object.keys(apiConfig.endpoints).map((e) => {
          return <div key={e}>
            <hr/>
            <div className='path-header' onClick={() => toggleExpand(e)}>
                {expanded[e] && <i className="fas fa-caret-down fa-2x"></i>}
                {!expanded[e] && <i className="fas fa-caret-right fa-2x"></i>}
                <h2>{e}</h2>
                {!hasOptionsMethod(e) && <span className='missing-options'><i class="fas fa-exclamation-circle fa-2x"></i> Resource is missing OPTIONS path!</span>}
            </div>
            {expanded[e] && <ul>
              {apiConfig.endpoints[e].paths.filter(p => p.method !== 'OPTIONS').sort().map(p => <OMAPICard key ={p.path+'-'+p.method} path={p} rootUrl={rootUrl} token={token}/>)}
            </ul>}
          </div>
        })}
      </div>
    </div>}
  </div>
}

export default OMAPIView