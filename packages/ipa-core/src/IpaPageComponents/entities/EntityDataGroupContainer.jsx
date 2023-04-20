import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

//import ENTITY_DATA_COMPONENTS from "./EntityDataComponents"
import { getEntityDataComponent } from '../../redux/slices/entityUI'
import clsx from 'clsx'
import _ from 'lodash'


const EntityDataGroupContainer = (props) => {
    const getArrayWithoutHiddenData = config => {
        const hidden = config.component.hidden || []
        const indexesToHide = hidden.map(e => _.findIndex(props.data[0], o => o == e))
        return props.data.map(e =>
          Array.isArray(e)
            ? e.filter((o, index) => !indexesToHide.includes(index))
            : e
        )
      }
    
      const getObjectWithoutHiddenData = config => {
        return _.omit(props.data, ...(config.component.hidden || []))
      }
    
      const getEntityData = config => {
        return config.component.hidden
          ? Array.isArray(props.data)
            ? getArrayWithoutHiddenData(config)
            : getObjectWithoutHiddenData(config)
          : props.data
      }
    
      if (props.fetching) return <SimpleTextThrobber throbberText='Retrieving data' />
      else if (props.data == null || (Array.isArray(props.data) && props.data.length == 0))
        return <div>No data</div>

      let factory = props.getEntityDataComponent(props.config?.component?.name)
      if (!factory) {
        console.error('No factory for ' + props.config?.component?.name)
        return null
      }
      const component = factory.create({
        config: props.config.component,
        data: getEntityData(props.config)
      })
    
      return <>{component}</>
}


const mapStateToProps = state => ({})

const mapDispatchToProps = {
  getEntityDataComponent
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
    EntityDataGroupContainer
)


