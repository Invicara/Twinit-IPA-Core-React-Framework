import React from 'react';
import { withReactContext } from 'storybook-react-context';
import ProjectPickerModal from "../IpaDialogs/ProjectPickerModal";
import AppProvider, {AppContext, withAppContext} from "../AppProvider";

export default {
  title: 'Dialogs/ProjectPickerModal',
  decorators: [
    withReactContext({
      Context: AppContext,
      initialState: {
        ifefPlatform:{},
        ifefKeyboardHeight:0,
        ifefShowModal: _.noop()
      },
    }),
  ],
  component: ProjectPickerModal,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  return <ProjectPickerModal {...args}/>
  //const context = {ifefPlatform:{}};
  //return <AppContext.Provider value={context} ifefPlatform={{}}><AppContext.Consumer>
  //  {(contextProps) => <ProjectPickerModal appContextProps={context} {...args} {...contextProps}/>}
  //</AppContext.Consumer></AppContext.Provider>;
};


export const Default = Template.bind({});
Default.args = {};
