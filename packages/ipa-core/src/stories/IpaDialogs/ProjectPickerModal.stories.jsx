import React from 'react';
import PropTypes from 'prop-types';
import ProjectPickerModal from "../../IpaDialogs/ProjectPickerModal";
import {IfefModal} from "@invicara/react-ifef";

export default {
  title: 'Dialogs/ProjectPickerModal',
  component: ProjectPickerModal,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  const IfefProvider = createLegacyContextSupport({ ifefPlatform: PropTypes.object })
  const context = {ifefPlatform:{}};
  return <IfefProvider context={context}>
      <ProjectPickerModal appContextProps={context} {...args}/>}
  </IfefProvider>;
};


export const Default = Template.bind({});
Default.args = {};

/**
 * Legacy context support thanks to:
 * this post : https://gazedash.com/all/how-to-support-legacy-react-context/
 * this post was only missing info about `childContextTypes` which I got from here:
 * https://reactjs.org/docs/legacy-context.html
 */
const createLegacyContextSupport = (contextTypes) => {
  class LegacyContextSupport extends React.Component {
    getChildContext() {
      return this.props.context;
    }

    render() {
      return this.props.children;
    }
  }

  LegacyContextSupport.contextTypes = contextTypes;
  LegacyContextSupport.childContextTypes = contextTypes;
  return LegacyContextSupport;
}
