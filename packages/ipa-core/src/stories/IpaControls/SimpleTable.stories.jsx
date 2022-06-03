import React from 'react';
import PropTypes from 'prop-types';
import SimpleTable from "../../IpaControls/SimpleTable";

export default {
  title: 'Controls/SimpleTable',
  component: SimpleTable,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  return <SimpleTable className="simple-property-grid simple-property-grid-header" {...args}/>;
};

export const WithColumnsAndObjects = Template.bind({});
WithColumnsAndObjects.args = {
  columns: [{
    name: "Test 1",
    accessor: "properties.BA Name"
  }],
  objects: [{
    _id: "1",
    properties: {
      "BA Name" : "Hello"
    }
  }]
};
