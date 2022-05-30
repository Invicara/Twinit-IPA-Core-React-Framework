import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

//import ENTITY_DATA_COMPONENTS from "./EntityDataComponents"
import { getEntityDataComponent } from '../../redux/slices/entityUI'
import clsx from 'clsx'
import _, { rest } from 'lodash'
import EntityDataGroupContainer from './EntityDataGroupContainer'

export const useEntityData = (collapsable, entity, config, getData, dataGroupName) => {
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [myInterval, setMyInterval] = useState(null)
  const [reloadToken, setReloadToken] = useState(false)

  const getContainerData = async (_collapsable, _entity, _config, _getData, _dataGroupName) => {
    try {
      setFetching(true);

      if(!_entity) {
        throw new Error("No entity data")
      }
      
      let data = []
      if(_config?.isProperties) {
        data = _entity?.properties
      } else if(!_collapsable && _dataGroupName) {
        data = await _getData(_dataGroupName, _entity)
      }
      setData(data)
      setError(undefined)
    } catch(err) {
      console.error(err);
      setError(err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await getContainerData(collapsable, entity, config, getData, dataGroupName)

      if (config?.refreshInterval) {
        if (config.refreshInterval < config.scriptExpiration)
          console.warn(
            'Refresh Interval is less than Script Expiration which will cause cached data to be used instead fetching new data!'
          )
        let myInterval = setInterval(() => {
          getContainerData(collapsable, entity, config, getData, dataGroupName)
        }, config.refreshInterval * 60000)
        setMyInterval(myInterval)
      }
    })()

    return () => {
      if (myInterval) clearInterval(myInterval)
    }
  }, [entity, dataGroupName, reloadToken])

  const reload = () => {
    setReloadToken(!reloadToken)
  }

  const reset = () => {
    setFetching(false)
    setData(null)
    setMyInterval(null)
    setReloadToken(false)
  }

  return [data, fetching, error, reset, reload]
}

const EntityDataContainer = props => {
  const [collapsed, setCollapsed] = useState(
    props.config.hasOwnProperty('isProperties')
      ? !props.config.isProperties
      : true
  )

  const [data, fetching, error, reset, reload] = useEntityData(
    props.collapsable,
    props.entity,
    props.config,
    props.getData,
    props.dataGroupName
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
          <EntityDataGroupContainer config={props.config} fetching={fetching} data={data}/>
        </div>
      )}
    </div>
  )
}

const mapStateToProps = state => ({})

const mapDispatchToProps = {
  getEntityDataComponent
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  EntityDataContainer
)
