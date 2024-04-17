import React, { Fragment, useEffect, useRef, useState } from "react";
import Select, { highlightOptions } from "./Select";
import clsx from "clsx";
import _ from "lodash";
import { usePrevious } from "../IpaUtils/usePrevious";

import ScriptCache from "../IpaUtils/script-cache";
import { loadPlainInitialValueWithScriptedSelectFormat } from "../IpaUtils/ScriptedSelectsHelpers";
import { asSelectOptions } from "../IpaUtils/controls";

export const CreatableScriptedSelects = ({
  currentValue,
  onChange,
  multi,
  script,
  disabled,
  filterInfo,
  compact,
  horizontal,
  selectOverrideStyles,
  highlightedOptions,
  placeholder,
  isClearable = true,
  reloadTrigger,
  isTest = false,
}) => {
  const [selects, setSelects] = useState({});
  const [test, setTest] = useState(isTest);
  const { current: debouncedScriptExecutor } = useRef(
    _.debounce(ScriptCache.runScript, 1000, { leading: true, trailing: true }),
  );
  const prevFilterInfo = usePrevious(filterInfo);

  const value = currentValue || {};

  const fetchOptions = async (filterInfo) => {
    if (!isTest) {
      const selectOptions = filterInfo
        ? await debouncedScriptExecutor(script, { filterInfo: filterInfo })
        : await ScriptCache.runScript(script);
      setSelects(
        _.mapValues(selectOptions, (options) =>
          options?.sort((a, b) => a.localeCompare(b)),
        ),
      );
      loadPlainInitialValueWithScriptedSelectFormat(
        onChange,
        value,
        selectOptions,
      );
    } else {
      const testOptions = {
        select1: ["value 1"],
        select2: ["value 2"],
      };
      setSelects(testOptions);
      loadPlainInitialValueWithScriptedSelectFormat(
        onChange,
        value,
        testOptions,
      );
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [reloadTrigger]);

  useEffect(() => {
    if (filterInfo && !_.isEqual(filterInfo, prevFilterInfo))
      fetchOptions(filterInfo);
  }, [filterInfo]);

  const handleChange = (selectId, selected) => {
    //FIXME remove duplication - Maybe create a hook?
    let selectedValues;
    if (!selected || (Array.isArray(selected) && !selected.length)) {
      let newValue = { ...value, [selectId]: [] };
      onChange(newValue);
    } else {
      //check if a new value has been added and add it to the options
      if (selected.__isNew__) {
        let tempSelects = _.cloneDeep(selects);
        tempSelects[selectId].push(selected.value);
        tempSelects[selectId].sort((a, b) => a.localeCompare(b));
        setSelects(tempSelects);
      }

      selectedValues = selected
        ? (multi ? selected : [selected]).map((opt) => opt.value)
        : [];
      onChange({ ...value, [selectId]: selectedValues });
    }
  };

  return _.isEmpty(selects) ? (
    "Loading controls...\n"
  ) : (
    <div
      className={clsx(
        "scripted-selects-control",
        compact && "compact",
        horizontal && "horizontal",
      )}
    >
      {_.values(
        _.mapValues(selects, (options, selectId) => {
          const selectValue = _.compact(value[selectId]);
          let selectOptions = _.compact(asSelectOptions(options));
          selectOptions = highlightOptions(highlightedOptions, selectOptions);
          return (
            <Fragment key={selectId}>
              <Select
                labelProps={compact ? undefined : { text: selectId }}
                isMulti={multi}
                value={asSelectOptions(selectValue)}
                onChange={(selected) => handleChange(selectId, selected)}
                options={selectOptions}
                closeMenuOnSelect={!multi}
                styles={selectOverrideStyles}
                isClearable={isClearable}
                placeholder={placeholder}
                isDisabled={disabled}
                menuPlacement="auto"
                creatable
                menuPosition="fixed"
              />
            </Fragment>
          );
        }),
      )}
    </div>
  );
};
