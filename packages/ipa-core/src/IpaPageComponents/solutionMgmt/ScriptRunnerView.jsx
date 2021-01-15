/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
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

/*
 * ENHANCEMENTS
 * 
 * 1. Replace text areas with JSON Editor
 * 2. Get editors to work with JSON and javascript objects
 * 3. Add "Add Operator" sidedrawer that will insert script operators into the script
 * 4. Able to remove individual variables
 * 5. Better variable display
 * 
 */

import React from "react";
import {ObjectInspector, chromeLight } from 'react-inspector';
import Select from 'react-select';
import {IafScripts} from '@invicara/platform-api'
import _ from 'lodash'

import GenericMatButton from '../../IpaControls/GenericMatButton';
import ScriptHelper from "../../IpaUtils/ScriptHelper";
import {StackableDrawer} from '../../IpaControls/StackableDrawer'

import '../../lib/mobiscroll.scss'

const getLocalScriptKey = (scriptname) => {
  return "ipaScript_"+ scriptname
}

class ScriptRunnerView extends React.Component {
    constructor(props) {
        super(props);

       this.state = {
           isPageLoading: false,
           handler: null,
           scripts: [],
           selectedScript: '',
           isRunning: false,
           results: [],
           dots: '',
           showInput: true,
           scriptInput: "",
           inputError: false,
           showScript: false,
           scriptJSON: "",
           scriptError: false,
           parsedScript: {},
           addVariable: "",
           variables: {},
           convertSetq: false,
           snippet: "",
           helpLinks: [],
           newScriptName: ""
       }

       this._loadAsyncData = this._loadAsyncData.bind(this);
       this.handleScriptSelect = this.handleScriptSelect.bind(this);
       this.runScript = this.runScript.bind(this);
       this.toggleDisplay = this.toggleDisplay.bind(this);
       this.toggleCollapsed = this.toggleCollapsed.bind(this);
       this.deleteResult = this.deleteResult.bind(this);
       this.handleKeyDown = this.handleKeyDown.bind(this);
       this.onInputChange = this.onInputChange.bind(this);
       this.getScriptText = this.getScriptText.bind(this);
       this.toggleInputs = this.toggleInputs.bind(this);
       this.handleVariableName = this.handleVariableName.bind(this);
       this.addScriptVar = this.addScriptVar.bind(this);
       this.getScriptVars = this.getScriptVars.bind(this);
       this.writeVars = this.writeVars.bind(this);
       this.readVars = this.readVars.bind(this);
       this.clearVars = this.clearVars.bind(this);
       this.toggleConvertSetq = this.toggleConvertSetq.bind(this);
       this.saveSnippet = this.saveSnippet.bind(this);
       this.handleNewScriptName = this.handleNewScriptName.bind(this);
       this.addNewScript = this.addNewScript.bind(this);
       this.removeLocalScript = this.removeLocalScript.bind(this);
       
       this.scriptInput = React.createRef();
       this.scriptJSON = React.createRef();
       this.snippetInput = React.createRef();

    }

    async _loadAsyncData() {
        //Loads data necessary for displaying the page

        let handler = this.props.handler;
        console.log('handler', handler);

        this.setState({handler});

        let scripts = ScriptHelper.getScriptVar('runnableScripts');
        
        if (handler.config && handler.config.allowScriptInput && scripts && scripts.length > 0) {
          IafScripts.getScripts({query: {_userType: handler.scriptTypes[0]}}).then((scr) => {
            let scriptVer = _.find(scr[0]._versions, {_version: scr[0]._tipVersion})
            let script = scriptVer._userData
            let parsed = JSON.parse(script)
            
            if (localStorage.ipaScriptRunnerLocalScripts && localStorage.ipaScriptRunnerLocalScripts.length){
              let scriptNames = localStorage.ipaScriptRunnerLocalScripts.split(",")
              let scriptsToAdd = scriptNames.map((scrname) => {
                return {
                  name: scrname + ' (local)',
                  script: scrname,
                  local: true
                }
              })
              
              scriptsToAdd.push(...scripts)
              scripts = scriptsToAdd
            }
            
            this.setState({parsedScript: parsed, scripts: scripts, selectedScript: scripts[0]}, this.getScriptText)
          })
          if (localStorage.ipaScriptRunnerConvertSetq)
            this.setState({convertSetq: true})
          this.readVars()
          if (localStorage.ipaScriptRunnerSnippet)
            this.setState({snippet: localStorage.ipaScriptRunnerSnippet})
          let helpLinks = ScriptHelper.getScriptVar("scriptRunnerHelpLinks")
          
          if (helpLinks && helpLinks.length)
            this.setState({helpLinks: helpLinks})
        }
        else
          this.setState({scripts: scripts, selectedScript: scripts[0]})
    }
    
    //FIND LATEST SCRIPT VERSION
    getScriptText() {
      
      if (!this.state.selectedScript.local) {
        let defaultScript = false

        this.state.parsedScript.forEach((def) => {

          if (def.hasOwnProperty('$defscript')){
            let namedScript = def.$defscript

            if (namedScript.hasOwnProperty(this.state.selectedScript.script)) {

              defaultScript = JSON.stringify(namedScript[this.state.selectedScript.script], null, 3)
              this.setState({scriptJSON: defaultScript, scriptError: false})

              if (this.state.selectedScript.defaultInput) {
                this.setState({scriptInput: JSON.stringify(this.state.selectedScript.defaultInput, null, 3)})
              } else 
                this.setState({scriptInput: ""})
            }
          }
        })

        if (!defaultScript)
          this.setState({scriptJSON: "Script Not Found", scriptError: true})
      }
      else {
        let storKey = getLocalScriptKey(this.state.selectedScript.script)
        let scriptText = localStorage.getItem(storKey)
        if (!scriptText)
          scriptText = "Script Not Found"
          
        this.setState({scriptJSON: scriptText})
      }
    }
    
    handleVariableName(e) {
      this.setState({addVariable: e.target.value})
    }
    
    addScriptVar() {
      
      if (this.state.addVariable.trim().length) {
        let variables = _.cloneDeep(this.state.variables)
        variables[this.state.addVariable] = {}
        this.setState({addVariable: "", variables: variables}, this.getScriptVars)
      }
    }
    
    async getScriptVars() {
      let allVars = Object.keys(this.state.variables)
      
      allVars.forEach(async (thisVar) => {
        let varValue = await ScriptHelper.getScriptVar(thisVar)
        let variables = _.cloneDeep(this.state.variables)
        variables[thisVar] = varValue
        this.setState({variables: variables}, this.writeVars)
      })
    }
    
    writeVars() {
      let vars = Object.keys(this.state.variables)
      let strVars = vars.join(',')
      localStorage.setItem('ipaScriptRunnerVars', strVars)
    }
    
    readVars() {
      if (localStorage.ipaScriptRunnerVars) {
        let vars = localStorage.ipaScriptRunnerVars.split(',')
        let newVars = {}
        vars.forEach((thisVar) => {
          newVars[thisVar] = {}
        })

        this.setState({variables: newVars}, this.getScriptVars)
      }
    }
    
    clearVars() {
      this.setState({variables: {}}, this.writeVars)
    }

    handleScriptSelect(option) {
        if (this.props.handler.config && this.props.handler.config.allowScriptInput)
          this.setState({selectedScript: option.value}, this.getScriptText);
        else
          this.setState({selectedScript: option.value});
    }

    async runScript() {

        let {results} = this.state;

        this.setState({isRunning: true});
        let dotInt = setInterval(() => {

            let newDots;
            if (this.state.dots.length === 15) newDots = '';
            else newDots = this.state.dots + ' . ';
            this.setState({dots: newDots});
        }, 750);
        
        let data= [];
        //if configured to display the script input and script always run the script from the ui
        if (this.props.handler.config && this.props.handler.config.allowScriptInput) {
          
          let scriptInput = this.state.scriptInput.trim()
          let scriptInputObj = scriptInput && scriptInput.length > 0 ? JSON.parse(scriptInput) : {};
 
          let restringedDef = "[{$defscript: {'testScript':" + this.state.scriptJSON + "}}]"
          
          if (this.state.convertSetq)
            restringedDef = restringedDef.replaceAll("$let", "$setq")
         
          let validated = IafScripts.isValid(restringedDef)
          
          if (validated) {
            let evaldata = await ScriptHelper.evalExpressions(validated);
            data = await ScriptHelper.executeScript('testScript', scriptInputObj);
            this.getScriptVars()
            if (scriptInput && scriptInput.length > 0)
              data = {
                result: data,
                input: scriptInputObj
              }
          }
          else {
            data = {error: "Script is not in the correct format!"}
          }
        } else {
          data = await ScriptHelper.executeScript(this.state.selectedScript.script);
        }
        
        let sName = this.state.selectedScript.name;
        results.unshift({name: sName, data: data, disp: true, collapsed: false});

        clearInterval(dotInt);
        this.setState({dots: '', results: results, isRunning: false});
    }

    toggleDisplay(e, index) {

        e.preventDefault();

        let { results } = this.state;

        results[index].disp = !results[index].disp;

        this.setState({results: results});
    }

    toggleCollapsed(e, index) {

        e.preventDefault();

        let { results } = this.state;

        results[index].collapsed = !results[index].collapsed;

        this.setState({results: results});
    }

    deleteResult(e, index) {

        e.preventDefault();

        let { results } = this.state;

        if (!!index)
            results.splice(index, 1);
        else
            results = [];

        this.setState({results: results});
    }

    handleKeyDown(event, ref, which) {
      
      if (event.keyCode === 9) { // tab was pressed
          event.preventDefault();
          
          let start = event.target.selectionStart,
          end = event.target.selectionEnd;
          let val
          
          if (which === 'input') {
            val = this.state.scriptInput
            this.setState({scriptInput: val.substring(0, start) + '\t' + val.substring(end)},
                () => {
                    ref.current.selectionStart = ref.current.selectionEnd = start + 1
                });
          } else if (which === 'snippet'){
            val = this.state.snippet
            this.setState({snippet: val.substring(0, start) + '\t' + val.substring(end)},
                () => {
                    ref.current.selectionStart = ref.current.selectionEnd = start + 1
                });
          } else {
            val = this.state.scriptJSON
            this.setState({scriptJSON: val.substring(0, start) + '\t' + val.substring(end)},
                () => {
                    ref.current.selectionStart = ref.current.selectionEnd = start + 1
                });
          }
      }
    }
    
    onInputChange(e, which) {
      
      let inputError = false;
      if (this.props.handler.config && this.props.handler.config.allowScriptInput) {
        try {
          if (e.target.value.length)
            JSON.parse(e.target.value)
        } catch (e) {
          inputError = true;
        }
      }
      
      if (which === 'input') 
        this.setState({scriptInput: e.target.value, inputError: inputError});
      else {
        this.setState({scriptJSON: e.target.value, scriptError: inputError});
        if (this.state.selectedScript.local) {
          localStorage.setItem(getLocalScriptKey(this.state.selectedScript.script), e.target.value)
        }
      }
      
    }
    
    toggleInputs(input) {
      
      if (input === 'input')
        this.setState({showInput: !this.state.showInput})
      else
        this.setState({showScript: !this.state.showScript})
      
    }
    
    toggleConvertSetq() {
      
      if (this.state.convertSetq)
        localStorage.removeItem('ipaScriptRunnerConvertSetq')
      else
        localStorage.setItem('ipaScriptRunnerConvertSetq', true)

      this.setState({convertSetq: !this.state.convertSetq})
      
    }

    saveSnippet(e) {
      this.setState({snippet: e.target.value})
      localStorage.setItem('ipaScriptRunnerSnippet', e.target.value)
    }
    
    handleNewScriptName(e) {
      this.setState({newScriptName: e.target.value})
    }
    
    addNewScript() {
      
      let newName = this.state.newScriptName.trim().replaceAll(",", "").replaceAll(" ", "_")
      
    
      let newScript = {
        name: newName + " (local)",
        script: newName,
        local: true
      }
      
      let scripts = _.cloneDeep(this.state.scripts)
      
      scripts.unshift(newScript)
      
      let storKey = getLocalScriptKey(newName)
      
      localStorage.setItem(storKey, "[]")
      
      if (!localStorage.ipaScriptRunnerLocalScripts)
        localStorage.setItem("ipaScriptRunnerLocalScripts", newName)
      else
        localStorage.setItem("ipaScriptRunnerLocalScripts", localStorage.ipaScriptRunnerLocalScripts + "," + newName)
      
      this.setState({scripts: scripts, selectedScript: newScript}, this.getScriptText)
    }
    
    removeLocalScript(e, scriptname) {
      
      e.preventDefault()
      let storKey = getLocalScriptKey(scriptname)
      localStorage.removeItem(storKey)
      let scriptNames = localStorage.ipaScriptRunnerLocalScripts.split(',')
      _.pull(scriptNames, scriptname)
      localStorage.setItem("ipaScriptRunnerLocalScripts", scriptNames.join(','))
      let scripts = _.cloneDeep(this.state.scripts)
      _.remove(scripts, (n) => {
        return n.script === scriptname
      })
      if (this.state.selectedScript.script === scriptname)
        this.setState({scripts: scripts, selectedScript: scripts[0]})
      else
        this.setState({scripts: scripts})
    }

    async componentDidMount() {
        //When the page mounts load the asyn data (script and other)
        //and then create the column info for the upload table
        this.setState({isPageLoading: true});

        await this._loadAsyncData();

        this.setState({isPageLoading: false}, this.props.onLoadComplete);
        console.log('props', this.props);
        console.log('state', this.state);
    }

    render() {

        return (
        <div style={{display: 'flex'}}>
          {this.props.handler.config && this.props.handler.config.allowScriptInput &&
            <StackableDrawer level={1} iconKey='fas fa-cut' defaultOpen={false}>
                <div style={{fontWeight: 'bold', marginTop: '20px', marginBottom: '20px', marginLeft: '60px'}}>Snippets</div>
                <div className='script-input' style={{marginLeft: '20px'}}>
                  <textarea id="snippet" 
                    style={{width: '340px'}}
                    name="snippets" 
                    rows="100"
                    placeholder="Script Snippets"
                    onChange={this.saveSnippet}
                    onKeyDown={(e) => this.handleKeyDown(e, this.snippetInput, 'snippet')}
                    value={this.state.snippet}
                    ref={this.snippetInput}>
                  </textarea>
                </div>
            </StackableDrawer>}
          {this.props.handler.config && this.props.handler.config.allowScriptInput &&
              <StackableDrawer level={2} iconKey='fas fa-database' defaultOpen={false}>
                <div style={{fontWeight: 'bold', marginTop: '20px', marginLeft: '60px'}}>Local Scripts</div>
                <div style={{marginTop: '40px', marginLeft: '60px'}}>
                  {this.state.scripts.filter((scriptoption) => scriptoption.local).map((scriptoption, index) => (<div style={{marginBottom: '10px'}} key={index}>
                    {scriptoption.script} <a href="#" style={{color: 'red', fontSize: '24px', display: 'inlineBlock', marginRight: '10px'}} onClick={(e) => this.removeLocalScript(e, scriptoption.script)}><i title='Delete Local Script' className='icon ion-android-cancel'></i></a>
                  </div>))}
                </div>
          </StackableDrawer>}
          {this.props.handler.config && this.props.handler.config.allowScriptInput && this.state.helpLinks.length > 0 &&
              <StackableDrawer level={3} iconKey='fas fa-question' defaultOpen={false}>
                <div style={{fontWeight: 'bold', marginTop: '20px', marginLeft: '60px'}}>Help Topics</div>
                <div style={{marginTop: '40px', marginLeft: '60px'}}>
                  {this.state.helpLinks.map((link, index) => (<div style={{marginBottom: '10px'}} key={index}>
                    <a href={link.url} target='_blank'>{link.name}</a>
                  </div>))}
                </div>
          </StackableDrawer>}
            <div style={{width: '100%'}}>
            <div style={{padding: '40px'}} style={{marginTop: '20px'}}>
              
                <div style={{marginLeft: '15%', marginRight: '15%'}}>

                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Select
                            key={'scripts'}
                            value={{label: this.state.selectedScript.name, value: this.state.selectedScript, key: this.state.selectedScript.name}}
                            onChange={this.handleScriptSelect}
                            disabled={this.state.isRunning}
                            options={this.state.scripts.map((scr) => {
                                        return {key: scr.name, value: scr, label: scr.name}
                                    })}
                            styles={{container: (provided) => ({...provided, width: '40%', display: 'inline-block', marginLeft: '10%', marginRight: '15px', fontSize: '16px'})}}
                        />
                        {!this.state.isRunning && <GenericMatButton onClick={this.runScript} disabled={this.state.isRunning} customClasses="attention">Run</GenericMatButton>}
                        {this.state.isRunning && <span style={{fontSize: '16px'}}>Running {this.state.dots}</span>}
                        {this.props.handler.config && this.props.handler.config.allowScriptInput && <GenericMatButton onClick={() => this.toggleInputs('input')} disabled={this.state.isRunning} styles={{marginLeft: '10px', marginRight: '10px'}}>
                          {this.state.showInput ? 'Hide Input' : 'Show Input'}
                        </GenericMatButton>}
                        {this.props.handler.config && this.props.handler.config.allowScriptInput && <GenericMatButton onClick={() => this.toggleInputs('script')} disabled={this.state.isRunning}>
                          {this.state.showScript ? 'Hide Script' : 'Show Script'}
                        </GenericMatButton>}
                        <div style={{marginLeft: 'auto'}}>
                            {this.state.results.length > 0 && <a href="#" style={{color: 'red', fontSize: '24px', display: 'inlineBlock', marginRight: '10px'}} onClick={(e) => this.deleteResult(e)}><i title='Delete All' className='icon ion-android-cancel'></i></a>}
                        </div>
                    </div>
                    
                    {this.props.handler.config && this.props.handler.config.allowScriptInput && <div style={{display: 'grid', gridTemplateColumns: "auto 30%", gridColumnGap: '20px', marginTop: '20px'}}>
                      <div>
                        {this.state.showInput && <div>
                        <div className='script-input' style={{marginTop: '20px', width: '100%'}}>
                              <textarea id="scriptinput" 
                                style={{width: '100%'}}
                                name="scriptinput" 
                                rows="10"
                                placeholder="JSON Script Input"
                                value={this.state.scriptInput} 
                                onChange={(e) => this.onInputChange(e, 'input')}
                                onKeyDown={(e) => this.handleKeyDown(e, this.scriptInput, 'input')}
                                ref={this.scriptInput}>
                              </textarea>
                        </div>
                        {this.state.inputError && <div style={{color: 'red'}}>Input is not in JSON format</div>}
                        </div>}
                        {this.state.showScript && <div>
                        <div className='script-input' style={{marginTop: '20px', width: '100%'}}>
                              <textarea id="scriptjson" 
                                style={{width: '100%'}}
                                name="scriptjson" 
                                rows="20"
                                placeholder="JSON Script" 
                                value={this.state.scriptJSON} 
                                onChange={(e) => this.onInputChange(e, 'script')}
                                onKeyDown={(e) => this.handleKeyDown(e, this.scriptJSON, 'script')}
                                ref={this.scriptJSON}>
                              </textarea>
                        </div>
                        {this.state.scriptError && <div style={{color: 'red'}}>Script is not in JSON format</div>}
                        </div>}
                      </div>
                      <div>
                        <div style={{display: 'inline-flex', alignItems: 'center'}}>
                          <input type="text" id="newscripttoadd" value={this.state.newScriptName} onChange={this.handleNewScriptName}/>
                          <GenericMatButton disabled={this.state.isRunning} styles={{marginLeft: '10px', marginRight: '10px'}} onClick={this.addNewScript}>
                            Add Script
                          </GenericMatButton>
                        </div>
                        <hr/>
                        <div style={{fontWeight: 'bold'}}>Variables</div>
                        <div style={{display: 'inline-flex', alignItems: 'center'}}>
                          <input type="text" id="varnametoadd" value={this.state.addVariable} onChange={this.handleVariableName}/>
                          <GenericMatButton disabled={this.state.isRunning} styles={{marginLeft: '10px', marginRight: '10px'}} onClick={this.addScriptVar}>
                            Track
                          </GenericMatButton>
                          <div style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={this.clearVars}><i title='Delete' className='icon ion-android-cancel'></i></div>
                        </div>
                        <div style={{marginTop: '10px'}}>
                          <input type="checkbox" id="setq" value={this.state.convertSetq} checked={this.state.convertSetq} onChange={this.toggleConvertSetq}/>
                          <label style={{marginLeft: '5px'}}>Convert all $let to $setq when executing</label>
                        </div>
                        <hr/>
                        <ObjectInspector data={this.state.variables} initialExpandedPaths={['root', 'root.*']} theme={{...chromeLight, ...({ BASE_FONT_SIZE: '15px', TREENODE_FONT_SIZE: '15px'})}}/>
                      </div>
                    </div>}

                    {this.state.results.map((res, index) =>
                        <div key={index}><hr/>
                        <div className="mbsc-row mbsc-align-items-center">

                            <div className="mbsc-col-md-6 mbsc-col-6" style={{textAlign: 'left'}}>
                                <h4 style={{display: 'inline'}}>{res.name}</h4>
                                {!res.collapsed && <a href="#" style={{display: 'inline', marginLeft: '10px'}} onClick={(e) => this.toggleDisplay(e, index)}>{res.disp ? 'Raw' : 'Pretty'}</a>}
                            </div>
                            <div className="mbsc-col-md-6 mbsc-col-6" style={{textAlign: 'right'}}>
                                <a href="#" style={{textAlign: 'right', display: 'inlineBlock', marginRight: '10px'}} onClick={(e) => this.toggleCollapsed(e, index)}>{res.collapsed ? 'Show' : 'Hide'}</a>
                                <a href="#" style={{color: 'red', fontSize: '18px', textAlign: 'right', display: 'inlineBlock', marginRight: '10px'}} onClick={(e) => this.deleteResult(e, index)}><i title='Delete' className='icon ion-android-cancel'></i></a>
                            </div>
                        </div>

                            {!res.collapsed && <div style={{marginTop: '10px'}}>
                                {res.disp && <ObjectInspector data={res.data} theme={{...chromeLight, ...({ BASE_FONT_SIZE: '15px', TREENODE_FONT_SIZE: '15px'})}}/>}
                                {!res.disp && <pre contentEditable="true" suppressContentEditableWarning={true}>{JSON.stringify(res.data, null, 3)}</pre>}
                            </div>}

                    </div>)}

                </div>
                </div></div></div>
        )
    }
}

export default ScriptRunnerView;
