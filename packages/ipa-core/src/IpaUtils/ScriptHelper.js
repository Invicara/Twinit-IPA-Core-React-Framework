import { IafProj, IafScriptEngine, IafSession} from "@invicara/platform-api";

import { expression, sift } from '@invicara/expressions';

import * as PlatformApi from '@invicara/platform-api'
import * as UiUtils from '@invicara/ui-utils'

async function loadScript(query, ctx) {
  if (!query) {
      console.warn("No script query in loadScript");
      return;
  }
  if (isProjectNextGenJs()) {
      const ctx = { _namespaces: IafProj.getCurrent()._namespaces, authToken: IafSession.getAuthToken() }

      let scriptModule = await IafScriptEngine.dynamicImport(query, ctx)
      console.log("scriptModule", scriptModule)
      let loadedScripts = IafScriptEngine.getVar("loadedScripts")
      console.log("loadedScripts", loadedScripts)

      if (!loadedScripts) loadedScripts = scriptModule
      else loadedScripts = Object.assign({}, loadedScripts, scriptModule)

      IafScriptEngine.setVar("loadedScripts", loadedScripts)
  } else {
      // There should only be one, but API gets all, filters and then passes back.  Test return
      let scripts = await IafProj.getScripts(IafProj.getCurrent(), { query: query });

      if (!scripts || scripts.length === 0) {
          console.warn('No scripts found in loadScript.');
          return;
      }
      if (scripts.length > 1) {
          console.warn("Expecting a unique script in loadScript!");
          console.log(scripts);
      }

      let script = scripts[0];
      let tipScriptVersion = _.find(script._versions, { _version: script._tipVersion })

      let res = await expression.evalExpressions(tipScriptVersion._userData, undefined, ctx || _expressionExecCtx);

      return res;
  }
}

async function evalExpressions(str, operand, ctx) {
  let res = await expression.evalExpressions(eval(str), operand, ctx || _expressionExecCtx);
  return res;
}

// Internal function for executing a script and (optionally) retrieving a scriptResVar
async function _execScript(scriptName, operand, scriptResVar, ctx) {

  let scriptRes = await expression.execScript(scriptName, operand, scriptResVar, ctx);

  return scriptRes;
}

async function executeScript(scriptName, operand, scriptResVar, ctx, callback){
  if (isProjectNextGenJs()) {
    //execute js script
    let loadedScripts = IafScriptEngine.getVar('loadedScripts')
    console.log("loadedScripts", loadedScripts)
    if (!loadedScripts.default[scriptName]) {
      //log console error and throw exception
      console.error(`executeScript "${scriptName}" not found on loadedScripts `)
    } else {
      let libraries = { PlatformApi, UiUtils }
      let result = loadedScripts.default[scriptName](operand, libraries, ctx, callback)
      if (result && result instanceof Promise) result = await result
      return result
    }
  } else {
    //execute DSL script existing code
    return await _execScript(scriptName, operand, scriptResVar, ctx || _expressionExecCtx);
  }
}

async function executeScriptCallback(callbackName, operand, scriptResVar, ctx) {
  let scriptName = getScriptVar(callbackName, ctx || _expressionExecCtx);

  let scriptRes;
  if (scriptName) {
    scriptRes = await _execScript(scriptName, operand, scriptResVar, ctx || _expressionExecCtx);
  }

  return scriptRes;
}

function getScriptVar(scriptVar, ctx) {
  if (isProjectNextGenJs())
    return IafScriptEngine.getVar(scriptVar)
  else
    return expression.getHeapVar(scriptVar, ctx || _expressionExecCtx);
}

function setScriptVar(scriptVar, value, ctx) {
  if (isProjectNextGenJs())
    return IafScriptEngine.setVar(scriptVar, value)
  else
    return expression.setHeapVar(scriptVar, value, ctx || _expressionExecCtx);
}

// Replacements for the above; decouple from IAF_EXT_ specifics.  jl 01/26/19
// This returns a function that can be used on an array.filter call
function getFilterFunction (filters, filterOpts) {
  return sift.getFilter(filters, filterOpts);
}

// This returns a query object compatible with BE queries (and FE sift)
function getFilterQuery (filters, filterOpts) {
  return sift.getFilterQuery(filters, filterOpts);
}

// Set up a sort of "global" expression exec context in the browser;  jl 08/04/2019
let _expressionExecCtx;
function initExpressionExecCtx() {
  _expressionExecCtx = expression.getExpressionExecCtx();
}

function releaseExpressionExecCtx() {
  expression.releaseExpressionExecCtx(_expressionExecCtx);
}

function getScriptOperators() {
  return expression.getOperators()
}

function isProjectNextGenJs() {
  const sessionProject = JSON.parse(sessionStorage.getItem('project'))
  console.log("sessionProject", sessionProject)
  console.log("sessionProject._userAttributes.nextScriptEngine", sessionProject._userAttributes.nextScriptEngine)
  if(sessionProject._userAttributes.hasOwnProperty('nextScriptEngine')) {
    return sessionProject._userAttributes.nextScriptEngine  
  }
  else {  
    const currentProject = IafProj.getCurrent()
    console.log("currentProject", currentProject)
    return (currentProject._userAttributes.nextScriptEngine ? currentProject._userAttributes.nextScriptEngine : false)
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
};

export default ScriptHelper;
