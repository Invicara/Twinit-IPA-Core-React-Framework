import { render } from 'react-dom';
import React from 'react';
import _ from 'lodash'
//import './index.css'
import "../client/styles/app.scss";
import {IafProj, IafSession} from '@invicara/platform-api';
import { Provider } from 'react-keep-alive';
import {IpaMainLayout} from '@invicara/ipa-core/modules/IpaLayouts';
import ipaConfig from '../ipaCore/ipaConfig'

const onConfigLoad = async (store, userConfig, AppContext) => {
  console.log('onConfigLoad ->', AppContext, store, userConfig)
  
  IafSession.setConfig(endPointConfig)

  // const isValidModel = (model) => {

  //   let result = true;
  //   result = !!Object.entries(model).length;

  //   if (result)
  //     result = !!model._versions && !!model._versions.length;

  //   if (result)
  //     result = !!model._id && !!model._name && !!model._tipId;

  //   return result;

  // }
  
  // let selectedModel = {};
  // let selectedProj = IafProj.getCurrent();
  //  //load the model
  // let models = null;
  // models = await IafProj.getModels(selectedProj).catch((error) => {
  //   console.log(error),
  //   models = null
  // });
  // if (models) {
  //   let lastUploadedModel = _.sortBy(models, m => m._metadata._updatedAt);
  //   selectedModel = _.last(lastUploadedModel);

  //   //only reload the model if there is no loaded model already or
  //   //if the model which would be loaded is different than the model already loaded
  //   if (isValidModel(selectedModel)) {
  //     if (!AppContext.selectedItems || !AppContext.selectedItems.selectedModel || selectedModel._id !== AppContext.selectedItems.selectedModel._id) {
  //       console.log('re/loading model');
  //       AppContext.actions.setSelectedItems({selectedModel: selectedModel});
  //     }
  //   }
  //   else {
  //       AppContext.actions.setSelectedItems({selectedModel: null});
  //   }
  // }else{
  //     AppContext.actions.setSelectedItems({selectedModel: null});
  // }
  
}

render(<Provider>
      <IpaMainLayout
          ipaConfig={ipaConfig}
          onConfigLoad={onConfigLoad}
      />
    </Provider>,
    document.getElementById('app')
);

if (module.hot) {
  module.hot.accept();
}
