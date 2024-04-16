import { FetchingLegend } from "../../IpaControls/FetchingLegend";

export default {
  title: "Controls/FetchingLegend",
  component: FetchingLegend,
};

const Template = (args) => {
  return <FetchingLegend {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  legend: "Fetching data...",
};

Default.argTypes = {
  legend: {
    description: "Text describing data being fetched",
  },
};
