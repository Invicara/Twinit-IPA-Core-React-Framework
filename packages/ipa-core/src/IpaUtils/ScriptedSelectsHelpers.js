export const loadPlainInitialValueWithScriptedSelectFormat = (onChange, plainInitialValue, selectIds) => {
    if(plainInitialValue && !_.isPlainObject(plainInitialValue)) {
        onChange(_.fromPairs(_.keys(selectIds).map((selectId, i) => {
            const correspondingInitialValue = Array.isArray(plainInitialValue)? plainInitialValue[i] : plainInitialValue;
            return [selectId, [correspondingInitialValue]]
        })))
    }
}