import { TextSearch } from "../../IpaControls/TextSearch";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/TextSearch",
  component: TextSearch,
  argTypes: {
    onClick: { action: "onClick" },
    onFetch: { action: "onFetch" },
  },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e) => {
    updateArgs({
      ...args,
      currentValue: e.target.value,
    });
  };

  const handleClick = (e) => {
    updateArgs({
      ...args,
      currentValue: "",
    });
  };

  return (
    <div onChange={handleChange} onClick={handleClick}>
      <TextSearch {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  currentValue: "",
  touched: false,
  display: "Search Text:",
  additionalOptions: (
    <div className="additional-options">Additional Options</div>
  ),
  isFetching: false,
  onChange: () => {},
};
