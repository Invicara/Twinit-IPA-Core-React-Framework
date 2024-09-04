import React from "react";
import {OrDivider} from "./OrDivider";
import _ from "lodash";

import './EnhancedFetchControl.scss'
import {ControlProvider} from "./ControlProvider";

class EnhancedFetchControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    componentDidUpdate(prevProps, prevState){

        const selectorsChanged = !_.isEqual(_.sortBy(prevProps.selectors), _.sortBy(this.props.selectors))

        if(selectorsChanged){
            this.setState(this.getInitialState())
        }

        const shouldClearSelectorsValues = !_.isEqual(prevProps.shouldClearToken, this.props.shouldClearToken);

        if(shouldClearSelectorsValues) {
            this.setState(this.getInitialState());
        }
    }

    getInitialState(){
        return {
            currentSelectorId: -1,
            selectorsMap: this.resetSelectorsMap(this.props.selectors, this.props.initialValue),
            selectorIds: this.props.selectors.map((_, i) => i)
        }
    }

    getSelectors = () => this.state.selectorIds.map(id => this.state.selectorsMap[id]);

    setSelectorsMap = updatedSelectorsMap => {
        this.setState({selectorsMap: updatedSelectorsMap})
    };

    resetSelectorsMap = (selectors, initialValue) => selectors.reduce((accum, selector, i) => ({
        ...accum,
        [i]: {...selector, id: i, currentValue: initialValue && (initialValue.id == i || initialValue.id == selector.id) ? initialValue.value : null, touched: false}
    }), {});

    keyup = (e) => {
      if (e.key=="Enter" &&
          this.state.currentSelectorId != -1 &&
          this.state.selectorsMap[this.state.currentSelectorId].touched)
        this.handleFetch(this.state.currentSelectorId)
    }


    //value is optional, it can be used to provide a value not yet available in the state.
    handleFetch = (selectorId, value, state) => {
        // This will clear any entities that have been selected directly from the model
        if(this.props.setViewerSelectedEntitiesBySearch) this.props.setViewerSelectedEntitiesBySearch([])
        //The disable props can prevent fetching. 
        // It is especially useful to prevent spontaneous fetching from TreeSearch after it reloads itself. 
        if(this.props.disable) return;
        let selector = this.state.selectorsMap[selectorId]
        let newValue = value || selector.currentValue
        if (_.isEmpty(newValue)) {
            newValue = null;
        }
        let newState = state || selector.currentState
        let newSelector = {...selector, currentValue: newValue, currentState: newState, touched: false}
        let newSelectors = {
            ...this.resetSelectorsMap(this.props.selectors),
            [selector.id]: newSelector
        }
        this.setSelectorsMap(newSelectors);
        this.props.doFetch(newSelector, newValue);
    }

    renderControl = (selector, position) => {
        const Control = ControlProvider.getControlComponent(selector);
        const handleChange = (newValue) => {
            this.setState({currentSelectorId: selector.id})
            this.setSelectorsMap({
                ...this.state.selectorsMap,
                [selector.id]: {...selector, currentValue: newValue, touched: true}
            });
        };

        if(!Control) return <div>Unknown control</div>

        return <div key={selector.id} onKeyUp={this.keyup}>
                {position !== 0 && <OrDivider/>}
                <Control 
                    {...selector}  
                    onChange={handleChange}
                    onFetch={(event, value, state) => this.handleFetch(selector.id, value, state)}
                    currentValue={selector.currentValue}
                    currentState={selector.currentState}
                    disable={this.props.disable} //Its not useful yet but might be for some Controls in the future.
                    reloadToken={this.props.reloadToken}
                />
            </div>

    }


    render() {
        return (<div className='enhanced-fetch-control'>
            {this.getSelectors().map(this.renderControl)}
        </div>)
    }

}


export default EnhancedFetchControl
