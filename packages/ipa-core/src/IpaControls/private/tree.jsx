export const parseNode = node => ({
    ...node,
    expanded: JSON.parse(node.expanded),
    isLeaf: JSON.parse(node.isLeaf),
    level: JSON.parse(node.level)
})

export const stringifyName = (displayName, level, position) => `${level}-${position}-${displayName}`

export const parseName = name => {
    const [level, position, ...displayNameParts] = name.split("-");
    return {level, position, displayName: displayNameParts.join("-")}
}