/**
 * Selection semantics for tree controls.
 *
 * Kept in its own module because FancyTreeControl needs it while
 * EntitySelectionPanel renders FancyTreeControl. Declaring it here breaks that
 * import cycle; EntitySelectionPanel re-exports it so existing consumers are
 * unaffected.
 */
export const TreeSelectMode = {
  NONE_MEANS_ALL: 'noneMeansAll',
  NONE_MEANS_NONE: 'noneMeansNone',
};
