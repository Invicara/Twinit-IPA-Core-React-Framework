import ScriptHelper from "./ScriptHelper";
import moment from "moment";
import _ from 'lodash'

let cachedPromises = {};
const SCRIPT_EXPIRATION_MINUTES_KEY = 'scriptExpirationMinutes';
const SCRIPT_EXPIRATION_ARGS_KEY = 'scriptExpiration';
const DEFAULT_EXPIRATION_MINUTES = 10;

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
    let scriptArgs = _.partition(args, function(e) { return typeof e !== "undefined" && e.hasOwnProperty(SCRIPT_EXPIRATION_ARGS_KEY); });
    const scriptExpiration = scriptArgs[0];
    return { 
        scriptArgs: scriptArgs[1],
        scriptExpiration: sessionStorage.getItem(SCRIPT_EXPIRATION_MINUTES_KEY) || (scriptExpiration.length && scriptExpiration[0].hasOwnProperty('scriptExpiration') ? scriptExpiration[0].scriptExpiration : DEFAULT_EXPIRATION_MINUTES)        
    }
}

const runScript = (...args) => {    
    const {scriptArgs, scriptExpiration} = getCachingArguments(args);
    const plainArgs = JSON.stringify(scriptArgs);
    const cachedPromise = getCached(plainArgs);
    if(cachedPromise) {
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