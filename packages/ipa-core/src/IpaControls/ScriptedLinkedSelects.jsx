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

import ScriptHelper from "../IpaUtils/ScriptHelper";

import LinkedSelectsProgressive from "./LinkedSelectsProgressive";

/*
 * Props
 * 
 * selectConfigs: array of select objects containing a name and a script to fetch it's values.
 * onChange()
 */

/**
 * @Deprecated, use {@link ./EnhancedScriptedLinkedSelects} instead
 */
export class ScriptedLinkedSelects extends React.Component {
    
    constructor(props) {
      super(props);
      
      this.state = {
        selectOptions: [],
        selectedOptions: {}
      }
      
      this.onChange = this.onChange.bind(this);
      
    }
    
    async componentDidMount() {

      if (this.props.selectConfigs.length < 2)
        console.error('ScriptedLinkedSelects control requires at least two select configurations!');
      else {
        
        //fetch the first selects values
        let firstSelectValues = await ScriptHelper.executeScript(this.props.selectConfigs[0].script);
        let selectOptions = [];
        let selectedOptions = {};
        
        this.props.selectConfigs.forEach((config, index) => {
          
          selectOptions.push({
            name: config.display,
            isMulti: index === this.props.selectConfigs.length - 1 ? config.isMulti : false,
            values: index === 0 ? firstSelectValues.sort((a,b) => a.localeCompare(b)) : [],
            placeholder: "Select " + config.display + "..."
          });
          
          selectedOptions[config.display] =[];
        });
        
        this.setState({selectOptions, selectedOptions});
      }
      
    }
    
    async onChange(selectedValues) {
      
      let input = {};
      
      for (let i = 0; i < this.props.selectConfigs.length; i++) {
        let selectDisplay = this.props.selectConfigs[i].display;
        
        //if the current select has changed and was not cleared
        if (!_.isEqual(this.state.selectedOptions[selectDisplay], selectedValues[selectDisplay]) && !!selectedValues[selectDisplay].length) {
          
          //load the next select control
          if (i+1 < this.props.selectConfigs.length) {
            
            input[selectDisplay] = selectedValues[selectDisplay][0];
            let nextSelectValues = await ScriptHelper.executeScript(this.props.selectConfigs[i+1].script, {input: input});
            let {selectOptions} = this.state;

            let replaceValues = _.find(selectOptions, {name: this.props.selectConfigs[i+1].display});
            replaceValues.values = nextSelectValues;

            this.setState({selectOptions});
            
            break;
          }
        }
        else {
          input[selectDisplay] = selectedValues[selectDisplay][0];
        }
      }
      
      this.setState({selectedOptions: selectedValues});
      
      if (this.props.onChange) {
        
        let currentSelections = {};
        Object.keys(selectedValues).forEach((key) => {
          if (selectedValues[key].length > 0)
            currentSelections[key] = selectedValues[key];
        });

        this.props.onChange(currentSelections);
      }
    }
    
    render() {
      
      return <LinkedSelectsProgressive
        attributes={this.state.selectOptions}
        onChange={this.onChange}
        options={{hasLabel: true}}
      />
     
    }
}
