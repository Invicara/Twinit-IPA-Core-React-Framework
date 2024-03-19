import React from 'react';
import { Provider } from 'react-redux'
import {EntityListView} from "../../IpaPageComponents/entities/EntityListView";
import "./EntityListView.stories.scss";
import entitiesArray from "./sample_entities_1.json";
import actionsObj from "./sample_actions_1.json";
import store from "../../redux/store";

export default {
  title: 'Components/EntityListView',
  component: EntityListView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators : [
    (Story) => (<Provider store={store}><Story/></Provider>)
  ]
};

const Template = (args) => {
  return <EntityListView {...args}/>;
};

export const Default = Template.bind({});
Default.args = {
  entityPlural: "Animals",
  entitySingular: "Animal",
  context: {
    "ifefPlatform": {
      "isIOS": true,
      "isAndroid": false,
      "isCordova": false,
      "transitionTimeOut": 450,
      "name": "iOS"
    },
    "ifefSnapper": {},
    "ifefNavDirection": "forward"
  },
  "config": {
    "name": "EntityListView",
    "className": "entity-list-view-default",
    "multiselect": true,
    "columns": [
      {
        "name": "Name",
        "accessor": "Entity Name"
      },
      {
        "name": "Mark",
        "accessor": "properties.Mark"
      },
      {
        "name": "BA Name",
        "accessor": "properties.BA Name"
      }
    ]
  },
  entities: entitiesArray,
  actions: actionsObj,
  onDetail: (...args) => console.log("onDetail clicked with args: ",args),
  onChange: (...args) => console.log("onChange clicked with args: ",args),
  onSortChange: (...args) => console.log("onSortChange clicked with args: ",args),
  selectedEntities: []
};