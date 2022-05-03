export const parseNode = node => ({
    ...node,
    expanded: JSON.parse(node.expanded),
    isLeaf: JSON.parse(node.isLeaf),
    level: JSON.parse(node.level)
})

/**
 * @typedef {Object} NodeInfo
 * @property {string} displayName The node's name displayed to the user.
 * @property {number|string} level The node's level.
 * @property {number|string} position The node's position relative to other nodes in its level.
 */

/**
 * 
 * @param {NodeInfo} nodeInfo All the necessary information to get the base name of the node.
 * @returns {string} The base name for the node
 */
export const stringifyNode = (nodeInfo) => `${nodeInfo.level}-${nodeInfo.position}-${nodeInfo.displayName}`

/**
 * 
 * @param {string} name The base name of the node you want to parse following this format : level-position-displayName
 * @returns {NodeInfo} All the information contained in the base name of a node
 */
export const parseNodeName = name => {
    const [level, position, ...displayNameParts] = name.split("-");
    return {level, position, displayName: displayNameParts.join("-")}
}
