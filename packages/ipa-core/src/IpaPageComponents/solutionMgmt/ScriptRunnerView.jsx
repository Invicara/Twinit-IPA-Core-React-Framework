import React from "react";
import {ObjectInspector, chromeLight } from 'react-inspector';
import Select from 'react-select';
import {IafScripts} from '@invicara/platform-api'
import _ from 'lodash'

import GenericMatButton from '../../IpaControls/GenericMatButton';
import ScriptHelper from "../../IpaUtils/ScriptHelper";
import {StackableDrawer} from '../../IpaDialogs/StackableDrawer'

import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import './monokai-sublime.css'
import './codemirror-ext.css'

const json5 = require('json5')

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
           showInput: false,
           scriptInput: "",
           inputError: false,
           showScript: true,
           showOutput: true,
           scriptJSON: "",
           scriptError: false,
           parsedScript: {},
           addVariable: "",
           variables: {},
           convertSetq: false,
           snippet: "",
           helpLinks: [],
           newScriptName: "",
           editor: null,
           hasBreakLine: false,
           operators: [],
           operatorSearchTerm: "",
           searchedOperators: null
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
       this.clearVarValue = this.clearVarValue.bind(this);
       this.toggleConvertSetq = this.toggleConvertSetq.bind(this);
       this.saveSnippet = this.saveSnippet.bind(this);
       this.handleNewScriptName = this.handleNewScriptName.bind(this);
       this.addNewScript = this.addNewScript.bind(this);
       this.removeLocalScript = this.removeLocalScript.bind(this);
       this.handleScriptGutterClick = this.handleScriptGutterClick.bind(this)
       this.setEditor = this.setEditor.bind(this)
       this.makeValidBreakMark = this.makeValidBreakMark.bind(this)
       this.makeInvalidBreakMark = this.makeInvalidBreakMark.bind(this)
       this.isValidBreakPoint = this.isValidBreakPoint.bind(this)
       this.findBreakLine = this.findBreakLine.bind(this)
       this.getOperatorHints = this.getOperatorHints.bind(this)
       this.searchOperators = this.searchOperators.bind(this)
       this.handleOpSearchTerm = this.handleOpSearchTerm.bind(this)
       this.clearOpSearchTerm = this.clearOpSearchTerm.bind(this)
       
       this.scriptInput = React.createRef();
       this.scriptJSON = React.createRef();
       this.snippetInput = React.createRef();

    }

    async _loadAsyncData() {
        //Loads data necessary for displaying the page

        let handler = this.props.handler;

        this.setState({handler});

        let scripts = ScriptHelper.getScriptVar('runnableScripts');
        if (!scripts) scripts = []
        
        if (handler.config && handler.config.allowScriptInput && scripts && scripts.length > 0) {
          
          let allParsedScripts = []
          for (let i = 0; i < handler.scriptTypes.length; i++) {

            let scr = await IafScripts.getScripts({query: {_userType: handler.scriptTypes[i]}})
            let scriptVer = _.find(scr[0]._versions, {_version: scr[0]._tipVersion})
            let script = scriptVer._userData
            let parsed = JSON.parse(script)
            allParsedScripts.push(...parsed)

          }

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

          let operators = ScriptHelper.getScriptOperators()
          operators.sort()

          this.setState({parsedScript: allParsedScripts, scripts: scripts, selectedScript: scripts[0], operators}, this.getScriptText)
          
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
          this.setState({scripts: scripts, selectedScript: scripts && scripts.length > 0 ? scripts[0] : null})
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

        let varName = this.state.addVariable
        if (varName.charAt(0) === "$")
          varName = varName.slice(1)

        variables[varName] = {}
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
    
    clearVars(v) {

      if (v !== 'all') {
        let variables = _.cloneDeep(this.state.variables)
        delete variables[v]
        this.setState({variables}, this.writeVars)
      } else
        this.setState({variables: {}}, this.writeVars)

    }

    clearVarValue(v) {
      ScriptHelper.setScriptVar(v, undefined)
      this.getScriptVars()
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
        let start = 0, end = 0;
        //if configured to display the script input and script always run the script from the ui
        if (this.props.handler.config && this.props.handler.config.allowScriptInput) {
          
          let scriptInput = this.state.scriptInput.trim()
          let scriptInputObj = scriptInput && scriptInput.length > 0 ? json5.parse(scriptInput) : {};
 
          let sourceJson
          if (this.state.hasBreakLine) {
            let lineInfo = this.findBreakLine(this.state.editor)
            if (!this.isValidBreakPoint(this.state.editor, lineInfo))
              sourceJson = this.state.scriptJSON
            else {
              let range = this.state.editor.getRange({line: 0, ch: 0}, {line: lineInfo.line, ch: lineInfo.text.length})
              sourceJson = range + "]"
            }
           
          } else
            sourceJson = this.state.scriptJSON

          try {
            let purifiedJSON = JSON.stringify(json5.parse(sourceJson))
            let restringedDef = "[{$defscript: {'testScript':" + purifiedJSON + "}}]"
          
            if (this.state.convertSetq)
              restringedDef = restringedDef.replaceAll("$let", "$setq")
         
            let validated = IafScripts.isValid(restringedDef)
          
            if (validated) {
              let evaldata = await ScriptHelper.evalExpressions(validated);
              start = new Date()
              data = await ScriptHelper.executeScript('testScript', scriptInputObj);
              end = new Date()
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
          } catch(e) {
            data = {error: "Script is not in the correct format!"}
          }
        } else {
          start = new Date()
          data = await ScriptHelper.executeScript(this.state.selectedScript.script);
          end = new Date()
        }
        
        let sName = this.state.selectedScript.name;
        let elapsed = (end.getTime() - start.getTime()) + " ms"
        results.unshift({name: sName, data: data, stamp: end.toLocaleString(), elapsed: elapsed, disp: true, collapsed: false});

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

    onInputChange(editor, data, value, which) {

      let inputError = false;
      if (this.props.handler.config && this.props.handler.config.allowScriptInput) {
        try {
          if (value.length) {
            json5.parse(value)
          }
        } catch (e) {
          inputError = true;
        }
      }
      
      if (which === 'input') 
        this.setState({scriptInput: value, inputError: inputError});
      else {
        this.setState({scriptJSON:value, scriptError: inputError, editor: editor});
        if (this.state.selectedScript.local) {
          localStorage.setItem(getLocalScriptKey(this.state.selectedScript.script), value)
        }
      }

      if (this.state.hasBreakLine) {
        let lineInfo = this.findBreakLine(editor)
        if (!this.isValidBreakPoint(editor, lineInfo))
          editor.setGutterMarker(lineInfo.line, "CodeMirror-breakpoint", this.makeInvalidBreakMark());
        else
          editor.setGutterMarker(lineInfo.line, "CodeMirror-breakpoint", this.makeValidBreakMark());
      }
      
    }
    
    toggleInputs(input) {
      
      if (input === 'input')
        this.setState({showInput: !this.state.showInput})
      else if (input === 'script')
        this.setState({showScript: !this.state.showScript})
      else
        this.setState({showOutput: !this.state.showOutput})
      
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

    makeValidBreakMark() {
      var marker = document.createElement("div");
      marker.style.color = "#cc3333";
      marker.innerHTML = "●";
      return marker;
    }

    makeInvalidBreakMark() {
      var marker = document.createElement("div");
      marker.style.color = "#3399ff";
      marker.innerHTML = "●";
      return marker;
    }

    isValidBreakPoint(e, lineInfo) {
      try {
        let range = e.getRange({line: 0, ch: 0}, {line: lineInfo.line, ch: lineInfo.text.length})
        range = range + "]"
        json5.parse(range)
        return true
      } catch(e) {
        return false
      }
    }

    findBreakLine(editor) {

      let line = null
      for (let i = 0; i < editor.doc.children[0].lines.length; i++) {
        line = editor.doc.children[0].lines[i]
        if (line.gutterMarkers && line.gutterMarkers.hasOwnProperty('CodeMirror-breakpoint'))
         break
      }

      return editor.lineInfo(editor.getLineNumber(line))

    }

    handleScriptGutterClick(editor, lineNum, gutter, event) {

      if (gutter === 'CodeMirror-breakpoint') {
        let lineInfo = editor.lineInfo(lineNum)

        //check if turning off breakpoint
        //clicked a line already set as breakLine
        if (lineInfo.gutterMarkers && lineInfo.gutterMarkers.hasOwnProperty('CodeMirror-breakpoint')) {
          editor.clearGutter("CodeMirror-breakpoint");
          this.setState({hasBreakLine: false})
        } else {
          //else remove existing break if it exists and create new one
          if (this.isValidBreakPoint(editor, lineInfo)) {
            if (this.state.hasBreakLine) editor.clearGutter("CodeMirror-breakpoint");
            editor.setGutterMarker(lineInfo.line, "CodeMirror-breakpoint", this.makeValidBreakMark());
            this.setState({hasBreakLine: true})
          }
        }
      }
    }

    setEditor(editor) {
      this.setState({editor})
    }

    getOperatorHints(editor, option) {
      return new Promise((resolve) => {
        var cursor = editor.getCursor(), line = editor.getLine(cursor.line)
        var start = cursor.ch, end = cursor.ch
        while (start && /\w|\$/.test(line.charAt(start - 1))) --start
        while (end < line.length && /\w/.test(line.charAt(end))) ++end
        var word = line.slice(start, end).toLowerCase()

        let completions = this.state.operators.filter(o => o.toLowerCase().startsWith(word.toLowerCase()))

        let completion = {
          list: completions,
          from: {line: cursor.line, ch:start},
          to: {line: cursor.line, ch: end}
        }

        resolve(completion)
      })
    }

    handleOpSearchTerm(e) {
     this.setState({operatorSearchTerm: e.target.value})
    }

    searchOperators() {
      let searchedOperators = this.state.operators.filter(o => o.toLowerCase().includes(this.state.operatorSearchTerm.toLowerCase()))
      this.setState({searchedOperators})
    }

    clearOpSearchTerm() {
      this.setState({searchedOperators: null, operatorSearchTerm: ""})
    }

    async componentDidMount() {
        //When the page mounts load the asyn data (script and other)
        //and then create the column info for the upload table
        this.setState({isPageLoading: true});

        await this._loadAsyncData();

        this.setState({isPageLoading: false}, this.props.onLoadComplete);
    }

    render() {

        return (
        <div style={{display: 'flex'}}>
          {this.props.handler.config && this.props.handler.config.allowScriptInput &&
            <StackableDrawer level={1} iconKey='fas fa-cut' isDrawerOpen={false}>
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
              <StackableDrawer level={2} iconKey='far fa-file-code' isDrawerOpen={false}>
                <div style={{marginTop: '10px', marginLeft: '60px'}}>
                  <input type="text" id="newscripttoadd" value={this.state.newScriptName} onChange={this.handleNewScriptName} style={{width: "80%"}}/>
                  <GenericMatButton disabled={this.state.isRunning} styles={{marginLeft: '110px', marginRight: '10px', marginTop: '5px'}} onClick={this.addNewScript}>
                    Add Script
                  </GenericMatButton>
                </div>
                <hr/>
                <div style={{fontWeight: 'bold', marginTop: '20px', marginLeft: '60px'}}>Local Scripts</div>
                <div style={{marginTop: '40px', marginLeft: '60px'}}>
                  {this.state.scripts.filter((scriptoption) => scriptoption.local).map((scriptoption, index) => (<div style={{marginBottom: '10px'}} key={index}>
                  <a href="#" style={{color: 'red', fontSize: '24px', display: 'inlineBlock', marginRight: '10px', marginTop: "5px"}} onClick={(e) => this.removeLocalScript(e, scriptoption.script)}><i title='Delete Local Script' className='icon ion-android-cancel'></i></a> {scriptoption.script}
                  </div>))}
                </div>
          </StackableDrawer>}
          {this.props.handler.config && this.props.handler.config.allowScriptInput &&
              <StackableDrawer level={3} iconKey='fas fa-eye' isDrawerOpen={false}>
                <div style={{marginTop: '10px', marginLeft: '60px'}}>
                <div style={{display: 'inline-flex', alignItems: 'center'}}>
                  <input type="text" id="varnametoadd" value={this.state.addVariable} onChange={this.handleVariableName}/>
                  <GenericMatButton disabled={this.state.isRunning} styles={{marginLeft: '10px', marginRight: '10px'}} onClick={this.addScriptVar}>
                    <i className="fas fa-eye"></i> Watch
                  </GenericMatButton>
                </div>
                  <div style={{marginTop: '10px'}}>
                    <input type="checkbox" id="setq" value={this.state.convertSetq} checked={this.state.convertSetq} onChange={this.toggleConvertSetq}/>
                    <label style={{marginLeft: '5px'}}>Convert all $let to $setq when executing</label>
                  </div>
                <hr/>
                <div style={{fontWeight: 'bold', marginTop: '20px', marginLeft: '60px', marginBottom: '10px'}}>Watched Variables</div>
                <div style={{cursor: 'pointer'}} onClick={() => this.clearVars('all')}>
                  <span style={{fontSize: '18px'}}><i title='Unwatch All' className='fas fa-eye-slash'></i></span>
                  <span>Unwatch All</span>
                </div>
                <hr/>
                {Object.keys(this.state.variables).map((v) => {
                  return <div key={v} style={{marginBottom: '10px'}}>
                    <div style={{display: 'inline-flex'}}>
                      <div style={{fontSize: '18px', cursor: 'pointer', marginRight: '10px'}} onClick={() => this.clearVars(v)}><i title='Unwatch' className='fas fa-eye-slash'></i></div>
                      <div style={{fontSize: '18px', cursor: 'pointer', marginRight: '10px'}} onClick={() => this.clearVarValue(v)}><i title='Clear Value' className='fas fa-times-circle'></i></div>
                      <span style={{fontWeight: 'bold'}}>{v}</span>
                    </div>
                    <ObjectInspector data={this.state.variables[v]} initialExpandedPaths={['root', 'root.*']} theme={{...chromeLight, ...({ BASE_FONT_SIZE: '15px', TREENODE_FONT_SIZE: '15px'})}}/>
                  </div>
                })}
              </div>
          </StackableDrawer>}
          {this.props.handler.config && this.props.handler.config.allowScriptInput && this.state.helpLinks.length > 0 &&
              <StackableDrawer level={4} iconKey='fas fa-dollar-sign' isDrawerOpen={false}>
                <div style={{marginTop: '10px', marginLeft: '60px'}}>
                  <div style={{display: 'inline-flex', alignItems: 'center'}}>
                    <input type="text" id="opsearchterm" value={this.state.operatorSearchTerm} onChange={this.handleOpSearchTerm}/>
                    <div style={{fontSize: '18px', cursor: 'pointer', marginLeft: '5px'}} onClick={this.clearOpSearchTerm}><i title='Clear Search' className='fas fa-times-circle'></i></div>
                    <GenericMatButton disabled={this.state.isRunning} styles={{marginLeft: '10px', marginRight: '10px'}} onClick={this.searchOperators}>
                      Search  
                    </GenericMatButton>
                  </div>
                </div>
                <hr/>
                <div style={{fontWeight: 'bold', marginTop: '20px', marginLeft: '60px'}}>Operators</div>
                <div style={{marginTop: '20px', marginLeft: '60px'}}>
                  {!this.state.searchedOperators ? this.state.operators.map((op, index) => (<div style={{marginBottom: '10px'}} key={index}>
                    {op}
                  </div>)) : this.state.searchedOperators.map((op, index) => (<div style={{marginBottom: '10px'}} key={index}>
                    {op}
                  </div>))}
                </div>
          </StackableDrawer>}
          {this.props.handler.config && this.props.handler.config.allowScriptInput && this.state.helpLinks.length > 0 &&
              <StackableDrawer level={5} iconKey='fas fa-question' isDrawerOpen={false}>
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
                            value={{label: this.state.selectedScript ? this.state.selectedScript.name : "", value: this.state.selectedScript ? this.state.selectedScript : "", key: this.state.selectedScript ? this.state.selectedScript.name : ""}}
                            onChange={this.handleScriptSelect}
                            disabled={this.state.isRunning || !this.state.selectedScript}
                            options={this.state.scripts.map((scr) => {
                                        return {key: scr.name, value: scr, label: scr.name}
                                    })}
                            styles={{container: (provided) => ({...provided, zIndex: 1000, width: '40%', display: 'inline-block', marginLeft: '10%', marginRight: '15px', fontSize: '16px'})}}
                        />
                        {!this.state.isRunning && <GenericMatButton onClick={this.runScript} disabled={this.state.scriptError} customClasses="attention">Run</GenericMatButton>}
                        {this.state.isRunning && <span style={{fontSize: '16px'}}>Running {this.state.dots}</span>}
                        {this.props.handler.config && this.props.handler.config.allowScriptInput && <GenericMatButton onClick={() => this.toggleInputs('input')} disabled={this.state.isRunning} styles={{marginLeft: '20px', marginRight: '10px'}}>
                          {this.state.showInput ? 'Hide Input' : 'Show Input'}
                        </GenericMatButton>}
                        {this.props.handler.config && this.props.handler.config.allowScriptInput && <GenericMatButton onClick={() => this.toggleInputs('script')} disabled={this.state.isRunning} styles={{marginLeft: '10px', marginRight: '10px'}}>
                          {this.state.showScript ? 'Hide Script' : 'Show Script'}
                        </GenericMatButton>}
                        {this.props.handler.config && this.props.handler.config.allowScriptInput && <GenericMatButton onClick={() => this.toggleInputs('output')} disabled={this.state.isRunning} styles={{marginLeft: '10px'}}>
                          {this.state.showOutput ? 'Hide Output' : 'Show Output'}
                        </GenericMatButton>}
                    </div>
                    
                    {this.props.handler.config && this.props.handler.config.allowScriptInput && <div style={{marginTop: '20px'}}>
                      <div style={{height: 'fit-content'}}>
                        {this.state.showInput && <div>
                        <div className='script-input' style={{marginTop: '20px', width: '100%'}}>
                          <CodeMirror
                            value={this.state.scriptInput}
                            options={{
                              mode: 'javascript',
                              theme: 'monokai-sublime',
                              lineNumbers: true,
                              matchBrackets: true,
                              autoCloseBrackets: true,
                              foldGutter: true,
                              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
                            }}
                            className='cm-inputer'
                            onBeforeChange={(editor, data, value) => this.onInputChange(editor, data, value, 'input')}
                          />
                        </div>
                        {this.state.inputError && <div style={{color: 'red'}}>Input is not in JSON format</div>}
                        </div>}
                        {this.state.showScript && <div>
                        {this.state.scriptError && <div style={{color: 'red'}}>Script is not in correct format</div>}
                        <div className='script-script' style={{marginTop: '20px', width: '100%'}}>
                          <CodeMirror
                            value={this.state.scriptJSON}
                            options={{
                              mode: 'javascript',
                              theme: 'monokai-sublime',
                              lineNumbers: true,
                              matchBrackets: true,
                              autoCloseBrackets: true,
                              foldGutter: true,
                              extraKeys: {'Ctrl-/': function(editor) {editor.execCommand('toggleComment')}, "Ctrl-Space": "autocomplete"},
                              hintOptions: {hint: this.getOperatorHints},
                              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-breakpoint']
                            }}
                            className='cm-scripter'
                            onBeforeChange={(editor, data, value) => this.onInputChange(editor, data, value, 'script')}
                            onGutterClick={this.handleScriptGutterClick}
                            editorDidMount={this.setEditor}
                          />
                        </div>
                        {this.state.scriptError && <div style={{color: 'red'}}>Script is not in correct format</div>}
                        </div>}
                      </div>
                    </div>}

                    {this.state.showOutput && this.state.results.map((res, index) =>
                        <div key={index}><hr/>
                        <div className="mbsc-row mbsc-align-items-center" style={{marginBottom: '15px'}}>
                            <div className="mbsc-col-md-6 mbsc-col-12">
                              {this.state.results.length > 0 && <div style={{textAlign: 'right', color: 'red'}}>
                                Delete All Results
                                <a href="#" style={{color: 'red', fontSize: '24px', display: 'inlineBlock', marginLeft: '10px'}} onClick={(e) => this.deleteResult(e)}><i title='Delete All' className='icon ion-android-cancel'></i></a>
                              </div>}
                            </div>
                        </div>
                        <div className="mbsc-row mbsc-align-items-center">
                            <div className="mbsc-col-md-6 mbsc-col-6" style={{textAlign: 'left'}}>
                                <h4 style={{display: 'inline'}}>{res.name}</h4>
                                {!res.collapsed && <a href="#" style={{display: 'inline', marginLeft: '10px'}} onClick={(e) => this.toggleDisplay(e, index)}>{res.disp ? 'Raw' : 'Pretty'}</a>}
                            </div>
                            <div className="mbsc-col-md-6 mbsc-col-6" style={{textAlign: 'right'}}>
                                <a href="#" style={{textAlign: 'right', display: 'inlineBlock', marginRight: '10px'}} onClick={(e) => this.toggleCollapsed(e, index)}>{res.collapsed ? 'Show' : 'Hide'}</a>
                                <a href="#" style={{color: 'red', fontSize: '18px', textAlign: 'right', display: 'inlineBlock', marginRight: '10px'}} onClick={(e) => this.deleteResult(e, index)}><i title='Delete' className='icon ion-android-cancel'></i></a>
                            </div>
                            <div className="mbsc-col-md-12 mbsc-col-12" style={{textAlign: 'left', marginBottom: '10px'}}>
                                <span style={{paddingLeft: '15px', fontStyle: "italic"}}>{res.stamp}</span>
                                <span style={{paddingLeft: '15px', fontWeight: "bold"}}>({res.elapsed})</span>
                            </div>
                        </div>

                            {!res.collapsed && <div style={{marginTop: '10px', userSelect: 'text'}}>
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
