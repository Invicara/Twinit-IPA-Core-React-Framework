import {TextSearch} from "./TextSearch";
import {TreeSearch} from "./TreeSearch";
import {AdvancedSearch} from "./AdvancedSearch";
import {ScriptedSelects} from "./EnhancedScriptedSelects";
import {ScriptedLinkedSelects} from "./EnhancedScriptedLinkedSelects";
import {CreatableScriptedSelects} from "./CreatableScriptedSelects";
import {queryFromFilter} from "./private/filter";
import _ from "lodash";
import {parseNode, parseNodeNameWithParent} from "./private/tree";

const controlsMap = {
    '<<TEXT_SEARCH>>': TextSearch,
    '<<TREE_SEARCH>>': TreeSearch,
    '<<ADVANCED_SEARCH>>': AdvancedSearch,
    '<<SCRIPTED_SELECTS>>': ScriptedSelects,
    '<<SCRIPTED_LINKED_SELECTS>>': ScriptedLinkedSelects,
    '<<CREATABLE_SCRIPTED_SELECTS>>': CreatableScriptedSelects,
    '<<HIERARCHY>>': () => <div style={{margin: 10}}>Deprecated hierarchy control. Please use Scripted Linked Selects
        instead</div>, //TODO Remove when fully deprecated
};

const getScriptedSelectQuery = (selector, value) => {//TODO make this code cleaner
    let op = !!selector.op ? selector.op : "$and";
    let props = Object.keys(value);
    let hasMultiProps = props.length > 1;
    let query = {};
    if (hasMultiProps) {
        query[op] = props.map((prop) => {

            //check if the selectBy config provides the propName to query
            let selectConfig = _.find(selector.selects, {display: prop});

            let propName = selectConfig && selectConfig.propName ? selectConfig.propName : 'properties.' + prop + '.val';
            let qOption = {};
            if (value[prop].length > 0) {
                qOption[propName] = {$in: value[prop]};
            }
            return qOption
        });
    } else {
        //check if the selectBy config provides the propName to query
        let selectConfig = _.find(selector.selects, {display: props[0]});

        let propName = selectConfig && selectConfig.propName ? selectConfig.propName : 'properties.' + props[0] + '.val';
        query[propName] = {$in: value[props[0]]}
    }
    return query;
}

//Other
const asOptional = (object, path) => _.isEmpty(_.get(object, path)) ? [] : [object];

const getTreeSelectQuery = (selector, filteringNodes) => {
    const getQueryNodesFor = (nodeNames) => {
        return {
            "$or": _.values(_.pick(filteringNodes, nodeNames))
                .map(node => !node.isLeaf?
                    ({
                        "$and": [
                            { [`properties.${selector.treeLevels[node.level].property}.val`]: parseNodeNameWithParent(node.name).childNodeInfo.displayName },
                            ...asOptional(getQueryNodesFor(node.children), "$or")
                        ]
                    }) :
                    ({
                        "$and": buildLeafQuery(selector, node)
                    })
                )
        }
    }

    let isNotEmpty = !_.isEmpty(filteringNodes);

    let parsedNodes = _.mapValues(filteringNodes,parseNode);
    let parsedNodesKeys = _.keys(parsedNodes)

    let query = getQueryNodesFor(parsedNodesKeys);

    return isNotEmpty && query;
}

// We want to include both the parent branch and selected leaf as part of the query. Otherwise
// risk of returning results where leaf nodes have the same name in multiple separate branches
const buildLeafQuery = (selector, node) => {
    let query = [{[`properties.${selector.treeLevels[node.level].property}.val`]: parseNodeNameWithParent(node.name).childNodeInfo.displayName}]

    const parentLevel = node.level - 1

    if (node.parents?.length > 0 && selector.treeLevels[parentLevel]) {
        node.parents.forEach((p) => {
            query.push({[`properties.${selector.treeLevels[parentLevel].property}.val`]: parseNodeNameWithParent(p).childNodeInfo.displayName})
        })
    }

    return query
}

//It makes sense that the responsibility of knowing how to build a query be *inside* each query control. Probably they
// could actually build the query before calling 'onFetch'. However, such a refactor would be bigger so for now, we're
// just encapsulating controls and their related behavior in this Provider.
const queryBuilders = {
    "<<TEXT_SEARCH>>": (value, selector) => ({$text: {$search: value}}),
    "<<ADVANCED_SEARCH>>": (value, selector) => queryFromFilter(value),
    "<<SCRIPTED_LINKED_SELECTS>>": (value, selector) => getScriptedSelectQuery(selector, value),
    "<<TREE_SEARCH>>": (value, selector) => getTreeSelectQuery(selector, value),
    "<<SCRIPTED_SELECTS>>": (value, selector) => getScriptedSelectQuery(selector, value),
    "<<ID_SEARCH>>": (value, selector) => ({_id: {$in: value}})
};

export const ControlProvider = {
    getControlComponent: (selector) => controlsMap[selector?.query],

    getQuery: (value, selector) => {
        const queryBuilder = queryBuilders[selector.query];
        if (!queryBuilder) console.error("unknown selector query type:", selector.query);
        return queryBuilder(value, selector);
    }
}
