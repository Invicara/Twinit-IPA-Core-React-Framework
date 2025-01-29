import ScriptCache from "../../IpaUtils/script-cache";
import { loadPlainInitialValueWithScriptedSelectFormat } from "../../IpaUtils/ScriptedSelectsHelpers";
import {flattenIfNotMulti} from '../../IpaControls/EnhancedScriptedLinkedSelects'


export const fetchLinkedSelectValues = async (onChange) => {

  const querySelects = [
    {
        "display": "dtCategory",
        "script": "getDtCategories"
    },
    {
        "display": "dtType",
        "script": "getDtTypes"
    }
]

  let updatedValue = querySelects.reduce(
    (acc, select, i) => ({
      ...acc,
      [select.display]: { ...select, index: i, options: [] },
    }),
    {},
  )

let currentValue = {dtCategory:[''], dtType: ['']}

    let newSelects = await fetchOptions(updatedValue, undefined, undefined, onChange, currentValue);
    if (currentValue) {
      let selectKeys = Object.keys(newSelects); 
      let previousSelectValues = {};
      for (let i = 1; i < selectKeys.length; i++) {
        if (currentValue?.[selectKeys?.[i - 1]]?.length > 0) {
          previousSelectValues[selectKeys[i - 1]] =
          currentValue[selectKeys[i - 1]];
          newSelects = await fetchOptions(
            newSelects,
            newSelects[selectKeys[i - 1]],
            previousSelectValues,
            onChange,
            currentValue
          );
        } else break;
      }
    }
    return newSelects
  };

  const fetchOptions = async (testSelects, currentSelect, previousSelectsValues, onChange, currentValue) => {

    const nextSelect = _.values(testSelects)[currentSelect ? currentSelect.index + 1 : 0];
    let newSelects;

    if (nextSelect) {
      try {
        let selectOptions = await ScriptCache.runScript(
          nextSelect.script,
          previousSelectsValues
            ? { input: flattenIfNotMulti(previousSelectsValues, testSelects) }
            : undefined,
        )
        selectOptions = selectOptions || [];
        newSelects = {
          ...testSelects,
          [nextSelect.display]: {
            ...nextSelect,
            options: selectOptions.sort((a, b) => a.localeCompare(b)),
          },
        };
        testSelects = newSelects
      } catch(err) {
        console.error('Error found with LinkedSelectValues', err)
      }
    }
    loadPlainInitialValueWithScriptedSelectFormat(
      onChange,
      currentValue,
      testSelects,
    );
    return newSelects;
  };