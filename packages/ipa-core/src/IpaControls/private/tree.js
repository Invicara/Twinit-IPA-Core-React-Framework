import _ from "lodash";

export const NODE_SEPARATOR = "_";
export const NODE_PROPERTY_SEPARATOR = "-";

export const parseNode = node => ({
    ...node,
    expanded: JSON.parse(node.expanded),
    isLeaf: JSON.parse(node.isLeaf),
    level: JSON.parse(node.level)
})

/**
 * @typedef {Object} NodeInfo
 * @property {string} displayName The node's name displayed to the user.
 * @property {number} level The node's level. Must be an positive integer. 
 * @property {number} position The node's position relative to other nodes in its level. Must be a positive integer.
 */

 export class NotANodeInfo extends Error {
    constructor(property, errorType) {
        super(`The value provided is not a NodeInfo object: the property "${property}" should be ${errorType}`)
    }
}

/**
 * @param {object} obj The object to check.
 * @throws {NotANodeInfo} if the object provided is not a NodeInfo.  
 */
export const isNodeInfo = (obj) => {



    if(!_.isPlainObject(obj) || obj === null) throw new NotANodeInfo("obj", "an object");

    if(!_.isString(obj.displayName)) throw new NotANodeInfo("displayName", "a string");

    if(obj.displayName.includes(NODE_SEPARATOR)) throw new NotANodeInfo(`displayName (${obj.displayName})`, `a string free of '${NODE_SEPARATOR}'`);

    if(!_.isInteger(obj.level) || obj.level < 0) throw new NotANodeInfo("level", "a positive integer");

    if(!_.isInteger(obj.position) || obj.position < 0) throw new NotANodeInfo("position", "a positive integer");

}

/**
 * @param {NodeInfo} nodeInfo All the necessary information to get the base name of the node.
 * @returns {string} The base name for the node under the following format level-position-displayName
 * @throws {NotANodeInfo} if nodeInfo is not a proper NodeInfo. 
 */
 export const stringifyNode = (nodeInfo) => {

    isNodeInfo(nodeInfo);

    return `${nodeInfo.level}${NODE_PROPERTY_SEPARATOR}${nodeInfo.position}${NODE_PROPERTY_SEPARATOR}${nodeInfo.displayName}`;
}

/**
 * 
 * @param {string} name The base name of the node you want to parse following this format : level-position-displayName
 * @returns {NodeInfo} All the information contained in the base name of a node, or undefined if name is undefined
 * @throws {NotANodeInfo} if the name provided does not yield a proper NodeInfo.
 */
export const parseNodeName = name => {

    if(name === undefined) return undefined;

    let [level, position, ...displayNameParts] = name.split(NODE_PROPERTY_SEPARATOR);

    level = _.parseInt(level);
    position = _.parseInt(position);

    const displayName = displayNameParts.join(NODE_PROPERTY_SEPARATOR)    
    let nodeInfo = {level, position, displayName};
    isNodeInfo(nodeInfo)
    return nodeInfo;
}

/**
 * 
 * @param {string} parentNodeBaseName The base name of the parent node.
 * @param {NodeInfo} childNodeInfo All the necessary information to get the base name of the child node.
 * @returns {string} The complete name for the child node under the following format parentNodeBaseName_nodeBaseName. If parentNodeInfo is undefined, it only stringifies the child node.
 */
 export const stringifyNodeWithParent = (parentBaseName, childNodeInfo) => {

    if(parentBaseName === undefined) {
        return stringifyNode(childNodeInfo)
    }
    return `${parentBaseName}${NODE_SEPARATOR}${stringifyNode(childNodeInfo)}`
 }

 export class InvalidNodeName extends Error {
    constructor(string) {
        super(`It looks like there is a '${NODE_SEPARATOR}' in the following node's name: ${string}. It's a reserved character and cannot be used in the node's display name`)
    }
 }

 /**
 * 
 * @param {string} name The complete name of the node you want to parse following this format : parentNodeBaseName_nodeBaseName
 * @returns {{parentNodeInfo: NodeInfo, childNodeInfo: NodeInfo}} All the information contained in the base name of the parent node and all the information contained in the base name of the child node. If the string input does not contain a _, we assume the string is the child node's base name and parse it accordingly, parentNodeIfno will then be undefined.
 * @throws {InvalidNodeName} if the strings contain more than one NODE_SEPERATOR, it means the display name from one of the nodes contained an NODE_SPERATOR, which is a reserved character.
 */
export const parseNodeNameWithParent = name => {
    let arr = name.split(NODE_SEPARATOR);
    if(arr.length === 1) {
        return {
            childNodeInfo: parseNodeName(arr[0])
        }
    } else if(arr.length === 2) {
        return {
            parentNodeInfo: parseNodeName(arr[0]),
            childNodeInfo: parseNodeName(arr[1])
        };
    } else {
        throw new InvalidNodeName(name)
    }
}


