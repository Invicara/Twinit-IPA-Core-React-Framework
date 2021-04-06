import React from "react";
import {TextSearch} from "./TextSearch";
import {AdvancedSearch} from "./AdvancedSearch";
import {ScriptedSelects} from "./EnhancedScriptedSelects";
import {ScriptedLinkedSelects} from "./EnhancedScriptedLinkedSelects";
import {OrDivider} from "./OrDivider";
import {CreatableScriptedSelects} from "./CreatableScriptedSelects";
import { listEquals } from "../IpaUtils/compare"
import {TreeSearch} from "./TreeSearch";

import './EnhancedFetchControl.scss'

class EnhancedFetchControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState()
    }

    componentDidUpdate(prevProps){
        if(!listEquals(prevProps.selectors, this.props.selectors)){
            this.setState(this.getInitialState())
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

    setSelectorsMap = updatedSelectorsMap => this.setState({selectorsMap: updatedSelectorsMap});

    resetSelectorsMap = (selectors, initialValue) => selectors.reduce((accum, selector, i) => ({
        ...accum,
        [i]: {...selector, id: i, currentValue: initialValue && initialValue.id == i ? initialValue.value : null, touched: false}
    }), {});

    keyup = (e) => {
      if (e.key=="Enter" &&
          this.state.currentSelectorId != -1 &&
          this.state.selectorsMap[this.state.currentSelectorId].touched)
        this.handleFetch(this.state.currentSelectorId)
    }

    handleFetch = (selectorId) => {
        let selector = this.state.selectorsMap[selectorId]
        this.setSelectorsMap({
            ...this.resetSelectorsMap(this.props.selectors),
            [selector.id]: {...selector, currentValue: selector.currentValue, touched: false}
        });
        this.props.doFetch(selector, selector.currentValue);
    }

    renderControl = (selector, position) => {
        const Control = getControlComponent(selector);
        const handleChange = newValue => {
            this.setState({currentSelectorId: selector.id})
            this.setSelectorsMap({
                ...this.state.selectorsMap,
                [selector.id]: {...selector, currentValue: newValue, touched: true}
            });
        };
        

        if(!Control) return <div>Unknown control</div>

        return <div key={selector.id} onKeyUp={this.keyup}>
                {position !== 0 && <OrDivider/>}
                <Control {...selector}  onChange={handleChange} onFetch={e=>this.handleFetch(selector.id)} currentValue={selector.currentValue}/>
            </div>

    }


    render() {
        return (<div className='enhanced-fetch-control'>
            {this.getSelectors().map(this.renderControl)}
        </div>)
    }

}


export default EnhancedFetchControl
