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
import _ from 'lodash'

import LinkedSelectsProgressive from './LinkedSelectsProgressive';


export default class HierarchyAttributeSelects extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            selects: []
        }
        
        this.buildSelects = this.buildSelects.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    
    _getValuesRecursive(selectedValues, i, attributeBranch) {

        let { selects } = this.state;
        
        let hierAtt = this.props.hierarchyAttributes[i];        //the current hierarchical attribute
        let isNextAtt = !!this.props.hierarchyAttributes[i+1];  //whether there is a next attribute to get values for
        
        //if the selectedValues have values for that attribute and there is a next hierarchy attribute
        if (!!selectedValues[hierAtt] && isNextAtt){

            //foreach selected value add it's subvalues to the values for the next attribute
            let attributeKeys = selectedValues[this.props.hierarchyAttributes[i]];
            
            if (!Array.isArray(attributeKeys)) {
                attributeKeys = [attributeKeys];
            }

            attributeKeys.forEach((key) => {
                
                //if the values are an array then they are leafs
                if (Array.isArray(attributeBranch[key])) {
                    
                    let cleanedValues = attributeBranch[key].filter((val) => !!val); //remove undefined and null values
                    selects[i+1].values = [...cleanedValues];
                    selects[i+1].values.sort();
                }
                else {
                    //else if the values are an object there are nested levels below
                    if (!!attributeBranch[key]) {
                        //get the values for this level
                        selects[i+1].values = [...Object.keys(attributeBranch[key])];
                        selects[i+1].values.sort();
                        //check the level below
                        this._getValuesRecursive(selectedValues, i+1, attributeBranch[key]);
                    }
                }
            });

            this.setState({selects: selects});
        }
        
        
    }
    
    async handleChange(selectedValues) {
        
        //clear out all later options in the selects
        let { selects } = this.state;
        for (let i = 1; i < selects.length; i++) {
            selects[i].values = [];
        }
        await this.setState({selects: selects});
        
        //recursively populate the options in the selects from teh structured data
        this._getValuesRecursive(selectedValues, 0, this.props.attributeValues);

        this.props.onChange(selectedValues);
        
    }
    
    async buildSelects() {
      let selects = [];
      for (let i = 0; i < this.props.hierarchyAttributes.length; i++) {
          selects.push({
              name: this.props.hierarchyAttributes[i],
              isMulti: this.props.options && this.props.options.isMulti && i === (this.props.hierarchyAttributes.length-1),
              values: i === 0 ? Object.keys(this.props.attributeValues) : [],
              placeholder: 'Select ' + this.props.hierarchyAttributes[i] + '...'
          });
      }

      await this.setState({selects: selects});

      //if defaultSelections have been passed load those select options
      if (!!this.props.defaultSelections)
          this._getValuesRecursive(this.props.defaultSelections, 0, this.props.attributeValues);
    }
    
    async componentDidMount() {
        
        await this.buildSelects();
    }
    
    async componentDidUpdate(prevProps, prevState) {

      if (!!this.props.defaultSelections && !!prevProps.defaultSelections && !_.isEqual(prevProps.defaultSelections, this.props.defaultSelections)) {
        await this.buildSelects();
      }
    }

    render() {
        
        let cntrl = this.state.selects.length > 0 ? <LinkedSelectsProgressive
                    attributes={this.state.selects}
                    options={this.props.options}
                    onChange={this.handleChange}
                    defaultSelections={this.props.defaultSelections}
                    btn={this.props.btn}
                    disabled={this.props.disabled}
                    /> : <div></div>;
        
        return cntrl;
            
    }

}