import { IafProj, IafSession} from "@dtplatform/platform-api";

import * as PlatformApi from '@dtplatform/platform-api'
import {IafScriptEngine} from '@invicara/iaf-script-engine';
import * as UiUtils from '@dtplatform/ui-utils'


const DeprecatedExpressionScriptError = new Error("Expression Script is no longer supported, please migrate this project to use JS scripts");

async function loadScript(query, ctx) {
  console.log('ScriptHelper loadScript query', query)
  if (!query) {
      console.warn("ScriptHelper loadScript: No script query in loadScript");
      return;
  }
  if (isProjectNextGenJs()) {
      const ctx = { _namespaces: IafProj.getCurrent()._namespaces, authToken: IafSession.getAuthToken() }
      let criteria = { query: {_userType: query._userType }}
      console.log('ScriptHelper loadScript criteria', criteria)

      let scriptModule = await IafScriptEngine.dynamicImport(criteria, ctx)

      if(scriptModule){
        console.log("ScriptHelper loadScript scriptModule", scriptModule)

        let loadedScripts = await IafScriptEngine.getVar('loadedScripts')
        console.log("ScriptHelper loadScript loadedScripts", loadedScripts)

        let loadedScriptsByUserTypes = await IafScriptEngine.getVar('loadedScriptsByUserTypes')
        console.log("ScriptHelper loadScript loadedScriptsByUserTypes", loadedScriptsByUserTypes)
  
        if (!loadedScripts) {
          loadedScripts = scriptModule.default
        }
        else {
          loadedScripts = _.assign({}, loadedScripts, scriptModule.default)
        }

        if (!loadedScriptsByUserTypes) {
          loadedScriptsByUserTypes = {}
        }
        loadedScriptsByUserTypes[query._userType] = scriptModule.default
  
        console.log("ScriptHelper loadScript loadedScripts2", loadedScripts)
        await IafScriptEngine.setVar('loadedScripts', loadedScripts)

        console.log("ScriptHelper loadScriptByUserTypes loadedScripts2", loadedScriptsByUserTypes)
        await IafScriptEngine.setVar('loadedScriptsByUserTypes', loadedScriptsByUserTypes)

      } else {
        console.warn(`ScriptHelper loadScript: No script type ${query._userType} found.`);
      }
  } else {
    throw DeprecatedExpressionScriptError;
  }
}


async function executeScript(scriptName, operand, scriptResVar, ctx, callback){
  if (isProjectNextGenJs()) {
    //execute js script

    let loadedScripts = IafScriptEngine.getVar('loadedScripts')
    console.log("ScriptHelper executeScript loadedScripts", loadedScripts)

    let loadedScriptsByUserTypes = IafScriptEngine.getVar('loadedScriptsByUserTypes')
    console.log("ScriptHelper executeScript loadedScriptsByUserTypes", loadedScriptsByUserTypes)

    if (!scriptName) {
      console.error('Script information is required!')
      return 'Script information is required!'
    }

    let scriptToExecute
    if (typeof scriptName === 'string') {
      if (!loadedScripts || !loadedScripts[scriptName]) {
        console.error(`executeScript "${scriptName}" not found on loadedScripts!`)
        return `executeScript "${scriptName}" not found on loadedScripts!`
      } else {
        scriptToExecute = loadedScripts[scriptName]
      }
    }
    else {
      if (!scriptName.userType || !scriptName.script) {
        console.error('Script Info missing userType and/or script!')
        return 'Script Info missing userType and/or script!'
      }

      if (!loadedScriptsByUserTypes || !loadedScriptsByUserTypes[scriptName.userType] || !loadedScriptsByUserTypes[scriptName.userType][scriptName.script]) {
        console.error('Script Info missing userType and/or script!')
        return 'Script Info missing userType and/or script!'
      }
      
      scriptToExecute = loadedScriptsByUserTypes[scriptName.userType][scriptName.script]
    }

    if (scriptToExecute) {
      //Now that iaf-script-engine lies outside of PlatformAPI we have to put it back to keep scripts compatible
      const overloadedPlatformApi = {...PlatformApi, IafScriptEngine}
      let libraries = { PlatformApi: overloadedPlatformApi, UiUtils, IafScriptEngine }
      console.log("ScriptHelper executeScript libraries", libraries);
      let result = scriptToExecute(operand, libraries, ctx, callback);
      if (result && result instanceof Promise) {
          result = await result;
      }
      console.log(scriptName+" loadedScript result:", result);
      return result
    }

  } else {
    throw DeprecatedExpressionScriptError;
  }
}

async function executeScriptCallback(callbackName, operand, scriptResVar, ctx) {
  let scriptName = getScriptVar(callbackName, ctx);

  let scriptRes;
  if (scriptName) {
    scriptRes = await _execScript(scriptName, operand, scriptResVar, ctx);
  }

  return scriptRes;
}

function getScriptVar(scriptVar, ctx) {
  if (isProjectNextGenJs())
    return IafScriptEngine.getVar(scriptVar)
  else
    throw DeprecatedExpressionScriptError;
}

function setScriptVar(scriptVar, value, ctx) {
  if (isProjectNextGenJs())
    return IafScriptEngine.setVar(scriptVar, value)
  else
    throw DeprecatedExpressionScriptError;
}


function isProjectNextGenJs() {
  const sessionProject = JSON.parse(sessionStorage.getItem('project'))
  console.log("sessionProject", sessionProject)
  if(sessionProject._userAttributes.hasOwnProperty('nextScriptEngine')) {
    console.log("sessionProject._userAttributes.nextScriptEngine", sessionProject._userAttributes.nextScriptEngine)
    return sessionProject._userAttributes.nextScriptEngine  
  }
  else {
    const currentProject = IafProj.getCurrent()
    console.log("currentProject", currentProject)
    return (currentProject?._userAttributes?.nextScriptEngine ? currentProject._userAttributes.nextScriptEngine : false)
  }
}

let ScriptHelper = {
  loadScript: loadScript,
  executeScript: executeScript,
  executeScriptCallback: executeScriptCallback,
  getScriptVar: getScriptVar,
  setScriptVar: setScriptVar,
  getScriptOperators: getScriptOperators,
  isProjectNextGenJs: isProjectNextGenJs
};

export default ScriptHelper;
