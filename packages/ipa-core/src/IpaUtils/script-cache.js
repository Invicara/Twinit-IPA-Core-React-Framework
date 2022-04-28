import ScriptHelper from "./ScriptHelper";
import moment from "moment";
import _ from 'lodash'

let cachedPromises = {};
const SCRIPT_EXPIRATION_MINUTES_KEY = 'scriptExpirationMinutes';
const SCRIPT_EXPIRATION_ARGS_KEY = 'scriptExpiration';
const DEFAULT_EXPIRATION_MINUTES = 10;
const IGNORE_CACHED_RESULT_ARGS_KEY = 'ignoreCachedScriptResult';

const saveToCache = (key, value, expirationMins) => {
    cachedPromises[key] = {value, exp: moment().add(expirationMins, 'minutes')};
};

const getCached = (key) => {
    const {value, exp} = (cachedPromises[key] || {});
    if(exp && exp.isAfter(moment())){
        return value;
    } else {
        delete cachedPromises[key];
        return undefined;
    }
};

const getCachingArguments = (args) => {    
    let expirationPartition = _.partition(args, function(e) { return typeof e !== "undefined" && e.hasOwnProperty(SCRIPT_EXPIRATION_ARGS_KEY); });
    const scriptExpiration = expirationPartition[0];
    let scriptArgs = _.partition(expirationPartition[1], function(e) { return typeof e !== "undefined" && e.hasOwnProperty(IGNORE_CACHED_RESULT_ARGS_KEY); });
    return { 
        scriptArgs: scriptArgs[1],
        scriptExpiration: sessionStorage.getItem(SCRIPT_EXPIRATION_MINUTES_KEY) || (scriptExpiration.length && scriptExpiration[0].hasOwnProperty('scriptExpiration') ? scriptExpiration[0].scriptExpiration : DEFAULT_EXPIRATION_MINUTES),
        ignoreCachedResult: scriptArgs[0] && scriptArgs[0].length ? scriptArgs[0][0].ignoreCachedScriptResult : false
    }
}

const runScript = (...args) => {    
    console.log("runScript args", args);
    const {scriptArgs, scriptExpiration, ignoreCachedResult} = getCachingArguments(args);
    console.log("ignoreCachedResult", ignoreCachedResult);
    const plainArgs = JSON.stringify(scriptArgs);
    const cachedPromise = getCached(plainArgs);
    if(cachedPromise && !ignoreCachedResult) {
        console.log(scriptArgs[0]+" cachedPromise result:", cachedPromise);
        return cachedPromise;
    } else {
        const scriptResultPromise = ScriptHelper.executeScript(...scriptArgs);
        if(scriptExpiration > 0) {
            saveToCache(plainArgs,scriptResultPromise, scriptExpiration);
        }
        return scriptResultPromise;
    }
}

const clearCache = () => {
  cachedPromises = {}
}

const ScriptCache = { runScript, clearCache }

export default ScriptCache;