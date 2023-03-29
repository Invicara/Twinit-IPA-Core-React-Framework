import React, {useState,useEffect} from 'react';
import PropTypes from 'prop-types';
import GenericPage from "@invicara/ipa-core/modules/IpaPageComponents";
import {decorateWithMockAppProvider} from "@invicara/ipa-core/modules/IpaMock";
import {IafProj, IafScriptEngine, IafFetch} from "@invicara/platform-api";
import { Provider } from 'react-keep-alive';
import RenderHandlerByPath from "../mock/RenderRoute";
import _ from "lodash";

import sampleUserConfig from "./sample_user_config_Obayashi.json";
import sampleSelectedItems from "./sample_selectedItems.json";
import sampleIpaConfig from "../samples/strorybook_ipa_config2.json";
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";
import {useDispatch} from "react-redux";
import {ScriptHelper} from "@invicara/ipa-core/modules/IpaUtils";


const ipaConfigStoryOverwrite = {

  "configUserType": "user_group",

  "access_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3Nfa2V5X2lkIjoiMzE1OTRmN2UtZjkxZS00ZGVmLWJkYmMtNjE4OWQyNzUwZGIwIiwidXNlcl9uYW1lIjoiNmU1Mjc5MjItODg1ZS00MmI3LWIyMGEtYjgyOGIyYzc1ZTJmIiwic2NvcGUiOlsicmVhZCIsIndyaXRlIl0sImV4cCI6MTY3NDE0NzYxMSwiYXBwX2lkIjoiMGYwMmM4MTctODY1NS00MjNlLTlkMjItNTQzOTE4NzA3OGY5IiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImp0aSI6IjhmOWVmZTE3LTMxNmYtNGNjOS05Y2M4LTg5NDc2MThiMTkyZSIsImNsaWVudF9pZCI6IjBmMDJjODE3LTg2NTUtNDIzZS05ZDIyLTU0MzkxODcwNzhmOSJ9.hyCM1A5ZIKkxyGM71SQ6IahHHoOtikD4Adczt3s8w4-3NYY6pZb7sWqrwQEaoKorMQfm7oKkvsivhIEkvPYBtpPnOo8nnqBdtGfYhNpfZYGPtbgEvs9dShd89ZqzSKZnASFoZP0cfc-m3lNnPTMfV-71VfABjX_feMCsP1bRZUMcfa8Y8UIRhndK4dNOsWU2nuWLYI7Rqs1ylXYB6ltpjocUWQrH2ykvFgiB4CjBlf2PQATOo_8nmhSWpSBs0S-8GWzusfKtCNbMxPfee9yrPqCnjYJx44Iq6A8_A6acfvA9j6zjdIgH4cDT9eYtXBt-4n0XXTWZt_fz2j8AZVDSDg",
  "project_name" : "Obayashi",
  "user_group_name": "Solutions Mgmt",
  //"user_config_name": "DBM Solution Admin",//only use this is you want to use live config

  "endPointConfig": {
    "itemServiceOrigin": "https://staging-api.invicara.com",
    "passportServiceOrigin": "https://staging-api.invicara.com",
    "fileServiceOrigin": "https://staging-api.invicara.com",
    "datasourceServiceOrigin": "https://staging-api.invicara.com",
    "graphicsServiceOrigin": "https://staging-api.invicara.com",
    "pluginBaseUrl": "https://staging-api.invicara.com/downloads/IPAPlugins/",
    "baseRoot": "http://localhost:8083/digitaltwin"
  }
}

const onConfigLoad = async (store, config, state) => {
  let selectedModel = {};
  let selectedProj = IafProj.getCurrent();
  //load the model
  let models = null;
  models = await IafProj.getModels(selectedProj).catch((error) => {
    console.log(error),
        models = null
  });
  if (models) {
    let lastUploadedModel = _.sortBy(models, m => m._metadata._updatedAt);
    selectedModel = _.last(lastUploadedModel);

    //only reload the model if there is no loaded model already or
    //if the model which would be loaded is different than the model already loaded
    if (!state.selectedItems || !state.selectedItems.selectedModel || state._id !== state.selectedItems.selectedModel._id) {
      console.log('re/loading model');
      state.actions.setSelectedItems({selectedModel: selectedModel});
    }
  };

  console.log("config in story:",config);

}

export default {
  title: 'Handlers/IpaPage',
  component: GenericPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators : [
    //first decorator runs last
    (Story, args) => {
      return <Provider><Story/></Provider>;
    },
    (Story, args) => {
      const userConfig = _.merge(_.cloneDeep(sampleUserConfig), args.args.userConfigOverwrite || {});
      const ipaConfig = _.merge(_.cloneDeep(sampleIpaConfig), args.args.ipaConfigOverwrite || {})
      return decorateWithMockAppProvider(
          Story,
          ipaConfig,
          userConfig,
          args.args.currentPath,
          undefined,//sampleSelectedItems,
          {manageLoggedInUser : false, onConfigLoad : onConfigLoad});
    },
    //last decorator runs first
    (Story, args) => {
      Object.assign(endPointConfig, args.args.ipaConfigOverwrite.endPointConfig);
      Object.assign(IafFetch.CONFIG, args.args.ipaConfigOverwrite.endPointConfig);
      return <Story/>;
    },]
};

const StoryTemplate = (args) => {

  const currentPath = args.currentPath || "/assets";
  return <RenderHandlerByPath path={currentPath}></RenderHandlerByPath>;
};

export const Assets = StoryTemplate.bind({});
export const AssetsMocked = StoryTemplate.bind({});
export const Navigator = StoryTemplate.bind({});

export const NavigatorDevOneSpaceIsolated = StoryTemplate.bind({});
export const NavigatorDevOneSpaceSelected_Issue = StoryTemplate.bind({});
export const NavigatorDevOneSpacesSelectedColoured_Issue = StoryTemplate.bind({});

export const NavigatorDevThreeSpacesIsolated = StoryTemplate.bind({});
export const NavigatorDevThreeSpacesSelected = StoryTemplate.bind({});

export const NavigatorDevThreeSpacesIsolatedColoured = StoryTemplate.bind({});
export const NavigatorDevTwoOfThreeSpacesSelectedColoured = StoryTemplate.bind({});


export const NavigatorDevOneAssetSelected = StoryTemplate.bind({});
export const NavigatorDevThreeAssetsSelected = StoryTemplate.bind({});
export const NavigatorDevOneOfThreeAssetsSelected = StoryTemplate.bind({});
export const NavigatorDevOneOfThreeAssetsSelectedColoured = StoryTemplate.bind({});

export const NavigatorDev2OneOfThreeAssetsSelected = StoryTemplate.bind({});
export const NavigatorDev2OneOfThreeAssetsSelectedColoured = StoryTemplate.bind({});





Assets.args = {
  userConfigOverwrite: {},
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};
AssetsMocked.args = {
  currentPath: "/assets",
  userConfigOverwrite: {
    handlers: {
      assets: {
        path: "/assets",
        pageComponent: "mock/EmptyComponent"
      }
    }
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};
Navigator.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/NavigatorView"
      }
    }
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevOneSpaceIsolated.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079"],
    //selectedModelIds: ["63c7acfda812c71c3f54a079"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};

NavigatorDevOneSpaceSelected_Issue.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079"],
    selectedModelIds: ["63c7acfda812c71c3f54a079"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};



NavigatorDevOneSpacesSelectedColoured_Issue.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078"],
    selectedModelIds: ["63c7acfda812c71c3f54a078"],
    redSpaceIds:["63c7acfda812c71c3f54a079"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevThreeSpacesIsolated.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078","63c7acfda812c71c3f54a077"],
    //selectedModelIds: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078"],
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevThreeSpacesSelected.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078","63c7acfda812c71c3f54a077"],
    selectedModelIds: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078","63c7acfda812c71c3f54a077"],
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};



NavigatorDevThreeSpacesIsolatedColoured.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078",'63c7acfda812c71c3f54a077'],
    //selectedModelIds: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078"],
    redSpaceIds:["63c7acfda812c71c3f54a079"],
    blueSpaceIds:["63c7acfda812c71c3f54a078"],
    greenSpaceIds: ["63c7acfda812c71c3f54a077"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevTwoOfThreeSpacesSelectedColoured.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    spaceIdsArray: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078",'63c7acfda812c71c3f54a077'],
    selectedModelIds: ["63c7acfda812c71c3f54a079","63c7acfda812c71c3f54a078"],
    redSpaceIds:["63c7acfda812c71c3f54a079"],
    blueSpaceIds:["63c7acfda812c71c3f54a078"],
    greenSpaceIds: ["63c7acfda812c71c3f54a077"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevOneAssetSelected.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    assetIdsArray: ["63c77316e2a9f070a0c52871"],
    selectedModelIds: ["63c77316e2a9f070a0c52871"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};

NavigatorDevOneOfThreeAssetsSelected.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    assetIdsArray: ["63c77316e2a9f070a0c52874","63c77316e2a9f070a0c52875","63c77316e2a9f070a0c52871"],
    selectedModelIds: ["63c77316e2a9f070a0c52871"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevOneOfThreeAssetsSelectedColoured.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    assetIdsArray: ["63c77316e2a9f070a0c52874","63c77316e2a9f070a0c52875","63c77316e2a9f070a0c52871"],
    selectedModelIds: ["63c77316e2a9f070a0c52871"],
    redAssetIds:["63c77316e2a9f070a0c52874"],
    blueAssetIds:["63c77316e2a9f070a0c52875"],
    greenAssetIds: ["63c77316e2a9f070a0c52871"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};


NavigatorDevThreeAssetsSelected.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorView"
      }
    },
    assetIdsArray: ["63c77316e2a9f070a0c52874","63c77316e2a9f070a0c52875","63c77316e2a9f070a0c52871"],
    selectedModelIds: ["63c77316e2a9f070a0c52874","63c77316e2a9f070a0c52875","63c77316e2a9f070a0c52871"],
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};



NavigatorDev2OneOfThreeAssetsSelected.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorViewIsolatedHighlighted"
      }
    },
    assetIdsArray: ["63c77316e2a9f070a0c52874","63c77316e2a9f070a0c52875","63c77316e2a9f070a0c52871"],
    selectedModelIds: ["63c77316e2a9f070a0c52874"],
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};

NavigatorDev2OneOfThreeAssetsSelectedColoured.args = {
  currentPath: "/navigator",
  userConfigOverwrite: {
    handlers: {
      navigator: {
        path: "/navigator",
        pageComponent: "navigators/DevsNavigatorViewIsolatedHighlighted"
      }
    },
    assetIdsArray: ["63c77316e2a9f070a0c52874","63c77316e2a9f070a0c52875","63c77316e2a9f070a0c52871"],
    selectedModelIds: ["63c77316e2a9f070a0c52874"],
    redAssetIds:["63c77316e2a9f070a0c52874"],
    blueAssetIds:["63c77316e2a9f070a0c52875"],
    greenAssetIds: ["63c77316e2a9f070a0c52871"]
  },
  ipaConfigOverwrite : ipaConfigStoryOverwrite
};

