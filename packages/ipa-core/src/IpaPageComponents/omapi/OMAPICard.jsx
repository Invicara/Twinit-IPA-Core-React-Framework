import React, { useState, useEffect } from "react";
import clsx from "clsx";
import _ from 'lodash'

import GenericButton from '../../IpaControls/GenericButton'
//import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

import { JSONEditor } from './JSONEditor'
import { OMAPICardError } from './OMAPICardError'

import './OMAPICARD.scss'

export const OMAPICard  = ({path, rootUrl, token}) => {

  const [expanded, setExpanded] = useState(false)
  const [pathVars, setPathVars] = useState(null)
  const [pathVarError, setPathVarError] = useState(null)
  const [queryParams, setQueryParams] = useState(null)
  const [requestBody, setRequestBody] = useState(null)
  const [requestBodyError, setRequestBodyError] = useState(null)
  const [responseOK, setResponseOK] = useState(true)
  const [responseStatus, setResponseStatus] = useState(null)
  const [responseBody, setResponseBody] = useState("")
  const [fetching, setFetching] = useState(false)
  

  useEffect(() => {

    if (path.docs && path.docs['Path Variables'] && path.docs['Path Variables Example'])
      setPathVars(path.docs['Path Variables Example'])
    else if (path.docs && path?.docs['Path Variables'])
      setPathVars(makeEmptyExamples(path.docs['Path Variables']))

    if (path.docs && path.docs['Request Query Params'] && path.docs['Request Query Params Example'])
      setQueryParams(path.docs['Request Query Params Example'])
    else if (path.docs && path?.docs['Request Query Params'])
      setQueryParams(makeEmptyExamples(path.docs['Request Query Params']))

    if (path.docs && path.docs['Request Body Example'])
      setRequestBody(JSON.stringify(path.docs['Request Body Example'], null, 3))
    if (path.docs && path.docs['Response Body Example'])
      setResponseBody(JSON.stringify(path.docs['Response Body Example'], null, 3))

  }, [])

  const toggle = () => {
    setExpanded(!expanded)
    console.log(path)
  }

  const expand = () => {
    if (!expanded) setExpanded(true)
  }

  const updateState = (stateToUpdate, prop, value, updateFunc) => {
    let updatedState = {...stateToUpdate}
    updatedState[prop] = value
    updateFunc(updatedState)
  }

  const onReqBodyChange = (editor, data, value) => {
    console.log(editor, data, value)
    setRequestBody(value)
  }

  const makeEmptyExamples = (def) => {
    let examples = {}
    console.log(def)
    Object.keys(def).forEach((d) => {
      examples[d] = ""
    })
  }

  const getInputType = (state, prop) => {
    if (state.hasOwnProperty(prop) && typeof state[prop] === 'number') return 'number'
    else return 'text'
  }

  const flattenObject = (body, parent, result) => {
    if (!result) result = {}
    if (!parent) parent = null

    let level_keys = Object.keys(body)

    level_keys.forEach((k) => {
      if (typeof body[k] === 'object' & body !== null) {
        flattenObject(body[k], k, result)
      } else {
        if (!parent) result[k] = body[k]
        else result[parent + '.' + k] = body[k]
      }
    })
    return result
  }

  const tryMe = () => {
    expand()
    doFetch()
  }

  const isValidJson = (testString) => {
    try {
      JSON.parse(testString)
      return true
    } catch(e) {
      return false
    }
  }

  const doFetch = async () => {
    setFetching(true)

    setPathVarError(null)
    setRequestBodyError(null)

    setResponseBody("")
    setResponseStatus(null)
    setResponseOK(true)
    
    let errored = false
    let url = rootUrl + path.path

    if (pathVars) {
      console.log(pathVars)
      Object.keys(pathVars).forEach((vn) => {
        if (pathVars[vn] && (pathVars[vn] === 0 || pathVars[vn].length))
          url = url.replace(vn, encodeURIComponent(pathVars[vn]))
        else {
          setPathVarError('ERROR: All Path Variables must have a value!')
          errored= true
        }
      })
    }

    if (queryParams) {
      let params = ""
      Object.keys(queryParams).forEach((qp) => {
        if (queryParams[qp] && (queryParams[qp] === 0 || queryParams[qp].length))
        params += qp + '=' + queryParams[qp]
      })
      if (params.length)
        url += '?' + encodeURIComponent(params)
    }

    let options = {
      method: path.method,
      mode: 'cors',
      headers: {
        Authorization: 'Bearer ' + token,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Accept: '*/*'
      }
    }
    if (requestBody?.length){
      if (isValidJson(requestBody)) {
        options.body = requestBody
      } else {
        setRequestBodyError("ERROR: Request Body is not valid JSON!")
        errored = true
      }
    } 

    if (!errored) {
      let resp = await fetch(url, options).catch((err) => {
        console.error()
        setResponseBody({"ERROR": "Error sending request to Twinit!"})
      })
      console.log(resp)
      setResponseStatus(resp.status + " " + resp.statusText)
      setResponseOK(resp.ok)
  
      resp.json().then((jsonResp) => {
        let respString = JSON.stringify(jsonResp, null, 3)
        setResponseBody(respString)
      }).catch((err) => {
        setResponseBody({"ERROR": "Error parsing response JSON!"})
      }).finally(() => {
        setFetching(false)
      })
    } else {
      setFetching(false)
    }
    
  }

  let tryMeStyles = {
    padding: '0px',
    fontSize: 'unset'
  }

  return <li className='omapi-card'>
      <div className='card-row1'>
          <div onClick={toggle} className='partial-path'>
            {expanded && <i className="fas fa-caret-down"></i>}
            {!expanded && <i className="fas fa-caret-right"></i>}
            <span className='method'>{path.method}</span> 
            <span className='path'>{path.path}</span>
          </div>
          <div className='full-path-wrapper'>
            <span className='full-path'>{rootUrl + path.path}</span>
          </div>
      </div>
      <div className='card-row2'>
          <div>{path.docs?.Summary ? path.docs.Summary : ''}</div>
          <div><GenericButton text="Try Me" styles={tryMeStyles} onClick={tryMe} /></div>
      </div>
      {expanded && <div className='card-row3'>
          <div className='path-config-items'>
            <div className='even-row-space'>
              {pathVars && <div className={clsx({'config-card': true, 'config-card-full': !queryParams, 'config-card-half': queryParams})}>
                <div className='config-card-title'>Path Variables</div>
                <hr/>
                <OMAPICardError error={pathVarError} />
                <div>{Object.keys(pathVars).map((k) => {
                  return <div key={k}>
                    <div className='config-card-val'>
                      <div className='val-name'>{k}</div>
                      <div className='val-container'>
                        <input className='val-value' type={getInputType(pathVars, k)} defaultValue={pathVars.hasOwnProperty(k) ? pathVars[k] : ''} onInput={(e) => updateState(pathVars, k, e.target.value, setPathVars)}></input>
                        <div className='config-card-desc'>{_.get(path.docs['Path Variables'], k)}</div>
                      </div>
                    </div>
                  </div>
                })}</div>
              </div>}
              {queryParams && <div className={clsx({'config-card': true, 'config-card-full': !pathVars, 'config-card-half': pathVars})}>
                <div className='config-card-title'>Query Parameters</div>
                <hr/>
                <div>{Object.keys(queryParams).map((k) => {
                  return <div key={k}>
                    <div className='config-card-val'>
                      <div className='val-name'>{k + ' ='}</div>
                      <div  className='val-container'>
                        <input className='val-value' type={getInputType(queryParams, k)} defaultValue={queryParams.hasOwnProperty(k) ? queryParams[k] : ''} onInput={(e) => updateState(queryParams, k, e.target.value, setQueryParams)}></input>
                        <div className='config-card-desc'>{_.get(path.docs['Request Query Params'], k)}</div>
                      </div>
                    </div>
                  </div>
                })}</div>
              </div>}
            </div>
            <div className='even-row-space'>
              {path.docs && path.docs['Request Body'] && <div className={clsx({'config-card': true, 'config-card-half': true})}>
                <div className='config-card-title'>Request Body</div>
                <OMAPICardError error={requestBodyError} />
                <hr/>
                <div>{Object.keys(flattenObject(path.docs['Request Body'])).map((k) => {
                  return <div key={k}>
                    <div className='config-card-val'>
                      <div className='val-name'>{k}</div>
                      <div>
                        <div className='config-card-desc'>{_.get(path.docs['Request Body'], k)}</div>
                      </div>
                    </div>
                  </div>
                })}</div>
                <hr/>
                <div className='config-body'>
                  <JSONEditor jsonValue={requestBody} readonly={false} onChange={onReqBodyChange} />
                </div>
              </div>}
              <div className={clsx({'config-card': true, 'config-card-full': !requestBody, 'config-card-half': requestBody})}>
                <div className='config-card-title'>Response Body</div>
                <hr/>
                {path.docs && path.docs['Response Body'] && <div>{Object.keys(flattenObject(path.docs['Response Body'])).map((k) => {
                  return <div key={k}>
                    <div className='config-card-val'>
                      <div className='val-name'>{k}</div>
                      <div>
                        <div className='config-card-desc'>{_.get(path.docs['Response Body'], k)}</div>
                      </div>
                    </div>
                  </div>
                })}</div>}
                <hr/>
                <div className='config-body'>
                  {fetching && <div className='resp resp-ok fetching'><i className="fas fa-spinner fa-spin"></i> fetching...</div>}
                  {responseStatus && <div className={clsx({'resp': true, 'resp-ok': responseOK, 'resp-error': !responseOK})}>Status: {responseStatus}</div>}
                  <JSONEditor jsonValue={responseBody} />
                </div>
              </div>
            </div>

          </div>
      </div>}
  </li>
}

