
import { IafProj, IafSession} from "@dtplatform/platform-api";

import * as PlatformApi from '@dtplatform/platform-api'
import {IafScriptEngine} from '@invicara/iaf-script-engine';
import * as UiUtils from '@dtplatform/ui-utils'

async function loadScript (query, ctx) {
  console.log('ScriptHelper loadScript query', query)
  if (!query) {
    console.warn('ScriptHelper loadScript: No script query in loadScript')
    return
  }
  if (isProjectNextGenJs()) {
    const ctx = {
      _namespaces: IafProj.getCurrent()._namespaces,
      authToken: IafSession.getAuthToken()
    }
    let criteria = { query: { _userType: query._userType } }
    console.log('ScriptHelper loadScript criteria', criteria)

    let scriptModule = await IafScriptEngine.dynamicImport(criteria, ctx)

    if (scriptModule) {
      console.log('ScriptHelper loadScript scriptModule', scriptModule)

      let loadedScripts = await IafScriptEngine.getVar('loadedScripts')
      console.log('ScriptHelper loadScript loadedScripts', loadedScripts)

      let loadedScriptsByUserTypes = await IafScriptEngine.getVar(
        'loadedScriptsByUserTypes'
      )
      console.log(
        'ScriptHelper loadScript loadedScriptsByUserTypes',
        loadedScriptsByUserTypes
      )

      if (!loadedScripts) {
        loadedScripts = scriptModule.default
      } else {
        loadedScripts = _.assign({}, loadedScripts, scriptModule.default)
      }

      if (!loadedScriptsByUserTypes) {
        loadedScriptsByUserTypes = {}
      }
      loadedScriptsByUserTypes[query._userType] = scriptModule.default

      console.log('ScriptHelper loadScript loadedScripts2', loadedScripts)
      await IafScriptEngine.setVar('loadedScripts', loadedScripts)

      console.log(
        'ScriptHelper loadScriptByUserTypes loadedScripts2',
        loadedScriptsByUserTypes
      )
      await IafScriptEngine.setVar(
        'loadedScriptsByUserTypes',
        loadedScriptsByUserTypes
      )
    } else {
      console.warn(
        `ScriptHelper loadScript: No script type ${query._userType} found.`
      )
    }
  } //else { // COMMENTING OUT WITH INTENT TO REMOVE IN THE FUTURE NOW THAT WE DON'T SUPPORT OLD EXPRESSIONS SCRIPTS
  // There should only be one, but API gets all, filters and then passes back.  Test return
  // let scripts = await IafProj.getScripts(IafProj.getCurrent(), { query: query });

  // if (!scripts || scripts.length === 0) {
  //     console.warn('ScriptHelper loadScript: No scripts found in loadScript.');
  //     return;
  // }
  // if (scripts.length > 1) {
  //     console.warn("ScriptHelper loadScript: Expecting a unique script in loadScript!");
  //     console.log(scripts);
  // }

  // let script = scripts[0];
  // let tipScriptVersion = _.find(script._versions, { _version: script._tipVersion })

  // let res = await expression.evalExpressions(tipScriptVersion._userData, undefined, ctx || _expressionExecCtx);

  // return res;
  //}
}

async function evalExpressions (str, operand, ctx) {
  let res = await expression.evalExpressions(
    eval(str),
    operand,
    ctx || _expressionExecCtx
  )
  return res
}

// Internal function for executing a script and (optionally) retrieving a scriptResVar
async function _execScript (scriptName, operand, scriptResVar, ctx) {
  let scriptRes = await expression.execScript(
    scriptName,
    operand,
    scriptResVar,
    ctx
  )

  return scriptRes
}

async function executeScript (scriptName, operand, scriptResVar, ctx, callback) {
  if (isProjectNextGenJs()) {
    //execute js script

    let loadedScripts = IafScriptEngine.getVar('loadedScripts')
    console.log('ScriptHelper executeScript loadedScripts', loadedScripts)

    let loadedScriptsByUserTypes = IafScriptEngine.getVar(
      'loadedScriptsByUserTypes'
    )
    console.log(
      'ScriptHelper executeScript loadedScriptsByUserTypes',
      loadedScriptsByUserTypes
    )

    if (!scriptName) {
      console.error('Script information is required!')
      return 'Script information is required!'
    }

    let scriptToExecute
    if (typeof scriptName === 'string') {
      if (!loadedScripts || !loadedScripts[scriptName]) {
        console.error(
          `executeScript "${scriptName}" not found on loadedScripts!`
        )
        return `executeScript "${scriptName}" not found on loadedScripts!`
      } else {
        scriptToExecute = loadedScripts[scriptName]
      }
    } else {
      if (!scriptName.userType || !scriptName.script) {
        console.error('Script Info missing userType and/or script!')
        return 'Script Info missing userType and/or script!'
      }

      if (
        !loadedScriptsByUserTypes ||
        !loadedScriptsByUserTypes[scriptName.userType] ||
        !loadedScriptsByUserTypes[scriptName.userType][scriptName.script]
      ) {
        console.error('Script Info missing userType and/or script!')
        return 'Script Info missing userType and/or script!'
      }

      scriptToExecute =
        loadedScriptsByUserTypes[scriptName.userType][scriptName.script]
    }

    if (scriptToExecute) {
      //Now that iaf-script-engine lies outside of PlatformAPI we have to put it back to keep scripts compatible
      const overloadedPlatformApi = { ...PlatformApi, IafScriptEngine }
      let libraries = {
        PlatformApi: overloadedPlatformApi,
        UiUtils,
        IafScriptEngine
      }
      console.log('ScriptHelper executeScript libraries', libraries)
      let result = scriptToExecute(operand, libraries, ctx, callback)
      if (result && result instanceof Promise) {
        result = await result
      }
      console.log(scriptName + ' loadedScript result:', result)
      return result
    }
  } // else { // COMMENTING OUT WITH INTENT TO REMOVE IN THE FUTURE NOW THAT WE DON'T SUPPORT OLD EXPRESSIONS SCRIPTS
  //     //execute DSL script existing code
  //     let dslScriptOutput;
  //     //domi 2022/May/03
  //     const c = {...(ctx || _expressionExecCtx),
  //         //reset previous script local variables (copied from scripRunner)
  //         _lV : {},
  //         //clear current script operand (copied from scripRunner)
  //         _csOP : {},
  //         //reset array of previous script promises
  //         //if one promise ($wait script) will fail in the script, all other queued promises will be rejected straight away
  //         //which is not good for scripts that loads all the project's collections
  //         _pSPs: []
  //     };
  //     try {
  //         dslScriptOutput = await _execScript(scriptName, operand, scriptResVar, c);
  //     } catch(e){
  //         console.error(`executeScript "${scriptName}" rejected`,e);
  //     }
  //     return dslScriptOutput;
  // }
}

async function executeScriptCallback (callbackName, operand, scriptResVar, ctx) {
  let scriptName = getScriptVar(callbackName, ctx || _expressionExecCtx)

  let scriptRes
  if (scriptName) {
    scriptRes = await _execScript(
      scriptName,
      operand,
      scriptResVar,
      ctx || _expressionExecCtx
    )
  }

  return scriptRes
}

function getScriptVar (scriptVar, ctx) {
  if (isProjectNextGenJs()) return IafScriptEngine.getVar(scriptVar)
  else return expression.getHeapVar(scriptVar, ctx || _expressionExecCtx)
}

function setScriptVar (scriptVar, value, ctx) {
  if (isProjectNextGenJs()) return IafScriptEngine.setVar(scriptVar, value)
  else return expression.setHeapVar(scriptVar, value, ctx || _expressionExecCtx)
}

// Replacements for the above; decouple from IAF_EXT_ specifics.  jl 01/26/19
// This returns a function that can be used on an array.filter call
function getFilterFunction (filters, filterOpts) {
  return sift.getFilter(filters, filterOpts)
}

// This returns a query object compatible with BE queries (and FE sift)
function getFilterQuery (filters, filterOpts) {
  return sift.getFilterQuery(filters, filterOpts)
}

// Set up a sort of "global" expression exec context in the browser;  jl 08/04/2019
let _expressionExecCtx
function initExpressionExecCtx () {
  _expressionExecCtx = expression.getExpressionExecCtx()
}

function releaseExpressionExecCtx () {
  expression.releaseExpressionExecCtx(_expressionExecCtx)
}

function getScriptOperators () {
  return expression.getOperators()
}

function isProjectNextGenJs () {
  const sessionProject = JSON.parse(sessionStorage.getItem('project'))
  console.log('sessionProject', sessionProject)
  if (sessionProject?._userAttributes?.hasOwnProperty('nextScriptEngine')) {
    console.log(
      'sessionProject._userAttributes.nextScriptEngine',
      sessionProject?._userAttributes?.nextScriptEngine
    )
    return sessionProject?._userAttributes?.nextScriptEngine
  } else {
    const currentProject = IafProj.getCurrent()
    console.log('currentProject', currentProject)
    return currentProject?._userAttributes?.nextScriptEngine
      ? currentProject._userAttributes.nextScriptEngine
      : false
  }
}

let ScriptHelper = {
  loadScript: loadScript,
  evalExpressions: evalExpressions,
  executeScript: executeScript,
  executeScriptCallback: executeScriptCallback,
  getScriptVar: getScriptVar,
  setScriptVar: setScriptVar,
  getFilterFunction: getFilterFunction,
  getFilterQuery: getFilterQuery,
  initExpressionExecCtx: initExpressionExecCtx,
  releaseExpressionExecCtx: releaseExpressionExecCtx,
  getScriptOperators: getScriptOperators,
  isProjectNextGenJs: isProjectNextGenJs
}

export default ScriptHelper
