

const Operators = {
    startsWith: "startsWith",
    endsWith: "endsWith",
    contains: "contains",
    doesNotStartsWith: "doesNotStartsWith",
    doesNotEndsWith: "doesNotEndsWith",
    doesNotContains: "doesNotContains",
    lessThan: "lessThan",
    lessThanEquals: "lessThanEquals",
    greaterThan: "greaterThan",
    greaterThanEquals: "greaterThanEquals",
    equals: "equals",
    notEquals:"notEquals",
    exists: "exists",
    inRange: "inRange",
    outOfRange: "outOfRange"
}

const QueryBuilders = {
    startsWith: (q) => buildRegex(q, "^{value}"),
    endsWith: (q) => buildRegex(q, "{value}$"),
    contains: (q) => buildRegex(q, "{value}"),
    doesNotStartsWith: (q) => buildRegex(q, "^(?!{value})"),
    doesNotEndsWith: (q) => buildRegex(q, "(?<!{value})$"),
    doesNotContains: (q) => buildRegex(q, "^((?!{value}).)*$"),
    lessThan: (q) => buildRelationalOps(q, "$lt"),
    lessThanEquals: (q) => buildRelationalOps(q, "$lte"),
    greaterThan: (q) => buildRelationalOps(q, "$gt"),
    greaterThanEquals: (q) => buildRelationalOps(q, "$gte"),
    equals: (q) => q.type=="text" ? buildRegex(q, "^{value}$") : buildRelationalOps(q, "$eq"),
    notEquals: (q) => q.type=="text" ? buildRegex(q, "^(?!{value}$)") : buildRelationalOps(q, "ne"),
    exists: (q) => buildRelationalOps(q, "$exists"),
    inRange: (q) => buildRelationalRangeOp(q, true),
    outOfRange: (q) => buildRelationalRangeOp(q, false)
}

function buildRelationalOps(q, op){
    let query = {};
    query[q.property] = {};
    query[q.property][op] = q.value;
    return query;
}

function buildRelationalRangeOp(q, inRange) {
  let rangeStart = buildRelationalOps({property: q.property, value: q.value.from}, inRange ? "$gte" : "$lt")
  let rangeEnd   = buildRelationalOps({property: q.property, value: q.value.to},   inRange ? "$lte" : "$gt")
  let op = inRange ? "$and" : "$or"
  let query = {}
  query[op] = [rangeStart, rangeEnd]
  return query
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function buildRegex(q, pattern){
    let query = {};
    query[q.property] = {"$regex": pattern.replace("{value}", escapeRegExp(q.value))};
    if(q.options){
        query[q.property] ["$options"] = q.options;
    }
    return query;
}

/**
 * @example
 *
 *  // Usage
 *  let operators = AdvSearchQueryBuilder.Operators;
 *  let query = [
 *      {property: "dtCategory", op:operators.contains, value: "Internal"},
 *      {property: "warrantyExpireDate", op:operators.lessThanEquals, value: 1585840038649}
 *  ]
 *
 *  let criteria = {query: AdvSearchQueryBuilder.build(query)};
 *  let res = await IafItemSvc.getRelatedItems(userCollection._id, criteria, ctx);
 *
 *
 * //Sample Queries, By default its case sensitive
 *
 *  [
 *      {property: "dtCategory", op:operators.startsWith, value: "Window"},
 *      {property: "dtCategory", op:operators.endsWith, value: "Bell"}
 *  ]
 *
 * // Case insensitive, use options: "i"
 *
 *  [
 *      {property: "dtCategory", op:operators.startsWith, value: "window", options:"i"},
 *      {property: "dtCategory", op:operators.endsWith, value: "Bell"}
 *  ]
 *
 * // Numbers
 *  [
 *      {property: "warrantyExpireDate", op:operators.greaterThanEquals, value: 1585840038649},
 *      {property: "warrantyExpireDate", op:operators.lessThanEquals, value: 1585840038649}
 *  ]
 *

 * @param query
 * @return {{$and: Array}}
 */
function build(query, op="$and"){
    if(!(query) || query.length == 0) {
        console.warn("query is empty");
        return;
    }

    let andQ = [];

    query.forEach(q=>{
        if(!(q.property) || !(q.op) ){
            throw new Error("Either property or op is missing");
        }
        andQ.push(QueryBuilders[q.op] (q))

    });

    let result = {};
    result[op] = andQ;
    return result;
}


const AdvSearchQueryBuilder = {
    Operators: Operators,
    build: build
}

export default AdvSearchQueryBuilder;
