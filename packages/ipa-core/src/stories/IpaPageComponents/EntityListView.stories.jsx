import React, { useState } from "react";
import { Provider } from "react-redux";
import { EntityListView } from "../../IpaPageComponents/entities/EntityListView";
import "./EntityListView.stories.scss";
import entitiesArray from "./sample_entities_1.json";
import actionsObj from "./sample_actions_1.json";
import store from "../../redux/store";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Components/EntityListView",
  component: EntityListView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
};

const Template = (args) => {
  const [selected, setSelected] = useState([]);
  const handleChange = (items) => {
    const filteredData = items
      .filter((item) => item.checked === true) // Filter to include only checked items
      .map(({ _id }) => ({ _id }));

    setSelected(filteredData);

    //updateArgs({ ...args, selectedEntities: filteredData });
  };
  return (
    <EntityListView
      {...args}
      onChange={handleChange}
      selectedEntities={selected}
    />
  );
};

const mockEntities = [
  {
    _id: "1",
    name: "Entity A",
    type: "Type 1",
    url: "https://example.com/a",
  },
  {
    _id: "2",
    name: "Entity B",
    type: "Type 2",
    url: "https://example.com/b",
  },
  {
    _id: "3",
    name: "Entity C",
    type: "Type 1",
    url: "https://example.com/c",
  },
];

export const Default = Template.bind({});
Default.args = {
  entityPlural: "Animals",
  entitySingular: "Animal",
  context: {
    ifefPlatform: {
      isIOS: true,
      isAndroid: false,
      isCordova: false,
      transitionTimeOut: 450,
      name: "iOS",
    },
    ifefSnapper: {},
    ifefNavDirection: "forward",
  },
  config: {
    name: "EntityListView",
    className: "entity-list-view-default",
    multiselect: true,
    columns: [
      { name: "ID", accessor: "_id" },
      { name: "Name", accessor: "name" },
      { name: "Description", accessor: "description" },
      { name: "Date Created", accessor: "createdAt" },
    ],
  },
  entities: mockEntities,
  actions: actionsObj,
  onDetail: (...args) => console.log("onDetail clicked with args: ", args),

  onSortChange: (...args) =>
    console.log("onSortChange clicked with args: ", args),
  selectedEntities: [],
};
