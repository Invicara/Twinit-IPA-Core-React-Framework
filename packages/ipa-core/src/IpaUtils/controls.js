export const asSelectOption = option => ({value: option, label: option, key: option})

export const asSelectOptions = options => options.map(asSelectOption)