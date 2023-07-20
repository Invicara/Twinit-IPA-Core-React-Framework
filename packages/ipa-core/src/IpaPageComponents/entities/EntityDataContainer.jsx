import React, { useEffect, useState, useRef } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

//import ENTITY_DATA_COMPONENTS from "./EntityDataComponents"
import { getEntityDataComponent } from '../../redux/slices/entityUI'
import clsx from 'clsx'
import _, { rest } from 'lodash'
import EntityDataGroupContainer from './EntityDataGroupContainer'
import { makePromiseIgnorable } from '../../IpaUtils/helpers'


export const useEntityData = (collapsable, collapsed, entity, config, getData, dataGroupName) => {
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [reloadToken, setReloadToken] = useState(false)
  const [ignorable, setIgnorable] = useState()
  const myIntervals = useRef([])

  const isDataVisible = !collapsable || !collapsed 

  const getContainerData = async (collapsable, entity, config, getData, dataGroupName) => {
    reset();
    try {
      setFetching(true)

      if(!entity) {
        throw new Error("No entity data")
      }
      
      const isDataVisible = !collapsable || !collapsed
      let data = []
      if(config?.isProperties) {
        data = entity?.properties
      } else if(isDataVisible && dataGroupName) {
        setFetching(true)
        //makePromiseIgnorable is necessary to avoid data from a previous promise of another dataGroup to resolve and input it's data into the wrong component
        const ignorable = makePromiseIgnorable(getData(dataGroupName, entity))
        setIgnorable(ignorable); //necessary to be able to ignore the promise if another has been thrown.
        data = await ignorable.promise;
      }

      setData(data)
      setError(undefined)
      setFetching(false)
    } catch(err) {
      if(!err?.isIgnored) {
        console.error(err);
        setError(err)
        setFetching(false)
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
    setFetching(false)
    setData(null)
    setError(null)
    if(ignorable) {
      ignorable.ignore()
      setIgnorable(undefined)
    }
    //setReloadToken(false)
  }

  return {data, fetching, error, reset, reload}
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
        (props.collapsable && !collapsed)) && (
        <div
          className={clsx({
            'entity-data-content': false,
            'entity-data-content-collapsed': false
          })}
        >
          <EntityDataGroupContainer config={props.config} fetching={fetching} data={data} context={props.entity}/>
        </div>
      )}
    </div>
  )
}

/*
const mapStateToProps = state => ({})

const mapDispatchToProps = {
  getEntityDataComponent
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  EntityDataContainer
)
*/

export default EntityDataContainer