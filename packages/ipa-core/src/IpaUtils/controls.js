export const asSelectOption = option => ({value: option.value, label: option.display, key: option.display})

export const asSelectOptions = options => options.map(asSelectOption)