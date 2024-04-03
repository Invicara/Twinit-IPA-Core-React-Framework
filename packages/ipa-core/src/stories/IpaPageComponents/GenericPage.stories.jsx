import React from 'react';
import sampleUserConfig from "./sample_user_config.json";
import sampleSelectedItems from "./sample_selectedItems.json";
import GenericPage from "../../IpaPageComponents/GenericPage";
import {decorateWithMockAppProvider} from "../../IpaMock/MockAppProvider";
import RenderHandlerByPath from "../mock/RenderRoute";
import _ from "lodash";

export default {
  title: 'Handlers/IpaPage',
  component: GenericPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators : [
    (Story, args) => {
      return decorateWithMockAppProvider(Story, {}, args.args.userConfig, args.args.currentPath, sampleSelectedItems);
    }]
};

const Template = (args) => {
  //!!IMPORTANT isProjectNextGenJs()  requires "project" in sessionStorage to be populated
  sessionStorage.setItem("project",JSON.stringify(sampleSelectedItems.selectedProject));

  //const appContextProps = {};
  //const ipaConfig = {};
  //localStorage.ipadt_selectedItems = JSON.stringify(sampleSelectedItems);

  const currentPath = args.currentPath || "/assets";
  return <RenderHandlerByPath path={currentPath}></RenderHandlerByPath>;
};

export const Assets = Template.bind({});
export const AssetsMocked = Template.bind({});
export const NavigatorMocked = Template.bind({});
Assets.args = {
  userConfig: _.merge(_.cloneDeep(sampleUserConfig), {})
};
AssetsMocked.args = {
  currentPath: "/assets",
  userConfig: _.merge(_.cloneDeep(sampleUserConfig), {
    handlers: {
      assets: {
        path: "/assets",
        pageComponent: "mock/EmptyComponent"
      }
    }
  })
};
NavigatorMocked.args = {
  currentPath: "/navigator",
  userConfig: _.merge(_.cloneDeep(sampleUserConfig), {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "mock/EmptyComponent"
      }
    }
  })
};
