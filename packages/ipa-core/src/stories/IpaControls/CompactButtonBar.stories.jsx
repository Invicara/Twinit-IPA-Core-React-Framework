import CompactButtonBar from "../../IpaControls/CompactButtonBar"; // Adjust the path accordingly

export default {
  title: "Controls/CompactButtonBar",
  component: CompactButtonBar,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onClick: {
      control: "onClick",
    },
    onChange: {
      action: "changed",
    },
  },
};

const Template = (args) => {
  return <CompactButtonBar {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  actions: {
    action1: {
      title: "Download",
      text: "",
      icon: "icons/icon-download-purple.svg", // Path to the icon image for action 1
    },
    action2: {
      title: "Logout",
      text: "",
      icon: "icons/icon-logout-purple.svg", // Path to the icon image for action 2
    },
    action3: {
      title: "Reports",
      text: "",
      icon: "icons/icon-reports-purple.svg", // Path to the icon image for action 3
    },
    // Add more actions as needed
  },
  dashboard: {
    doAction: (action) => {
      console.log("Performing action:", action);
      // Add your doAction logic here if needed
    },
    props: {
      selectedItems: {
        ipaConfig: {
          referenceAppConfig: {
            refApp: false, // Example reference app configuration
          },
        },
      },
    },
  },
  orientation: "horizontal", // Orientation of the button bar (horizontal or vertical)
  styles: {
    // Optional styles object to customize the button bar's appearance
    backgroundColor: "lightgray",
    padding: "10px",
    borderRadius: "5px",
    fontSize: "10px",
  },
};
