import _ from "lodash";


export const getElementId = (systemElement) => {
    return systemElement._id;
};

const getNodeChildren = (node, nodeIndex) => node.children.map(childId => nodeIndex[childId]).filter(node=>!!node);

const getLevel = (node, nodeIndex) => node?.parents && node.parents.length>0 ? getLevel(nodeIndex[node.parents[0]], nodeIndex) + 1 : 0;

const getLowestAvailableLevel = (aNodeIndex) => _.values(aNodeIndex).reduce((acc, currentValue) => Math.min(acc, currentValue.level),Number.MAX_SAFE_INTEGER);

const sortedAsDisplayed = aNodeIndex => _.sortBy(_.values(aNodeIndex).filter(node => node.level === getLowestAvailableLevel(aNodeIndex)), node => node.order)
    //.flatMap(getSortedChildren(aNodeIndex))
    .flatMap(flatMapCallbackFnFactory(aNodeIndex));

//const getSortedChildren = aNodeIndex => node => [node, ..._.sortBy(getNodeChildren(node, aNodeIndex), node => node.order).flatMap(getSortedChildren(aNodeIndex))];

const flatMapCallbackFnFactory = function(fullTree) {
    return function(currentValue, index, array) {
        //console.log("flatMapCallbackFnFactory currentValue", currentValue['Entity Name']);
        const step1 = _.sortBy(getNodeChildren(currentValue, fullTree), node => node.order || 0);
        //console.log(`flatMapCallbackFnFactory step1 for ${currentValue['Entity Name']}`, step1.map(n=>n['Entity Name']));
        const step2 = step1.flatMap(flatMapCallbackFnFactory(fullTree));
        //console.log(`flatMapCallbackFnFactory step2 for ${currentValue['Entity Name']}` , step2);
        return [currentValue,...step2];
    };
}

const sortNodes = (systemElements) => {
    if(!systemElements) {
        return [];
    }
    const newBareNodeIndex = systemElements.map(se => {
        const el = {...se};
        const node = {
            "id": getElementId(se),
            "Entity Name": se["Entity Name"],
            "order": el.localOrder,//order within this particular system
            "parents": el.upstream && /*prevent loop*/el.upstream!==getElementId(se) ? [el.upstream] : [],
            "children": el.downstream || systemElements.filter(ch=>!!ch.upstream && ch.upstream === getElementId(se) && /*prevent loop*/getElementId(ch)!==getElementId(se)).map(e=>getElementId(e)) || [],
        };
        //new node properties that don't need the full nodeIndex yet
        node.isLeaf = _.isEmpty(node.children);
        return node;
    }).reduce((index, current) => ({...index, [current.id]: current}), {});
    const nodeIndexWithLevel = _.mapValues(newBareNodeIndex, node => ({
        ...node,
        //new node properties that need full nodeIndex to calculate a value
        level: getLevel(node, newBareNodeIndex)
    }));


    return sortedAsDisplayed(nodeIndexWithLevel).map(node=>node.id);
}

export default function sortSystemElementIdsAsDisplayedInTree (systemElements, getElementId = getElementId) {
    const sortedSystemElementIds = sortNodes(systemElements);
    return {sortedSystemElementIds};
}