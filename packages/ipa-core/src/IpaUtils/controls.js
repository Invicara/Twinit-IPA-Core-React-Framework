import _ from "lodash"

export const asSelectOption = option => option ? ({value: option, label: option, key: option}) : undefined

export const asSelectOptions = options => _.defaultTo(options, []).map(asSelectOption)