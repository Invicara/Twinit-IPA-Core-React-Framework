import FancyTreeControl from "../../IpaControls/FancyTreeControl";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/FancyTreeControl",
  component: FancyTreeControl,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e, f) => {
    updateArgs({
      ...args,
      value: e.target.value,
    });
  };
  return (
    <div onChange={handleChange}>
      <FancyTreeControl {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  name: "Example Tree", // Define the name of the tree
  tree: {
    // Define the tree structure
    Root: {
      "Branch 1": [
        { _id: "1", name: "Leaf 1.1" },
        { _id: "2", name: "Leaf 1.2" },
      ],
      "Branch 2": [
        { _id: "3", name: "Leaf 2.1" },
        { _id: "4", name: "Leaf 2.2" },
      ],
    },
  },
  renderBranchNode: (nodeName, nodeValue) => {
    // Define a function to render branch nodes
    return <strong>{nodeName}</strong>;
  },
  renderLeafNode: (leafNode) => {
    // Define a function to render leaf nodes
    return leafNode.name;
  },
  onSelect: (selectedNodes, nodeName, nodeValue, isArray, selected) => {
    // Define a function to handle node selection
    console.log("Selected nodes:", selectedNodes);
    console.log("Node name:", nodeName);
    console.log("Node value:", nodeValue);
    console.log("Is array:", isArray);
    console.log("Selected:", selected);
    // Add your onSelect logic here
  },
  selectedIds: [], // Define selected node IDs if needed
  onSelectNone: () => {
    // Define a function to handle select none action if needed
    console.log("Select none action");
    // Add your onSelectNone logic here
  },
  onSelectIds: () => {
    // Define a function to handle select specific IDs if needed
    console.log("Select specific IDs action");
    // Add your onSelectIds logic here
  },
  singleSelect: false, // Define if only single selection is allowed
  allSelected: false, // Define if all nodes are selected
  treeSelectMode: "noneMeansAll", // Define the tree select mode
  onGroupSelect: () => {
    // Define a function to handle group selection
    console.log("Group select action");
    // Add your onGroupSelect logic here
  },
  selectedGroups: [], // Define selected groups if needed
  onExpand: () => {
    // Define a function to handle node expansion
    console.log("Expand node action");
    // Add your onExpand logic here
  },
  selectedNodeNames: [], // Define selected node names if needed
  expandedNodeNames: [], // Define expanded node names if needed
  partialNodeNames: [], // Define partial node names if needed
};
