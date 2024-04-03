import _ from 'lodash';

export const useWithLinkedSelectChange = (selects, setSelects, currentValue, getSelectedValue, onChange, fetchOptions) => {

  const getSubsequentSelects = select => {
    return _.values(selects).slice(select.index + 1).reduce((acc, select) => ({
        ...acc,
        [select.display]: select
    }), {});
    };

const clearSelectsOptions = selectsToBeCleared => {
    const clearedSelects = _.mapValues(selectsToBeCleared, select  => ({...select, options: []}));
    setSelects(selects => ({...selects, ...clearedSelects}));
};

const handleChange = (selectId, selectedOption, select) => {
    const selectedValues = selectedOption ? (select.multi ? selectedOption : [selectedOption]).map(opt => (getSelectedValue(opt))) : [''];
    const newValue = {...currentValue, [selectId]: selectedValues};
    const subsequentSelects = getSubsequentSelects(select);
    onChange({...newValue, ..._.mapValues(subsequentSelects, () => [''])})
    clearSelectsOptions(subsequentSelects)
    if(selectedOption){
        fetchOptions(select, newValue)
    }
};

  return [handleChange]
}