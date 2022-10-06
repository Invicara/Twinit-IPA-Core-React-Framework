/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2020] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React from 'react';
import { Provider } from 'react-redux'
import * as PropTypes from 'prop-types';
import _ from "lodash";

import SampleConfig from '../stories/IpaPageComponents/sample_user_config.json';

import {addUserConfig} from "../redux/slices/user-config";
import {addUser} from "../redux/slices/user";

import store, { addReducerSlice } from '../redux/store'
import { addDashboardComponents } from '../redux/slices/dashboardUI'
import { addEntityComponents } from '../redux/slices/entityUI'
import {AppContext, withAppContext} from "../appContext";
import sampleSelectedItems from "../stories/IpaPageComponents/sample_selectedItems.json";
import AppProvider, {addScriptFunction} from "../AppProvider";
import {MemoryRouter} from "react-router-dom";
import {createMemoryHistory} from "history";
import sampleUserConfig from "../stories/IpaPageComponents/sample_user_config.json";
import {createLegacyContextSupport} from "../stories/util/legacyContext";


class MockAppProvider extends AppProvider {
  constructor(props) {
    super(props);

    console.log('MockAppProvider state', this.state);
    this.state.actions.reloadConfig = this.initialize.bind(this, false);
    this.state.actions.restartApp = this.initialize.bind(this);


    console.log('MockAppProvider state', this.state);
  }

  getPageArray = () => {
    console.log("GET PAGE ARRAY");
    let currentPath = "/";
    if(this.props.history.entries.length) {
      currentPath = this.props.history.entries[this.props.history.entries.length - 1].pathname
    }
    let path = 'http://localhost:8083/digitaltwin/#' + currentPath;
    return path.split('?')[0].split('/');
  }

  handleRequestError(error) {
    console.error(error)
  }

  handlePageHandlerLoadError(error) {
    console.error(error);
  }

  async initialize(loadConfigFromCache = true, showProjectPicker = true) {

    /* load script plugins */

    /*
      We load all the exported functions from each file listed in ipaConfig.scriptPlugins.

      Each script plugin file must be located in ./app/ipaCore/scriptPlugins
    */
    let scriptPlugins = this.props?.ipaConfig?.scriptPlugins
    if (scriptPlugins) {
      scriptPlugins.forEach((filename) => {
        try {
          let funcs = require('../../../../../app/ipaCore/scriptPlugins/' + filename)
          for (let fnName in funcs) {
            addScriptFunction(funcs[fnName])
          }
        } catch(e) {
          console.error(e)
          console.error('Script plugin not able to be loaded: ' + filename)
        }
      })
    }

    /* load redux extended slices provided by the app */

    /*
     * Here we load the redux reducers (slices) provided by the local application
     * This is an additive, but replace, function. Meaning if the local application
     * adds a reducer with the same name as a framework reducer it will override the
     * framework reducer.
     *
     * We may want to protect against that?
     *
     * Reducer (slice) files must be located in ./app/ipaCore/redux
     */
    if (this.props.ipaConfig && this.props.ipaConfig.redux && this.props.ipaConfig.redux.slices && this.props.ipaConfig.redux.slices.length) {
      this.props.ipaConfig.redux.slices.forEach((sliceFile) => {
        try {
          let slice = require('../../../../../app/ipaCore/redux/' + sliceFile.file).default
          let newReducer = addReducerSlice({name: sliceFile.name, slice: slice})
          store.replaceReducer(newReducer)
        } catch(e) {
          console.error(e)
          console.error('Slice not able to be loaded: ' + sliceFile.name)
        }
      })
    } else {
      console.warn("No ipa-core redux configuration found")
    }

    /* load redux extended dashboard components */

    /*
     * Here we load the dashboard components provided by the local application into redux
     * These components if named the same as a framework component can override the
     * framework dashborad component.
     *
     * Dashboard compnent files must be located in ./app/ipaCore/components
     */

    if (this.props.ipaConfig && this.props.ipaConfig.components) {
      if (this.props.ipaConfig.components.dashboard && this.props.ipaConfig.components.dashboard.length) {
        let dashComponents = []
        this.props.ipaConfig.components.dashboard.forEach((dashCompFile) => {
          try {
            let dashComp = require('../../../../../app/ipaCore/components/' + dashCompFile.file).default
            dashComponents.push({name: dashCompFile.name, component: dashComp})
          } catch(e) {
            console.error(e)
            console.error('Dashboard component not able to be loaded: ' + dashCompFile.name)
          }
        })
        if (dashComponents.length) store.dispatch(addDashboardComponents(dashComponents))
      }

      /* load redux extended dashboard components */

      /*
      * Here we load the entity components provided by the local application into redux
      * These components if named the same as a framework component can override the
      * framework component.
      *
      * entity compnent files must be located in ./app/ipaCore/components
      */
      if (this.props.ipaConfig.components.entityAction && this.props.ipaConfig.components.entityAction.length) {
        let entityActionComponents = []
        this.props.ipaConfig.components.entityAction.forEach((actionCompFile) => {
          try {
            let actComp = require('../../../../../app/ipaCore/components/'+ actionCompFile.file)[actionCompFile.name+'Factory']
            entityActionComponents.push({name: actionCompFile.name, component: actComp})
          } catch(e) {
            console.error(e)
            console.error('Entity Action component not able to be loaded: ' + actionCompFile.name)
          }
        })
        if (entityActionComponents.length) store.dispatch(addEntityComponents('action',entityActionComponents))
      }

      if (this.props.ipaConfig.components.entityData && this.props.ipaConfig.components.entityData.length) {
        let entityDataComponents = []
        this.props.ipaConfig.components.entityData.forEach((dataCompFile) => {
          try {
            let dataComp = require('../../../../../app/ipaCore/components/'+ dataCompFile.file)
            let dataCompFactory = dataComp[dataCompFile.name+'Factory']
            entityDataComponents.push({name: dataCompFile.name, component: dataCompFactory})
          } catch(e) {
            console.error(e)
            console.error('Entity Action component not able to be loaded: ' + dataCompFile.name)
          }
        })
        if (entityDataComponents.length) store.dispatch(addEntityComponents('data',entityDataComponents))
      }
    } else {
      console.warn("No ipa-core component configuration found")
    }


    if (this.props.ipaConfig && Array.isArray(_.get(this.props.ipaConfig, 'css'))) {
      this.props.ipaConfig.css.forEach((styleSheet) => {
        try {
          let customCss = require('../../../../../app/ipaCore/css/'+ styleSheet)
        } catch(e) {}
      })
    }


    //config loader
    const config = this.props.initialConfig || SampleConfig;
    console.log("MockAppProvider initialized config, ",config);
    this.onConfigLoad(config, this.testConfig(config), 'token', {})

  }

  async onConfigLoad(config, routes, token, user) {
    console.log("MockAppProvider on config load, ",config);
    store.dispatch(addUserConfig(config))
    store.dispatch(addUser(user))

    //need to enable the router after we load all the scripts in the config
    //to make sure all pages have data loaded into the script engine beforehand
    routes = await routes;
    if (routes) {
      this.setState({
        router: {pageList: routes.pageList, pageRoutes: routes.pageRoutes, pageGroups: routes.pageGroups},
      });
    }
    console.log("MockAppProvider routes", routes);

    this.setState({isLoading: false});

    this.setSelectedItems({selectedProject: sampleSelectedItems.selectedProject, selectedUserGroupId: sampleSelectedItems.selectedUserGroupId});

    if (this.props.onConfigLoad) this.props.onConfigLoad(store, config, this.state)

  }

  render() {
    return <AppContext.Provider value={this.state}>{this.props.children}</AppContext.Provider>
  }
}

MockAppProvider.contextTypes = {
  ifefSnapper: PropTypes.object,
  ifefShowModal: PropTypes.func
};

export default MockAppProvider;

export const decorateWithMockAppProvider = (Component, userConfig = {}, currentPath = "/assets") => {
  //console.log("withMockAppProvider props",props)
  const history = createMemoryHistory({
    initialEntries: [currentPath], // The initial URLs in the history stack
    initialIndex: 0, // The starting index in the history stack
    //keyLength: 6, // The length of location.key
    // A function to use to confirm navigation with the user. Required
    // if you return string prompts from transition hooks (see below)
    getUserConfirmation: null
  });
  const LegacyContextProvider = createLegacyContextSupport({ ifefPlatform: PropTypes.object, ifefUpdatePopover: PropTypes.func })
  const context = {ifefPlatform:{},ifefUpdatePopover:_.noop};

  return <Provider store={store}><MockAppProvider
    initialConfig={userConfig}
    location={history.location} history={history}
    ipaConfig={{}}
    onConfigLoad={_.noop}>
      <MemoryRouter initialEntries={[currentPath]}>
        <LegacyContextProvider context={context}>
          <Component/>
        </LegacyContextProvider>
      </MemoryRouter>
  </MockAppProvider></Provider>
};
