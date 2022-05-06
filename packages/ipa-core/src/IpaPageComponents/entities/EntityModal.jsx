/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2018] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React from 'react'
import _ from 'lodash'
import * as PropTypes from 'prop-types'
import DatePicker from 'react-date-picker'
import DateTimePicker from 'react-datetime-picker'
import clsx from 'clsx'

import GenericMatButton from '../../IpaControls/GenericMatButton'
import { ScriptedLinkedSelects } from '../../IpaControls/EnhancedScriptedLinkedSelects'
import { ControlProvider } from '../../IpaControls/ControlProvider'

import produce from 'immer'

import GenericModal from '../../IpaDialogs/GenericModal'
import '../../lib/mobiscroll.scss'
import './EntityModal.scss'
import EntityModalTextInput from './EntityModalTextInput'
import ControlTextOverlay from '../../IpaControls/ControlTextOverlay'
import { connect } from 'react-redux'
import CollapsibleTextInput from '../../IpaControls/CollapsibleTextInput'
import { FormControlLabel } from '@material-ui/core'
import { PinkCheckbox } from '../../IpaControls/Checkboxes'
import * as modal from '../../redux/slices/modal'
class EntityModal extends React.Component {



  INITIAL_STATE = {
    intialNewEntity: null,
    newEntity: null,
    working: false,
    typeMapKeys: [],
    typeMap: {},
    error: null,
    formError: null,
    modalOpen: false,
    shouldLoadForm: true,
    config: {}
  }
  constructor (props) {
    super(props)

    this.state = this.INITIAL_STATE
  }

  async componentDidMount () {
    try {
      this.initiateModal()
    } catch(err) {
      if (err.message === 'ENTITY_NOT_VALID') {
        this.setState({
          shouldLoadForm: false,
          error: (
            <div className='entity-modal-error-container'> 
              <div>
                Cannot edit, selected entities have different properties, or they are missing properties. You should check you project's configuration
              </div>
              <GenericMatButton
                onClick={this.onCancel}
                disabled={this.state.working}
                styles={{ marginRight: '15px' }}
              >
                Go back
              </GenericMatButton>
            </div>
          )
        })
      }
    }
    
  }

  resetState = () => {
    this.setState(this.INITIAL_STATE)
  }

  initiateModal = (overridingState = {}) => {

    if(this.props.action.name === 'Edit' && !this.checkEntityIsValid()) {
      throw new Error("ENTITY_NOT_VALID")
    }

    this.setState({
      ...this.INITIAL_STATE,
      modalOpen: true,
      ...overridingState
    })

    let intialNewEntity = this.getControlValues()
    this.setState({intialNewEntity})
  }

  shouldDisableAllControls = _.memoize(
    () => this.state?.working || !!this.props.action?.component?.disableAll,
    () =>
      `${this.state?.working == true}_${this.props.action?.component
        ?.disableAll == true}`
  )

  normalizeEntityProperties = entity => {
    let normalizedEntity = {}
    _.defaultsDeep(normalizedEntity, entity)

    Object.keys(normalizedEntity.properties).forEach(pk => {
      if (!normalizedEntity.properties[pk].val) {
        normalizedEntity.properties[pk] = {
          ...normalizedEntity.properties[pk],
          val: ''
        }
      }
    })
    return normalizedEntity
  }

  getBulkEntityProperties = entities => {
    if (this.props.action.name !== "Create" && entities.length === 0) {
      throw new Error('No entity to edit')
    }

    let bulkEntityProperties = {
      ...this.normalizeEntityProperties(entities[0]).properties
    }

    if (entities.length > 1) {
      Object.entries(bulkEntityProperties).forEach(([key, value]) => {
        let entitiesValues = entities.map(
          entity => this.normalizeEntityProperties(entity).properties[key].val
        )
        let keepBulkProperty = entitiesValues.every(val => val === value.val)

        if (keepBulkProperty) {
          bulkEntityProperties[key] = {
            ...bulkEntityProperties[key],
            hasMultipleValues: false
          }
        } else {
          bulkEntityProperties[key] = {
            ...bulkEntityProperties[key],
            val: entitiesValues,
            hasMultipleValues: true
          }
        }
      })
    }

    return bulkEntityProperties
  }

  isBulkEdit = () => _.isArray(this.props.entity) && this.props.entity.length > 1

  getBulkEntity = entities => ({
    'Entity Name': entities.map(entity => entity['Entity Name']),
    properties: this.getBulkEntityProperties(entities)
  })

  checkEntitiesHaveSameProperties = (entities) => {
    let propertyKeys = []

    let i = 0
    let differenceFound = false

    while(i < entities.length && !differenceFound) {
      let entity = entities[i];
      if(i === 0) {
        propertyKeys = Object.keys(entity.properties)
      } else {
        differenceFound = !_.isEqual(_.sortBy(propertyKeys), _.sortBy(Object.keys(entity.properties)))
      }
      i++;
    }
    return !differenceFound
  }

  canEditEntityProperty = (entity, propertyKey) => {
    let isHidden = _.defaultTo(this.props.action?.component?.hidden, [])
      .find(prop => prop === propertyKey);
    if(isHidden) {
      return true;
    }

    let propertyUiType = this.props.action?.component?.propertyUiTypes?.[propertyKey]
    if (propertyUiType) {
      let Control = ControlProvider.getControlComponent(propertyUiType)
      if(Control) return true
    }

    let propType = entity?.properties[propertyKey]?.type

    if(!propType) {
      console.warn("Property ", propertyKey, " from entity ", entity?.['EntityName'], " is missing a type or a propertyUiTypes in the user config")
    }
    
    return !!propType;
  }

  isEntityMissingProperties = (entity) => {
    let propertyUiTypes = this.props.action?.component?.propertyUiTypes 
    propertyUiTypes = _.isObject(propertyUiTypes) ? propertyUiTypes : {};

    let propertyUiTypesProperties = Object.keys(propertyUiTypes);
    let groupedProperties = _.flatten(_.values(this.props.action.component.groups))

    const hiddenProps = this.props.action.component?.hidden || [];

    let neededProperties = _.difference([...groupedProperties, ...propertyUiTypesProperties], hiddenProps);
    
    let propertyKeys = Object.keys(entity.properties)

    let missingProperties = _.difference(neededProperties, propertyKeys)
    let isMissingProperties = missingProperties.length > 0;

    if(isMissingProperties){
      let entityName = entity?.["Entity Name"];
      console.warn("Entity ", entityName, " is missing the following properties : ", missingProperties)
    }

    return isMissingProperties;
  }

  canEditEntityProperties = (entity) => {
    let entityIsMissingProperties = this.isEntityMissingProperties(entity);

    let canEditAllEntityProperties = Object.keys(entity.properties).every(key => this.canEditEntityProperty(entity, key))

    return !entityIsMissingProperties && canEditAllEntityProperties;
  }


  checkEntityIsValid = () => {
    let entities = []
    if(_.isArray(this.props.entity)) {
      entities = [...this.props.entity]
    } else {
      entities = [this.props.entity]
    }


    if(!this.checkEntitiesHaveSameProperties(entities)) {
      console.warn("Entities do not have the same properties")
      return false
    }

    return entities.every(this.canEditEntityProperties);
  }

  getControlValues = () => {
    let entity
    let newEntity
    if (_.isArray(this.props.entity)) {
      entity = !!this.props.entity ? this.props.entity : []
      try {
        newEntity = this.getBulkEntity(entity)
      } catch (err) {
        if (err.message === 'No entity to edit') {
          this.setState({
            shouldLoadForm: false,
            error: (
              <div className='entity-modal-error-container'> 
                <div>
                  No entity selected
                </div>
                <GenericMatButton
                  onClick={this.onCancel}
                  disabled={this.state.working}
                  styles={{ marginRight: '15px' }}
                >
                  Go back
                </GenericMatButton>
              </div>
            )
          })
        } else {
          this.setState({
            error: (
              <>
                <div className='entity-modal-error'>
                  An unexpected error happened, please try again later.
                </div>
                <GenericMatButton
                  onClick={this.onCancel}
                  disabled={this.state.working}
                  styles={{ marginRight: '15px' }}
                >
                  Go back
                </GenericMatButton>
              </>
            )
          })
        }
      }
    } else {
      entity = !!this.props.entity ? this.props.entity : {}
      newEntity = this.normalizeEntityProperties(entity)
    }

    this.setState({ newEntity })
    return newEntity
  }

  onChangeMulti = attObj => {
    let atts = Object.keys(attObj)

    const newMultiUpdatedEntity = atts.reduce(
      (partiallyUpdatedEntity, att) =>
        this.getNewUpdatedEntity(
          partiallyUpdatedEntity,
          att,
          partiallyUpdatedEntity.properties[att],
          attObj[att]
        ),
      this.state.newEntity
    )
    this.setState({ newEntity: newMultiUpdatedEntity })
  }

  onChange = (att, propInfo, value) => {
    const newEntity = this.getNewUpdatedEntity(
      this.state.newEntity,
      att,
      propInfo,
      value
    )
    this.setState({ newEntity })
  }

  getNewUpdatedEntity (originalEntity, att, propInfo, value) {
    return produce(originalEntity, newEntity => {
      if (Array.isArray(value) && propInfo.type !== 'tags') value = value[0]

      if (propInfo && propInfo.type === 'tags' && value === undefined)
        value = []

      if(newEntity?.properties?.[att]) {
        newEntity.properties[att].hasMultipleValues = false
      }

      if (att === 'name') {
        newEntity['Entity Name'] = value
      } else if (propInfo.type === 'date' || propInfo.type === 'datetime') {
        const epoch = !!value ? value.getTime() : null
        const localeString = !!value ? new Date(value).toLocaleDateString() : ""
  
        newEntity.properties[att].epoch = epoch;
        newEntity.properties[att].val = localeString;
      } else {
        newEntity.properties[att].val = value
      }
    })
  }

  close = () => {
    this.props.destroyModal()
  }

  onCancel = async () => {
    if (this.props.action.onCancel) this.props.action.onCancel()
    this.close()
  }

  hasAllRequiredProperties = entity => {
    let pass = true

    if (!entity['Entity Name']) pass = false
    else {
      if (this.props.action.component.requiredProperties) {
        let propNames = Object.keys(entity.properties)

        for (let i = 0; i < propNames.length; i++) {
          let prop = entity.properties[propNames[i]];
          if (
            this.propIsRequired(prop.dName) &&
            !prop.val
          ) {
            pass = false
            break
          }
        }
      }
    }

    return pass
  }

  mergeEntityWithActionResult = (actionName, entity, createResult) => {
    if (actionName !== 'Create') return entity
    return { ...entity, ...createResult }
  }

  prepareEntityForAction = entity => {
    let newEntity = _.cloneDeep(entity)

    if(_.isArray(newEntity['Entity Name'])) {
      newEntity['Entity Name'] = newEntity['Entity Name'].map(name => name.trim())
    } else {
      newEntity['Entity Name'] = newEntity['Entity Name'].trim()
    }
    Object.keys(newEntity.properties).forEach(prop => {
      let propertyCanBeTrimmed =
        newEntity.properties[prop].val &&
        newEntity.properties[prop].type === 'text'
      newEntity.properties[prop].val = propertyCanBeTrimmed
        ? newEntity.properties[prop].val.trim()
        : newEntity.properties[prop].val
    })

    if (!this.hasAllRequiredProperties(newEntity)) {
      throw new Error('MISSING_REQUIRED_PROPERTIES')
    } else {
      return newEntity
    }
  }

  doEntityAction = async (newEntity, oldEntity) => {
    let result = await this.props.action.doEntityAction(
      this.props.action.name,
      { new: newEntity, original: oldEntity }
    )
    this.setState({ working: false })

    if (result.success) {
      let mergedEntity = this.mergeEntityWithActionResult(
        this.props.action.name,
        newEntity,
        result.result
      )

      return result
      
    } else {
      this.props.action.onError?.(this.props.action.type, result, newEntity)
      throw new Error(result.message)
    }
  }

  filterObjectProperties = (initialObject, filterCallback) => {
    return Object.entries(initialObject)
      .filter(filterCallback)
      .reduce((obj, [key]) => {
        obj[key] = initialObject[key]
        return obj
      }, {})
  }

  prepareEntityAndDoAction = async (onlyOnChangedEntity = false) => {
    if (this.props.action.doEntityAction) {
      if (_.isArray(this.props.entity)) {
        let preparedEntities = []
        let oldEntities = []
        this.props.entity.forEach(entity => {
          let newProperties = this.filterObjectProperties(
            this.state.newEntity.properties,
            ([propertyKey, propertyValue]) =>
              propertyValue.hasMultipleValues === false
          )
          const countNewProperties = Object.keys(newProperties).length
          if (onlyOnChangedEntity === false || countNewProperties > 0) {
            let newEntity = {
              ...entity,
              properties: { ...entity.properties, ...newProperties }
            }
            preparedEntities.push(this.prepareEntityForAction(newEntity))
            oldEntities.push(entity)
          }
        })

        let entityActionPromises = preparedEntities.map((preparedEntity, i) =>
          this.doEntityAction(preparedEntity, oldEntities[i])
        )

        let results = await Promise.all(entityActionPromises)
        this.props.action.onSuccess?.(
          this.props.action.type,
          preparedEntities,
          results[0]
        )
      } else {
        let preparedEntity = this.prepareEntityForAction(this.state.newEntity)
        let result = await this.doEntityAction(preparedEntity, this.props.entity)
        this.props.action.onSuccess?.(
          this.props.action.type,
          preparedEntity,
          result
        )
      }
      
      this.close()
      this.resetState();
    }
  }

  startEdit = async () => {
    if(_.isEqual(this.state.intialNewEntity, this.state.newEntity)) {
      this.close()
      return
    }    

    try {
      await this.prepareEntityAndDoAction(true);
    } catch (err) {
      let formErrorMessage =
        'Unexpected error while preparing the entities for saving, please try again later'
      
      switch(err.message) {
        case "MISSING_REQUIRED_PROPERTIES":
          formErrorMessage = 'Required properties are missing values!'
          break;
        default:
          formErrorMessage = err.message
          break;
      }
      const formError = <div className='entity-modal-error'>{formErrorMessage}</div>
      this.setState({formError})
    }
  }

  startCreate = async () => {
    try {
      await this.prepareEntityAndDoAction(true);
    } catch (err) {
      let formErrorMessage =
        'Unexpected error while preparing the entities for saving, please try again later'
      
      switch(err.message) {
        case "MISSING_REQUIRED_PROPERTIES":
          formErrorMessage = 'Required properties are missing values!'
          break;
        default:
          formErrorMessage = err.message
          break;
      }
      const formError = <div className='entity-modal-error'>{formErrorMessage}</div>
      this.setState({formError})
    }
  }

  startDelete = async () => {
    try {
      await this.prepareEntityAndDoAction();
    } catch (err) {
      let formErrorMessage =
        'Unexpected error while preparing the entities for deletion, please try again later'
      
      switch(err.message) {
        case "MISSING_REQUIRED_PROPERTIES":
          formErrorMessage = 'Required properties are missing values!'
          break;
        default:
          formErrorMessage = err.message
          break;
      }
      const formError = <div className='entity-modal-error'>{formErrorMessage}</div>
      this.setState({formError})
    }
  }

  onConfirm = async () => {
    this.setState({ working: true, error: null, formError: null })
    switch(this.props.action.name) {
      case "Edit":
        await this.startEdit();
        break;
      case "Create":
        await this.startCreate();
        break;
      case "Delete":
        await this.startDelete();
        break;
      default:
        console.warn("Unexpected action name : ", this.props.action.name);
        break;
      }
      this.setState({working: false})
  }

  dashPropDName = propDName => {
    if(!_.isString(propDName)) return propDName
    return propDName.split(' ').join('-')
  }

  propIsRequired = prop => {
    let componentCfg = this.props.action.component
    let hasReqProps = !!componentCfg.requiredProperties

    return hasReqProps && componentCfg.requiredProperties.includes(prop)
  }

  canEditProperty = (entity, propertyKey) => {
    let propType = entity?.properties[propertyKey]?.type
    if(!propType) {
      return false
    }

    let propertyUiType = this.props.action?.component?.propertyUiTypes?.[propertyKey]

    if (propertyUiType) {
      let Control = ControlProvider.getControlComponent(propertyUiType)
      return !!Control
    }

    return true;
  }

  getControl = prop => {
    let { newEntity } = this.state
    

    let propInfo = this.state.newEntity.properties[prop]
    let propType = propInfo && propInfo.type ? propInfo.type : 'missing'
    let disableControl =
      this.shouldDisableAllControls() ||
      this.props?.action?.component?.disabled?.includes(prop) ||
      this.isBulkEdit() && this.props?.action?.component?.disabledInMulti?.includes(prop);


    switch (propType) {
      case 'number':
      case 'tags':
      case 'text': {
        if (this.props.action?.component?.propertyUiTypes?.[prop]) {
          let Control = ControlProvider.getControlComponent(
            this.props.action.component.propertyUiTypes[prop]
          )

          if (!Control)
            return (
              <div key={prop}>
                Configured propertyUiType Component for {prop} Doesn't Exist
              </div>
            )
          else {
            let currentValue = {}
            currentValue[prop] = Array.isArray(propInfo.val)
              ? propInfo.val
              : [propInfo.val]

            return (
              <div
                key={propInfo.dName + '_div'}
                className={clsx(
                  this.dashPropDName(propInfo.dName) + '-div',
                  this.propIsRequired(prop) && 'required'
                )}
              >
                <div className='entity-property-control-row'>
                  <Control
                    {...this.props.action.component.propertyUiTypes[prop]}
                    currentValue={
                      propInfo.hasMultipleValues ? undefined : currentValue
                    }
                    onChange={e => this.onChange(prop, propInfo, e[prop])}
                    noFetch={true}
                    highlightedOptions={
                      propInfo.hasMultipleValues ? propInfo.val : []
                    }
                    placeholder={
                      propInfo.hasMultipleValues && (
                        <ControlTextOverlay text='Multiple values' />
                      )
                    }
                    id={prop}
                    filterInfo={
                      this.props.action.component.propertyUiTypes[prop]
                        .queryFilter
                        ? newEntity
                        : null
                    }
                    disabled={disableControl}
                  />
                  {!!this.state.newEntity.properties[prop].uom && (
                    <span className='property-uom'>
                      {this.state.newEntity.properties[prop].uom}
                    </span>
                  )}
                </div>
              </div>
            )
          }
        } else {
          return (
            <div
              key={propInfo.dName + '_div'}
              className={clsx(
                this.dashPropDName(propInfo.dName) + '-div',
                this.propIsRequired(prop) && 'required'
              )}
            >
              <EntityModalTextInput
                className='entity-property-control-row'
                key={prop}
                labelProps={{
                  text: prop
                }}
                inputProps={{
                  type: propInfo.type,
                  value: propInfo.hasMultipleValues ? undefined : propInfo.val,
                  onChange: e => this.onChange(prop, propInfo, e.target.value),
                  disabled: disableControl
                }}
                hasMultipleValues={propInfo.hasMultipleValues}
              />
              {!!this.state.newEntity.properties[prop].uom && (
                <span className='property-uom'>
                  {this.state.newEntity.properties[prop].uom}
                </span>
              )}
            </div>
          )
        }
      }

      case 'date': {
        let displayDate = !!this.state.newEntity.properties[prop].epoch
          ? new Date(this.state.newEntity.properties[prop].epoch)
          : null
        return (
          <div
            key={propInfo.dName + '_div'}
            className={clsx(
              this.dashPropDName(propInfo.dName) + '-div',
              this.propIsRequired(prop) && 'required'
            )}
          >
            <label style={{ margin: '10px', fontWeight: 'bold' }}>{prop}</label>
            <div className='entity-property-control-row'>
              <ControlTextOverlay
                text='Multiple values'
                textStyle={{ backgroundColor: 'white' }}
                hide={!propInfo.hasMultipleValues}
              >
                <DatePicker
                  key={prop}
                  onChange={e => this.onChange(prop, propInfo, e)}
                  value={displayDate}
                  className='form-control'
                  calendarIcon={null}
                  disabled={disableControl}
                />
              </ControlTextOverlay>
            </div>
          </div>
        )
      }

      case 'datetime': {
        let displayDate = !!this.state.newEntity.properties[prop].epoch
          ? new Date(this.state.newEntity.properties[prop].epoch)
          : null
        return (
          <div
            key={propInfo.dName + '_div'}
            className={clsx(
              this.dashPropDName(propInfo.dName) + '-div',
              this.propIsRequired(prop) && 'required'
            )}
          >
            <label style={{ margin: '10px', fontWeight: 'bold' }}>{prop}</label>
            <div className='entity-property-control-row'>
              <DateTimePicker
                key={prop}
                onChange={e => this.onChange(prop, propInfo, e)}
                value={displayDate}
                className='form-control'
                calendarIcon={null}
                disableClock={true}
                disabled={disableControl}
              />
            </div>
          </div>
        )
      }

      case 'boolean': {
        // let value = this.state.newEntity.properties[prop].val
        //   ? this.state.newEntity.properties[prop].val
        //   : false

        let value = propInfo.val
        let multipleValues = _.isArray(value) && value.length > 1
        let checked = multipleValues ? checked : !!value;
        let shouldDisplayValueAsLabel = ![true, false, undefined, null].includes(value) 
        let label = shouldDisplayValueAsLabel ? value.toString() : ""; 
        label = multipleValues ? "Multiple values" : label;
        return (
          <div
            key={propInfo.dName + '_div'}
            className={clsx(
              this.dashPropDName(propInfo.dName) + '-div',
              this.propIsRequired(prop) && 'required'
            )}
          >
            <label style={{ margin: '10px', fontWeight: 'bold' }}>{prop}</label>
            <div className='entity-property-control-row'>
              <FormControlLabel control={
                  <PinkCheckbox
                    checked={checked}
                    id={propInfo.dName}
                    indeterminate={multipleValues}
                    onChange={e => this.onChange(prop, propInfo, e.target.checked)}
                  />
                }
                label={label}
              />
            </div>
          </div>
        )
      }

      case 'missing': {
        return (
          <div
            key={prop + '_div'}
            className={clsx(this.dashPropDName(prop) + '-div')}
          >
            <label style={{ margin: '10px', fontWeight: 'bold' }}>{prop}</label>
            <div className='entity-property-control-row'>
              <div style={{ color: 'red' }}>
                {prop + ' is missing a valid property type configuration'}
              </div>
            </div>
          </div>
        )
      }

      default: {
        return null
      }
    }
  }

  getScriptedHierarchyInputs = () => {
    let selects = this.props.action.component.hierarchySelects.selects

    selects = selects.map((s) => {
      let newS = {...s};
      if (this.propIsRequired(s.display)) newS.required = true
      return newS
    })

    let currentValue = {}
    let selectKeys = selects.map(select => select.display)

    let highlightedOptions = {}

    let placeholders = {}

    selectKeys.forEach(propertyKey => {
      const property = this.state.newEntity.properties[propertyKey]
      const value = property.hasMultipleValues ? undefined : [property.val]
      placeholders[propertyKey] = property.hasMultipleValues && (
        <ControlTextOverlay text='Multiple values' />
      )
      highlightedOptions[propertyKey] = property.hasMultipleValues
        ? property.val
        : undefined
      currentValue[propertyKey] = value
    })

    const isAlwaysDisabled = _.isArray(this.props.action?.component?.disabled) &&
      selectKeys.some(prop =>
        this.props.action.component.disabled.includes(prop)
      )

    const isDisabledInBulkEdit = this.isBulkEdit() &&
      _.isArray(this.props.action?.component?.disabledInMulti) &&
      selectKeys.some(prop =>
        this.props.action.component.disabledInMulti.includes(prop)
      )

    const disabled = this.shouldDisableAllControls() || 
      isAlwaysDisabled || 
      isDisabledInBulkEdit

    return (
      <div>
        <hr />
        <ScriptedLinkedSelects
          currentValue={currentValue}
          onChange={this.onChangeMulti}
          noFetch={true}
          highlightedOptions={highlightedOptions}
          placeholders={placeholders}
          disabled={disabled}
          selects={selects}
        />
      </div>
    )
  }

  render () {

    let body = null
    let entityType = 'Entity'
    if (this.props.type && this.props.type.singular)
      entityType = this.props.type.singular

    if (this.state.newEntity) {
      const groups = this.getGroups()
      let name = this.state.newEntity['Entity Name']
      const multipleValues = _.isArray(name) && name.length > 1
      const valuesCount = multipleValues && name.length;
      name = multipleValues ? name.join('; ') : name
      const shouldDisableControl = this.shouldDisableAllControls() || 
        multipleValues ||
        this.props.action.component.disabled?.includes('Entity Name') ||
        this.isBulkEdit() && this.props.action.component.disabledInMulti?.includes('Entity Name')
        

      const InputComponent = multipleValues ? CollapsibleTextInput : EntityModalTextInput;

      body = (
        <div className='entity-modal-body'>
          <div key={'namediv'} className='required'>
            <InputComponent
              labelProps={{
                text: `${entityType} Name`,
              }}
              inputProps={{
                collapsedText: multipleValues ? `Multiple ${this.props.type.plural} (${valuesCount})` : name,
                key: 'entityname',
                type: "text",
                onChange: (e) => {
                  this.onChange('name', null, e.target.value);
                },
                value: name,
                disabled: shouldDisableControl
              }}
            />
          </div>
          <div id='hierarchy-selects'>
            {this.props.action.component.hierarchySelects &&
              this.getScriptedHierarchyInputs()}
          </div>
          {!this.props.action.component.showGroupNames && <hr />}
          <div>
            {_.keys(groups)
              .filter(groupName => groups[groupName].length > 0)
              .map(groupName => (
                <div key={groupName}>
                  {this.props.action.component.showGroupNames && (
                    <div className={'group-name'}>{groupName}</div>
                  )}
                  {groups[groupName]
                    .filter(
                      prop =>
                        !(this.props.action.component.hidden || []).includes(
                          prop
                        )
                    )
                    .map(prop => this.getControl(prop))}
                </div>
              ))}
          </div>
        </div>
      )
    }

    let modalBody = (
      <div className='mbsc-grid'>
        {this.state.error || (
          <>
            {body}
            <hr />
            {this.state.formError}
            <div
              style={{
                width: '100%',
                display: 'inline-flex',
                justifyContent: 'flex-end',
                marginTop: '20px'
              }}
            >
              <GenericMatButton
                onClick={this.onCancel}
                disabled={this.state.working}
                styles={{ marginRight: '15px' }}
              >
                Cancel
              </GenericMatButton>
              <GenericMatButton
                onClick={this.onConfirm}
                disabled={this.state.working}
                customClasses='attention'
              >
                {this.props.action.component.okButtonText
                  ? this.props.action.component.okButtonText
                  : 'OK'}
              </GenericMatButton>
            </div>
          </>
        )}
        
      </div>
    )

    let title = <span>{this.props.action.name + ' ' + entityType}</span>

    return <GenericModal
      title={title}
      customClasses={'ipa-modal ipa-modal-no-x-close'}
      modalBody={modalBody}
    />
  }

  getGroups () {
    const hiddenProps = this.props.action.component?.hidden || []
    const allProps = _.difference(_.keys(this.state.newEntity.properties), hiddenProps)
    const groupedProps = _.difference(_.flatten(_.values(this.props.action.component.groups)), hiddenProps)
    const otherProps = _.difference(allProps, groupedProps)

    let groups = {...this.props.action.component.groups};
    if(otherProps) {
      groups["Other"] = otherProps;
    }
    return groups
  }
}

const mapStateToProps = state => ({
  modal: state.modal
})

const mapDispatchToProps = {
  destroyModal: modal.actions.destroy
}



EntityModal.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefSnapper: PropTypes.object,
  ifefNavDirection: PropTypes.string,
  ifefShowPopover: PropTypes.func,
  ifefUpdatePopover: PropTypes.func,
  ifefUpdatePopup: PropTypes.func,
  ifefShowModal: PropTypes.func,
  ifefModalOpen: PropTypes.bool
}

const ConnectedEntityModal =  connect(mapStateToProps, mapDispatchToProps)(EntityModal)
export default ConnectedEntityModal

export const EntityModalFactory = {
  create: ({ type, action, entity, context, reduxStore}) => {
    reduxStore.dispatch(modal.actions.setModal({
      component: ConnectedEntityModal, 
      props: {action, entity, type}, 
      open: true
    }))
  }
}


