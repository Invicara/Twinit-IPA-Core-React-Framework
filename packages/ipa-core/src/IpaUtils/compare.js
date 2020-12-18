import _ from 'lodash'
/**
 * Checks if to lists have the same elements, in the same order. Considers empty lists as equal.
 * If lists are same by reference, it skips the deep comparison
 * @param list
 * @param otherList
 * @returns {boolean}
 */
export const listEquals = (list, otherList) => list === otherList || (listIncludes(list, otherList) && listIncludes(otherList, list))

/**
 * Checks if all elements of `otherList` are included in `list`, maintaining the order
 * @param list
 * @param otherList
 * @returns {boolean}
 */
export const listIncludes = (list = [], otherList = []) => otherList.every((element, i) => list[i] === element);

/**
 * Checks if a given set of propNames are equal among 2 prop objects. Useful for component memoization
 * Based on lodash's `eq`
 * @param propNames
 * @returns {function(*, *): *}
 */
export const propsEqual = (propNames) => (prevProps, nextProps) => propNames.every(propName => _.eq(prevProps[propName], nextProps[propName]));

/**
 * Checks if all elements of `includer` are included in `included`, disregarding the order.
 * Applies `idGetter` to elements to extract identifier. If none provided, `idGetter` defaults to identity
 * Complexity is n^2, not recommended for big sets
 * @param includer
 * @param included
 * @param idGetter
 * @returns {boolean}
 */
export const setIncludesBy = (includer = [], included = [], idGetter = _.identity) =>
    included.every(includedElement => includer.some(includerElement => idGetter(includerElement) === idGetter(includedElement)));

const compare = {
    listEquals,
    listIncludes,
    propsEqual,
    setIncludesBy
}

export default compare