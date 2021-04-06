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

import React from 'react';
import _ from "lodash";
import PropTypes from "prop-types";
import DatePicker from 'react-date-picker';
import DateTimePicker from 'react-datetime-picker';
import clsx from "clsx";


import GenericMatButton from '../../IpaControls/GenericMatButton';
import {ScriptedLinkedSelects} from '../../IpaControls/EnhancedScriptedLinkedSelects';
import {ControlProvider}  from "../../IpaControls/ControlProvider";

import produce from "immer";

import GenericModal from '../../IpaDialogs/GenericModal'
import '../../lib/mobiscroll.scss'
import './EntityModal.scss'


export default class EntityModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newEntity: null,
            working: false,
            typeMapKeys: [],
            typeMap: {},
            error: null,
            modalOpen: false,
            config: {}
          }
    }

    async componentDidMount() {

      this.getControlValues();
    }

    componentDidUpdate(prevProps, prevState) {

      if (this.state.modalOpen !== this.context.ifefModalOpen) {
        this.setState({modalOpen: this.context.ifefModalOpen});

        if (this.context.ifefModalOpen) {
          let config = !!this.props.action.component ? this.props.action.component : {};
          this.setState({config, error: null});
          this.getControlValues();
        }else{
          //TODO better explore the deep causes of the double edit (asset/space) issue and refactor componentDidUpdate
          this.setState({newEntity: null});
        }
      }      
    }

    getControlValues = () => {

        let entity = !!this.props.entity ? this.props.entity : {};

        let newEntity = {};

        _.defaultsDeep(newEntity, entity);

        Object.keys(newEntity.properties).forEach((pk) => {

          if (!newEntity.properties[pk].val)
             newEntity.properties[pk].val = "";
        });

        this.setState({newEntity});
    }

    onChangeMulti = (attObj) => {
      
        let atts = Object.keys(attObj);

        const newMultiUpdatedEntity = atts.reduce((partiallyUpdatedEntity, att) =>
            this.getNewUpdatedEntity(partiallyUpdatedEntity, att, partiallyUpdatedEntity.properties[att], attObj[att]),
            this.state.newEntity
        );
        this.setState({newEntity: newMultiUpdatedEntity});
    }

    onChange =  (att, propInfo, value) => {
        const newEntity = this.getNewUpdatedEntity(this.state.newEntity, att, propInfo, value);
        this.setState({newEntity});
    }

    getNewUpdatedEntity(originalEntity, att, propInfo, value) {
        return produce(originalEntity, newEntity => {
          if (Array.isArray(value) && propInfo.type !== 'tags' ) value = value[0];

        if (propInfo && propInfo.type === 'tags' && value === undefined ) value = [];

            if (att === 'name') {
                newEntity["Entity Name"] = value;
            } else if (propInfo.type === 'date' || propInfo.type === 'datetime') {
                newEntity.properties[att].epoch = !!value ? value.getTime() : null;
            } else {
                newEntity.properties[att].val = value;
            }
        });
    }

    onCancel = async () => {
      if (this.props.action.onCancel) this.props.action.onCancel();
      this.context.ifefShowModal(false);
    }
    
    hasAllRequiredProperties = (entity) => {
      console.log('prop check')
      let pass = true;
      
      if (!entity['Entity Name'])
        pass = false;
      else {
        
        if (this.props.action.component.requiredProperties) {
        
          let propNames = Object.keys(entity.properties);
          let reqProps = this.props.action.component.requiredProperties;
          
          for (let i = 0; i < propNames.length; i++) {
            
            if (reqProps.includes(entity.properties[propNames[i]].dName) && !entity.properties[propNames[i]].val) {
                pass = false;
                break;
            }
          
          }
        }
      }
      
      return pass;
    }

    mergeEntityWithActionResult = (actionName, entity, createResult) => {
      if(actionName !== "Create") return entity;
      return {...entity, ...createResult};
    }

    onSave = async () => {
      this.setState({working: true, error: null});

      let newEntity = _.cloneDeep(this.state.newEntity)
      newEntity['Entity Name'] = newEntity['Entity Name'].trim();
      Object.keys(newEntity.properties).forEach((prop) => {
              newEntity.properties[prop].val = newEntity.properties[prop].val && newEntity.properties[prop].type === 'text' ? newEntity.properties[prop].val.trim() : newEntity.properties[prop].val;
          });


      if (this.props.action.doEntityAction) {
        
        if (this.hasAllRequiredProperties(newEntity)) {
          
          let result = await this.props.action.doEntityAction(this.props.action.name, {new: newEntity, original: this.props.entity});
          this.setState({working: false});

          if (result.success) {
            this.context.ifefShowModal(false);
            newEntity = this.mergeEntityWithActionResult(this.props.action.name, newEntity, result.result);
            if (!!this.props.action.onSuccess) this.props.action.onSuccess(this.props.action.type, result.entity ? result.entity : newEntity, result);
          } else {
            let error = (<div className="entity-modal-error">
              {result.message}
            </div>);

            this.setState({working: false, error: error});
            if(!!this.props.action.onError) this.props.action.onError(this.props.action.type, result, newEntity);
          }
          
        } else {
          let error = (<div className="entity-modal-error">
                "Required properties are missing values!"
              </div>);
          this.setState({working: false, error: error});
        }
      } 
    }
    
    dashPropDName = (propDName) => {
      
      return propDName.split(' ').join('-');
      
    }
    
    propIsRequired = (prop) => {
      
      let componentCfg = this.props.action.component;
      let hasReqProps = !!componentCfg.requiredProperties;
      
      return hasReqProps && componentCfg.requiredProperties.includes(prop);
    }

    getControl = (prop) => {
      let {newEntity} = this.state;

      let propInfo = this.state.newEntity.properties[prop];
 
      if (this.state.newEntity.properties[prop].type !== 'HIERARCHY>>') {

        switch(propInfo.type) {

          case 'number':
          case 'tags':
          case 'text': {

            if (this.props.action.component.propertyUiTypes && this.props.action.component.propertyUiTypes[prop]){
              let Control = ControlProvider.getControlComponent(this.props.action.component.propertyUiTypes[prop]);
              
              if (!Control)
                return (<div key={prop}>Configured propertyUiType Component  for {prop} Doesn't Exist</div>)
              else {
                  
                let currentValue = {};
                currentValue[prop] = Array.isArray(this.state.newEntity.properties[prop].val) ? this.state.newEntity.properties[prop].val : [this.state.newEntity.properties[prop].val];

                return (<div key={propInfo.dName + '_div'} className={clsx(this.dashPropDName(propInfo.dName) + '-div', this.propIsRequired(prop) && 'required')}>
                  <div className="entity-property-control-row">
                    <Control {...this.props.action.component.propertyUiTypes[prop]} 
                                  currentValue={currentValue}
                                  onChange={(e) => this.onChange(prop, propInfo, e[prop])}
                                  noFetch={true}
                                  id={prop}
                                  filterInfo={this.props.action.component.propertyUiTypes[prop].queryFilter ? newEntity : null}
                                  disabled={this.state.working || !!this.props.action.component.disableAll || (this.state.config.disabled && this.state.config.disabled.includes(prop))}
                               />
                    {!!this.state.newEntity.properties[prop].uom && <span className="property-uom">{this.state.newEntity.properties[prop].uom}</span>}
                  </div>
                </div>)
              }
            }
            else {
              return (<div key={propInfo.dName + '_div'} className={clsx(this.dashPropDName(propInfo.dName) + '-div', this.propIsRequired(prop) && 'required')}>
                  <label style={{margin: '10px', fontWeight: 'bold'}}>{prop}</label>
                  <div className="entity-property-control-row">
                    <input
                      key={prop}
                      type={propInfo.type}
                      value={this.state.newEntity.properties[prop].val}
                      onChange={(e) => this.onChange(prop, propInfo, e.target.value)}
                      disabled={this.state.working || !!this.props.action.component.disableAll || (this.state.config.disabled && this.state.config.disabled.includes(prop))}
                      className='form-control'
                      style={{backgroundColor: 'white !important', borderColor: 'rgb(204,204,204) !important', borderWidth: '1px !important'}}>
                    </input>
                    {!!this.state.newEntity.properties[prop].uom && <span className="property-uom">{this.state.newEntity.properties[prop].uom}</span>}
                  </div>
                </div>)
            }
            
            
          }

          case 'date': {

            let displayDate = !!this.state.newEntity.properties[prop].epoch ? new Date(this.state.newEntity.properties[prop].epoch) : null;
            return <div key={propInfo.dName + '_div'} className={clsx(this.dashPropDName(propInfo.dName) + '-div', this.propIsRequired(prop) && 'required')}>
                      <label style={{margin: '10px', fontWeight: 'bold'}}>{prop}</label>
                      <div className="entity-property-control-row">
                         <DatePicker
                           key={prop}
                           onChange={(e) => this.onChange(prop, propInfo, e)}
                           value={displayDate}
                           className='form-control'
                           calendarIcon={null}
                           disabled={this.state.working || !!this.props.action.component.disableAll || (this.state.config.disabled && this.state.config.disabled.includes(prop))}
                         />
                      </div>
                    </div>
          }

          case 'datetime': {

            let displayDate = !!this.state.newEntity.properties[prop].epoch ? new Date(this.state.newEntity.properties[prop].epoch) : null;
            return <div key={propInfo.dName + '_div'} className={clsx(this.dashPropDName(propInfo.dName) + '-div', this.propIsRequired(prop) && 'required')}>
                      <label style={{margin: '10px', fontWeight: 'bold'}}>{prop}</label>
                      <div className="entity-property-control-row">
                         <DateTimePicker
                           key={prop}
                           onChange={(e) => this.onChange(prop, propInfo, e)}
                           value={displayDate}
                           className='form-control'
                           calendarIcon={null}
                           disableClock={true}
                           disabled={this.state.working || !!this.props.action.component.disableAll || (this.state.config.disabled && this.state.config.disabled.includes(prop))}
                         />
                      </div>
                    </div>

          }

          case 'boolean': {
            let value = this.state.newEntity.properties[prop].val ? this.state.newEntity.properties[prop].val : false;
            return <div key={propInfo.dName + '_div'} className={clsx(this.dashPropDName(propInfo.dName) + '-div', this.propIsRequired(prop) && 'required')}>
                      <label style={{margin: '10px', fontWeight: 'bold'}}>{prop}</label>
                      <div className="entity-property-control-row">
                        <div className='custom-control custom-switch' style={{marginLeft: '10px', zIndex: '0'}}>
                          <input type="checkbox" className="custom-control-input" value={value} id={propInfo.dName} checked={value} onChange={(e) => this.onChange(prop, propInfo, e.target.checked)}/>
                          <label className="custom-control-label" htmlFor={propInfo.dName}>{value.toString()}</label>
                        </div>
                      </div>
                    </div>
          }
        }
      }
      else return null;
    }
    
    getScriptedHierarchyInputs = () => {

      let selects = this.props.action.component.hierarchySelects.selects;
      
      selects.forEach((s) => {
        if (this.propIsRequired(s.display))
          s.required = true;
      });
      
      let currentValue = {};
      let selectKeys = selects.map((select) => select.display);
      
      selectKeys.forEach((prop) => {
         currentValue[prop] = [this.state.newEntity.properties[prop].val];
      });
      
      return  <div>
                <hr/>
                <ScriptedLinkedSelects
                  selects={selects}
                  noFetch={true}
                  onChange={this.onChangeMulti}
                  currentValue={currentValue}
                  disabled={this.state.working || !!this.props.action.component.disableAll || (this.state.config.disabled && selectKeys.some((prop) => this.state.config.disabled.includes(prop)))}
                />
              </div>
      
    }

    render() {
        let body = null;
        let entityType = 'Entity';
        if (this.props.type && this.props.type.singular)
          entityType = this.props.type.singular;

        if (this.state.newEntity) {

            const groups = this.getGroups();
            body = (<div className='entity-modal-body'>
            <div key={'namediv'} className="required">
              <label style={{margin: '10px', fontWeight: 'bold'}}>{entityType} Name</label>
              <input
                  key={'entityname'}
                  type="text"
                  value={this.state.newEntity["Entity Name"]}
                  onChange={(e) => this.onChange('name', null, e.target.value)}
                  disabled={this.state.working || !!this.props.action.component.disableAll || (this.state.config.disabled && this.state.config.disabled.includes('Entity Name'))}
                  className='form-control'
                  style={{backgroundColor: 'white !important', borderColor: 'rgb(204,204,204) !important', borderWidth: '1px !important'}}>
              </input>
            </div>
            <div>
              {this.props.action.component.hierarchySelects && this.getScriptedHierarchyInputs()}
            </div>
              {!this.props.action.component.showGroupNames && <hr/>}
            <div>
              {_.keys(groups).filter(groupName => groups[groupName].length > 0).map(groupName =>
                  <div>
                      {this.props.action.component.showGroupNames &&  <div class={'group-name'}>
                          {groupName}
                      </div>}
                      {groups[groupName].filter(prop => !(this.props.action.component.hidden || []).includes(prop)).map(prop => this.getControl(prop))}
                  </div>
              )}
            </div>
          </div>);
        }

        let modalBody = <div className='mbsc-grid'>
                {body}
                <hr/>
                {this.state.error}
                <div style={{width: '100%', display: 'inline-flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                  <GenericMatButton onClick={this.onCancel} disabled={this.state.working} styles={{marginRight: '15px'}}>Cancel</GenericMatButton>
                  <GenericMatButton onClick={this.onSave} disabled={this.state.working} customClasses="attention">
                      {this.props.action.component.okButtonText ? this.props.action.component.okButtonText : 'OK'}
                  </GenericMatButton>
                </div>
            </div>;

        let title = <span>{this.props.action.name + " " + entityType}</span>
        return <GenericModal
                title={title}
                customClasses={'ipa-modal ipa-modal-no-x-close'}
                modalBody={modalBody} />
    }

    getGroups() {
        const allProps =  _.keys(this.state.newEntity.properties);
        const groupedProps = _.flatten(_.values(this.props.action.component.groups));
        const otherProps = _.difference(allProps, groupedProps)
        return {...this.props.action.component.groups, "Other": otherProps};
    }
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
};

export const EntityModalFactory = {
  create: ({type, action, entity, context}) => {
    let modal = <EntityModal action={action} entity={entity} type={type} />
    context.ifefShowModal(modal);
    return modal
  }
}
