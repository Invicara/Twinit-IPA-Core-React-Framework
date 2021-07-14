import AdvSearchQueryBuilder from "../../IpaUtils/AdvSearchQueryBuilder";

export const FILTER2OP = {
    "equals": AdvSearchQueryBuilder.Operators.equals,
    "does not equal": AdvSearchQueryBuilder.Operators.notEquals,
    "starts with": AdvSearchQueryBuilder.Operators.startsWith ,
    "ends with": AdvSearchQueryBuilder.Operators.endsWith,
    "contains": AdvSearchQueryBuilder.Operators.contains,
    "does not start with": AdvSearchQueryBuilder.Operators.doesNotStartsWith,
    "does not end with": AdvSearchQueryBuilder.Operators.doesNotEndsWith,
    "does not contain": AdvSearchQueryBuilder.Operators.doesNotContains,
    "less than": AdvSearchQueryBuilder.Operators.lessThan,
    "less than or equal to": AdvSearchQueryBuilder.Operators.lessThanEquals,
    "greater than": AdvSearchQueryBuilder.Operators.greaterThan,
    "greater than or equal to": AdvSearchQueryBuilder.Operators.greaterThanEquals,
    "between": AdvSearchQueryBuilder.Operators.inRange,
    "outside of": AdvSearchQueryBuilder.Operators.outOfRange,
    // "in": ,
    // "is not in": ,
}

const isTextOperator = (fop) => {
    return (
        fop == "equals" ||
        fop == "does not equal" ||
        fop == "starts with" ||
        fop == "ends with" ||
        fop == "contains" ||
        fop == "does not start with" ||
        fop == "does not end with" ||
        fop == "does not contain"
    )
}

const isRangeOperator = (fop) => {
    return (
        fop == "between" || fop == "outside of"
    )
}

export const queryFromFilter = (enhancedFilter) => {
    // "enhanced" because it contains includeAll and ignoreCase as well as the filters
    let searchTerms = Object.entries(enhancedFilter.filters).map(([property, filter]) => {
        let prop =  "properties." + property + ".val"
        if (filter.type=="date" || filter.type=="datetime")
            prop =  "properties." + property + ".epoch"
        let val = filter.value
        if (filter.type=="number" && !isRangeOperator(filter.op))
            val = parseFloat(val)
        let searchTerm = {property: prop, op: FILTER2OP[filter.op], value: val, type: filter.type}
        if (enhancedFilter.ignoreCase && isTextOperator(filter.op))
            searchTerm.options="i"
        return searchTerm
    })
    let searchOp = enhancedFilter.includeAll ? "$and" : "$or"
    return AdvSearchQueryBuilder.build(searchTerms, searchOp)
}
