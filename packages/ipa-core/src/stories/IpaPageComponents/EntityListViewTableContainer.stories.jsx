import React from 'react';
import { Provider } from 'react-redux'
import PropTypes from 'prop-types';
import {EntityListView} from "../../IpaPageComponents/entities/EntityListView";
import "./EntityListView.stories.scss";
import entitiesArray from "./sample_entities_1.json";
import actionsObj from "./sample_actions_1.json";
import store from "../../redux/store";
import {EntityListViewTableContainer} from "../../IpaPageComponents/entities/EntityListViewTableContainer";

export default {
  title: 'Components/EntityListViewTableContainer',
  component: EntityListViewTableContainer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators : [
    (Story) => (<Provider store={store}><Story/></Provider>)
  ]
};

const Template = (args) => {
  return <EntityListViewTableContainer {...args}/>;
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
    "numRows" : 5,
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