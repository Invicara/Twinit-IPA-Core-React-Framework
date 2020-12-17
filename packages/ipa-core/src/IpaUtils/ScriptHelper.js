import { IafProj} from "@invicara/platform-api";

import { expression, sift } from '@invicara/expressions';



async function loadScript(query, ctx) {
  if(!query)
  {
    console.warn("No script query in loadScript");
    return;
  }

  // There should only be one, but API gets all, filters and then passes back.  Test return
  let scripts = await IafProj.getScripts(IafProj.getCurrent(), {query: query});

  if(!scripts || scripts.length === 0){
    console.warn('No scripts found in loadScript.');
    return;
  }
  if (scripts.length > 1) {
    console.warn("Expecting a unique script in loadScript!");
    console.log(scripts);
  }

  let script = scripts[0];

  let res = await expression.evalExpressions(script._versions[0]._userData, undefined, ctx || _expressionExecCtx);

  return res;
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

async function executeScript(scriptName, operand, scriptResVar, ctx){
  return await _execScript(scriptName, operand, scriptResVar, ctx || _expressionExecCtx);
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
  return expression.getHeapVar(scriptVar, ctx || _expressionExecCtx);
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


let ScriptHelper = {
  loadScript: loadScript,
  evalExpressions: evalExpressions,
  executeScript: executeScript,
  executeScriptCallback: executeScriptCallback,
  getScriptVar: getScriptVar,
  getFilterFunction: getFilterFunction,
  getFilterQuery: getFilterQuery,
  initExpressionExecCtx: initExpressionExecCtx,
  releaseExpressionExecCtx: releaseExpressionExecCtx
};

export default ScriptHelper;
