import React, { useEffect, useState, useRef, useMemo } from 'react'
import clsx from 'clsx'
import _ from 'lodash'
import EntityDataGroupContainer from './EntityDataGroupContainer'
import { makePromiseIgnorable } from '../../IpaUtils/helpers'



export const useEntityData = (collapsable, collapsed, entity, config, getData, dataGroupName) => {
  const [reloadToken, setReloadToken] = useState(false)
  const [ignorable, setIgnorable] = useState()
  const myIntervals = useRef([])

  const key = useMemo(() => JSON.stringify([collapsable, collapsed, entity, config, dataGroupName]),[collapsable, collapsed, entity, config, dataGroupName])

  const [data, setData] = useState({
    [key]: {
      fetching: false,
      error: null,
      data: null,
    },
  })
  const isDataVisible = !collapsable || !collapsed 

  const handleSetData = (values) => setData((prevValue) => ({
    ...prevValue,
    [key]: {
      ...(prevValue?.[key] && prevValue[key]),
      ...values
    }
  }))

  const getContainerData = async (collapsable, entity, config, getData, dataGroupName) => {
    reset();
    try {
      handleSetData({fetching: true})

      if(!entity) {
        throw new Error("No entity data")
      }
      
      const isDataVisible = !collapsable || !collapsed
      let data = []
      if(config?.isProperties) {
        data = entity?.properties
        
      } else if(isDataVisible && dataGroupName) {
        handleSetData({fetching: true})

        //makePromiseIgnorable is necessary to avoid data from a previous promise of another dataGroup to resolve and input it's data into the wrong component
        const ignorable = makePromiseIgnorable(getData(dataGroupName, entity))
        setIgnorable(ignorable); //necessary to be able to ignore the promise if another has been thrown.
        data = await ignorable.promise;
      }
      handleSetData({ data, fetching: false, error: false })
    } catch(err) {
      if(!err?.isIgnored) {
        console.error(err);
        handleSetData({data: null, fetching: false, error: err})
      }
    }
  }

  

  const initiateFirstFetching = () => {
    if(isDataVisible) { //We load the data only if it is visible
      getContainerData(collapsable, entity, config, getData, dataGroupName);
    }
  }

  const startFetchingLoop = () => {
    let interval = undefined;
    if (config?.refreshInterval && isDataVisible) {
      if (config.refreshInterval < config.scriptExpiration) {
        console.warn('Refresh Interval is less than Script Expiration which will cause cached data to be used instead fetching new data!')
      }
      interval = setInterval(() => {
        getContainerData(collapsable, entity, config, getData, dataGroupName);
      }, config.refreshInterval * 60000)

      myIntervals.current.push(interval);
    }

    return interval
  }

  useEffect(() => {

    initiateFirstFetching();
    
    const loop = startFetchingLoop();
    
    return () => {
      if (loop) clearInterval(loop)
    }
  }, [entity, dataGroupName, reloadToken, collapsed])

  const reload = () => {
    setReloadToken(!reloadToken)
  }

  const reset = () => {
    myIntervals.current.forEach(interval=>clearInterval(interval));
    handleSetData({data: null, error: null, fetching: false})
    if(ignorable) {
      ignorable.ignore()
      setIgnorable(undefined)
    }
  }

  return {reset, reload, data: data[key]?.data === undefined ? null : data[key]?.data , fetching: data[key]?.fetching === undefined ? true : data[key].fetching , error: data[key]?.error === undefined ? null : data[key].error}
}

const EntityDataContainer = props => {
  const [collapsed, setCollapsed] = useState(
    props.config.hasOwnProperty('isProperties')
      ? !props.config.isProperties
      : true
  )

  const {data, fetching, error, reset, reload} = useEntityData(
    props.collapsable,
    collapsed,
    props.entity,
    props.config,
    props.getData,
    props.dataGroupName,
  )

  const toggleCollapsed = async () => {
    if (collapsed) {
      reload()
    } else {
      reset()
    }

    setCollapsed(!collapsed)
  }

  return (
    <div className='entity-data-container'>
      <h1 className='entity-data-stack-title'>
        {props.dataGroupName}
        {props.collapsable && (
          <div
            className={clsx({
              'entity-data-toggle': true,
              'entity-data-toggle-collapsed': collapsed
            })}
          >
            <i onClick={toggleCollapsed} className='fa fa-angle-down' />
          </div>
        )}
      </h1>
      {(!props.collapsable ||
        (props.collapsable && !collapsed)) ? (
        <div
          className={clsx({
            'entity-data-content': false,
            'entity-data-content-collapsed': false
          })}
        >
          <EntityDataGroupContainer config={props.config} fetching={fetching} data={data} context={props.entity}/>
        </div>
      ) : null}
    </div>
  )
}

export default EntityDataContainer