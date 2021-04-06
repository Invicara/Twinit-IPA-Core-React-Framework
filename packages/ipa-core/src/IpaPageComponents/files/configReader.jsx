import {CreatableScriptedSelects} from "../../IpaControls/CreatableScriptedSelects";
import produce from "immer";
import {ControlProvider} from "../../IpaControls/ControlProvider";
import React from "react";
import {fileSelectStyles, FileTableInput, FileTableSelect} from "./misc";
import _ from 'lodash'

import ScriptHelper from "../../IpaUtils/ScriptHelper";

const fallbackControlBuilder = async column => {
    throw new Error(`Error in file column config for ${column.name}: Unknown control for string query ${column.query}`)
}

const controlBuilders = {
    '<<CREATABLE_SCRIPTED_SELECTS>>':  column => {
        if(!column.script) throw new Error(`Error in file column config for ${column.name}: <<CREATABLE_SCRIPTED_SELECTS>> require a script to populate select options`)
        return function(value, onChange, entity){//If this needs to be turned into an arrow function, be careful with the `this` reference
            return <CreatableScriptedSelects currentValue={value} onChange={onChange} noFetch compact isClearable={false}
                                             selectOverrideStyles={fileSelectStyles} filterInfo={entity} script={this.script}/>
        }
    },
    '<<TEXT>>': () =>  (value, onChange) => <FileTableInput initialValue={value} onChange={onChange}/>,
    '<<SIMPLE_SELECT>>': async column => {
        if(!column.script) throw new Error(`Error in file column config for ${column.name}: <<SIMPLE_SELECT>> requires a script to populate select options`)
        const values = _.values(await ScriptHelper.executeScript(column.script)) [0]
        return (value, onChange) => <FileTableSelect value={value} options={values} onChange={onChange}/>
    }
}

const validateMulti = (query) => {
    if(query.multi || _.get(query, 'selects', []).some(select => select.multi))
        throw new Error('Cannot use "multi" selects in file upload table')
}

const buildConfig = displayNames  => produce(async column => {
    if(typeof column.query === 'object'){
        const Control = ControlProvider.getControlComponent(column.query);
        validateMulti(column.query)
        column.control = function (value, onChange) {//If this needs to be turned into an arrow function, be careful with the `this` reference
            return <Control currentValue={value} onChange={onChange} noFetch selects={this.query.selects}
                            compact isClearable={false} selectOverrideStyles={fileSelectStyles}/>
        }
    } else if(typeof column.query === 'string'){
        column.control = await (controlBuilders[column.query] || fallbackControlBuilder)(column)
    } else {
        throw new Error(`Error in file column config for ${column.name}: Requires a query (either object or string) to populate select options`)
    }
    const columnNameArray = typeof column.name === 'string' ? [column.name] : column.name;
    column.displayAs = displayNames.filter(({prop}) => _.includes(columnNameArray, prop)).map(({dName}) => dName).join(' & ')
    column.isCompositeAttribute = Array.isArray(column.name)
});

//This component encapsulates the complexity of turning column config into actual controls
const FileConfigReader = { buildConfig }

export default FileConfigReader