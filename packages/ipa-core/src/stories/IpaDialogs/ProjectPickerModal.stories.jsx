import React from 'react';
import PropTypes from 'prop-types';
import ProjectPickerModal from "../../IpaDialogs/ProjectPickerModal";
import {IfefModal} from "@invicara/react-ifef";
import {createLegacyContextSupport} from "../../IpaMock/util/legacyContext";

export default {
  title: 'Dialogs/ProjectPickerModal',
  component: ProjectPickerModal,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  return null;

  const IfefProvider = createLegacyContextSupport({ ifefPlatform: PropTypes.object })
  const context = {ifefPlatform:{}};
  return <IfefProvider context={context}>
      <ProjectPickerModal appContextProps={context} {...args}/>}
  </IfefProvider>;
};


export const Default = Template.bind({});
Default.args = {};