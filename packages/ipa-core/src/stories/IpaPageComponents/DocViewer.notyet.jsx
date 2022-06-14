import React from 'react';
import { Provider } from 'react-redux'
import PropTypes from 'prop-types';
import "./EntityListView.stories.scss";
import entitiesArray from "./sample_entities_1.json";
import actionsObj from "./sample_actions_1.json";
import store from "../../redux/store";
import IafDocViewer from "@invicara/iaf-doc-viewer";

/*
export default {
  title: 'Components/iaf-doc-viewer',
  component: IafDocViewer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators : [
    (Story) => (<Provider store={store}><Story/></Provider>)
  ]
};

const Template = (args) => {
  return <IafDocViewer
      style={{ height: '100%', width: '100%' }}
      {...args}/>;
};

export const Default = Template.bind({});
Default.args = {
  docIds: [0]
};

 */