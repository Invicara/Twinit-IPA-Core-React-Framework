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
import Select from 'react-select';
import _ from 'lodash';

import '../lib/mobiscroll.scss'

export default class LinkedSelectsProgressive extends React.Component {
    
    /* props
     * 
     * attributes = [
     *      {
     *          name: name, 
     *          isMulti: true/false, 
     *          values: [
     *              "value1", "value2"
     *          ],
     *          placeholder: "text'
     *      }
     * ]
     * 
     * onChange = function()
     * 
     * options = {
     *      direction: horizontal - default
     *                 vertical,
     *      hasLabel: true - default,
     *      isRequired: false - default
     *      
     * }
     */
    
    
    constructor(props) {
        super(props);
        
        this.state = {
            valueOptions: [],
            direction: null
        }
        
        this.updateValueOptions = this.updateValueOptions.bind(this);
        this.handleSelectValue = this.handleSelectValue.bind(this);
    }
    
    async componentDidMount() {

      this.updateValueOptions();

      let direction = "horizontal";
      if (!!this.props.options && !!this.props.options.direction && this.props.options.direction === 'vertical')
          direction = this.props.options.direction;

      await this.setState({direction: direction});
    }
    
    componentDidUpdate(prevProps) {
      
      if (!!this.props.defaultSelections && !_.isEqual(this.props.defaultSelections,prevProps.defaultSelections))
        this.updateValueOptions();
      
    }
    
    updateValueOptions() {
      
      //create state for tracking the selected options of each 
      //attribute in props.attributes    
      let valueOptions = []

      this.props.attributes.forEach((att) => {

          //create the options for the default selections for each attribute
          if (this.props.defaultSelections && this.props.defaultSelections[att.name]) {

              if (Array.isArray(this.props.defaultSelections[att.name])) {
                  valueOptions[att.name] = this.props.defaultSelections[att.name].map((val) => {
                      return {value: val, label: val, key: val}
                  });
              } else {
                  let val = this.props.defaultSelections[att.name];
                  valueOptions[att.name] = [{value: val, label: val, key: val}];
              }
          } else {
              valueOptions[att.name] = []
          }
      });
      
      this.setState({valueOptions});
    }
    
    async handleSelectValue(att, options, index) {
        
        let {valueOptions} = this.state;
        
        //update the state tracking the selected items
        if (att.isMulti) {
            if (!options) valueOptions[att.name] = [];
            else valueOptions[att.name] = options;
        } else {
            
            if (!options) valueOptions[att.name] = []; //when a single select if cleared options is null
            else valueOptions[att.name] = [options];
        }
        
        //always cascade a clear to later selects when a select changes
        for (let i = (index+1); i < this.props.attributes.length; i++) {
            valueOptions[this.props.attributes[i].name] = [];
        }
        
        this.setState({valueOptions: valueOptions});
        
        //reduce the values sent to the props.onChange to just the selected values by attribute
        let values = {};
        for (let key in valueOptions) {
            values[key] = !!valueOptions[key] ? valueOptions[key].map((val) => val.value) : [];
        }
        
        this.props.onChange(values);
    }
    
    render() {
       
        let styles = {};
        let containerStyles = {};
        let subcontainerStyles = {};

        if (!!this.state.direction && this.state.direction === 'horizontal') {
            let width = '200px'
            
            styles = {container: styles => ({...styles, display: 'inline-block', minWidth: width, marginRight: '20px'})};
            subcontainerStyles = {display: 'inline-flex', flexWrap: 'wrap', margin: '10px'};
            containerStyles = {display: 'inline-flex', flexWrap: 'wrap', margin: '10px'};
        } else {
            styles = {
                        control: styles => ({...styles, width: '100%'}),
                        container: styles => ({...styles, display: 'block', width: '100%'})
                     };
        }
       
        let selectsControls = !!this.props.attributes ? this.props.attributes.map((att, index) => {

            let selectDisabled = false;
            if (att.values.length === 0) selectDisabled = true;
            else if (index !== 0 && (!this.state.valueOptions[this.props.attributes[index-1].name] || this.state.valueOptions[this.props.attributes[index-1].name].length === 0))
                selectDisabled = true;
            else if (!!this.props.disabled)
                selectDisabled = true;

            return <div key={att.name} style={subcontainerStyles}>
                {!!this.props.options && this.props.options.hasLabel && <label style={{display: 'block', margin: '10px', fontWeight: 'bold'}} className="mbsc-label">
                    {att.name}
                    {this.props.options.isRequired && ' (required)'}
                </label>}
                <Select
                    styles={styles}
                    isMulti={att.isMulti}
                    name={'select-' + att.name}
                    key={'select-' + att.name}
                    value={this.state.valueOptions[att.name]}
                    options={att.values.map((val) => {
                        return {value: val, label: val, key: val}
                    })}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    closeMenuOnSelect={!att.isMulti}
                    isClearable={true}
                    placeholder={att.placeholder}
                    onChange={(options) => this.handleSelectValue(att, options, index)}
                    isDisabled={selectDisabled}
                /></div>
            
        }) : [];
        
        return  (
            <div style={containerStyles}>
                {selectsControls}
                {!!this.props.btn && this.props.btn}
            </div>
        )
    }

}