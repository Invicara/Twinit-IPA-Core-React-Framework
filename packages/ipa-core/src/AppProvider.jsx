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
import * as PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
import _ from "lodash";

import {IafSession, IafProj, IafDataSource, IafScriptEngine} from '@invicara/platform-api';
import { expression } from '@invicara/expressions'

import EmptyConfig, {actualPage} from './emptyConfig';

import ProjectPickerModal from "./IpaDialogs/ProjectPickerModal";
import ScriptHelper from './IpaUtils/ScriptHelper'

import {parseQuery} from "./IpaUtils/helpers";

import {addUserConfig} from "./redux/slices/user-config";
import {addUser} from "./redux/slices/user";

import ScriptCache from './IpaUtils/script-cache'
import store, { addReducerSlice } from './redux/store'
import { addDashboardComponents } from './redux/slices/dashboardUI'
import { addEntityComponents } from './redux/slices/entityUI'

import withGenericPage from './IpaPageComponents/GenericPage'
import InternalPages from './IpaPageComponents/InternalPages'

export const AppContext = React.createContext();


// props -- component props passed by parent
// contextProps -- Provider props
export const withAppContext = (Component) => (props) => (<AppContext.Consumer>
  {(contextProps) => <Component {...props} {...contextProps}/>}
</AppContext.Consumer>);

class AppProvider extends React.Component {
  constructor(props) {
    super(props);

    IafSession.setConfig(endPointConfig);

    this.authUrl = IafSession.getAuthUrl(endPointConfig ? endPointConfig.baseRoot : this.props.ipaConfig.endPointConfig.baseRoot);
    this.isSigningOut = false;
    this.defaultBottomPanelHeight = 350;
    this.state = {
      userConfig: EmptyConfig,
      user: undefined,
      token: undefined,
      isAuthorized: false,
      isLoading: true,
      loadingText: 'Loading..',
      showBottomPanel: false,
      viewerResizeCanvas: false,
      bottomPanelHeight: this.defaultBottomPanelHeight,
      defaultBottomPanelHeight: this.defaultBottomPanelHeight,
      maxBottomPanelHeight: window.innerHeight - 80,
      router: {
        pageList: [],
        pageRoutes: [],
        pageGroups: []
      },
      selectedItems: localStorage.ipadt_selectedItems
        ? JSON.parse(localStorage.ipadt_selectedItems)
        : {},
      actions: {
        reloadConfig: this.initialize.bind(this, false),
        restartApp: this.initialize.bind(this),
        setSelectedItems: this.setSelectedItems.bind(this),
        userLogout: this.userLogout.bind(this),
        closeBottomPanel: this.closeBottomPanel.bind(this),
        showBottomPanel: this.showBottomPanel.bind(this),
        toggleBottomPanel: this.toggleBottomPanel.bind(this),
        openBottomPanelMax: this.openBottomPanelMax.bind(this),
        getCurrentHandler: this.getCurrentHandler.bind(this),
        showModal: this.showIpaModal.bind(this)
      }
    };

    this.handleRequestError = this.handleRequestError.bind(this);
    this.testConfig = this.testConfig.bind(this);
    this.onConfigLoad = this.onConfigLoad.bind(this);
    this.sisenseLogout = this.sisenseLogout.bind(this);
  }

  componentDidMount() {
    IafSession.setErrorCallback(this.handleRequestError);
    this.state.actions.restartApp();
  }

  async sisenseLogout() {
    let sisUrl = sessionStorage.getItem('sisenseBaseUrl')

    if (sisUrl) {
      let sisenselogout_url = sisUrl + "/api/auth/logout"
      fetch(sisenselogout_url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'manual',
        credentials: 'include'
      }).catch((err) => {
        console.error("ERROR LOGGING OUT OF SISENSE: " + sisenselogout_url)
        console.error(err)
      })
      delete sessionStorage.sisenseBaseUrl
    }
  }

  async userLogout() {
    try {
      await IafSession.logout();
    } catch (e) {}

    this.sisenseLogout()

    // delete cached config
    delete sessionStorage.ipadt_configData;
    delete localStorage.ipadt_selectedItems;
    window.location = this.authUrl;
  }

  closeBottomPanel() {

    let modelPopupContainerStyle = document.querySelector('div.asf-modal.threeDModelPopup').style;
    let opacityValue = 1;
    let intervalObj = setInterval(() => {
      if (opacityValue != 0) {
        opacityValue = (opacityValue - 0.1).toFixed(2);
        modelPopupContainerStyle.opacity = opacityValue;
      } else {
        clearInterval(intervalObj);
      }
    }, 50);
    setTimeout(() => {
      this.setState({show3DModelPopUp: false});
      modelPopupContainerStyle.opacity = 1;
    }, 600);

  }

  showBottomPanel() {
    this.context.ifefSnapper.open('bottom');
    document.getElementById('BottomPanel').style.display = 'block';
  }

  openBottomPanelMax() {
    this.context.ifefSnapper.open('bottom');
    let viewer = document.getElementById('BottomPanel');
    viewer.style.display = 'block';
    viewer.style.height = window.innerHeight - 80;
    this.setState({viewerResizeCanvas: true})

    let toolbar = document.getElementsByClassName('model-viewer-toolbar');
    toolbar[0].style.display = 'none';
  }

  toggleBottomPanel() {
    // the following should probably be in ifefSnaper.toggle?
    let body = document.querySelector('body')
    let wasOpen = body.classList.contains('snapjs-bottom')
    // end

    document.getElementById('BottomPanel').style.display = wasOpen
      ? 'none'
      : 'block';
    document.getElementById('BottomPanel').style.height = this.defaultBottomPanelHeight;

    this.context.ifefSnapper.toggle('bottom');

    // the following should probably be in ifefSnaper.toggle?
    if (wasOpen) {
      body.classList.remove('snapjs-bottom');
      this.setState({viewerResizeCanvas: false})
    }

    // end

    //make sure we always shwo the toolbar in case open3DModelPopupMax above hide it
    let toolbar = document.getElementsByClassName('model-viewer-toolbar');
    toolbar[0].style.display = 'block';
  }

  setSelectedItems(newItems) {
    const {selectedItems} = this.state;
    //save items to session
    let newSelecteds = Object.assign(selectedItems, newItems);
    localStorage.ipadt_selectedItems = JSON.stringify(newSelecteds);
    this.setState({selectedItems: newSelecteds});
  }

  getCurrentHandler() {
    let config = this.state.userConfig;
    const getPageArray = () => window.location.href.split('?')[0].split('/')
    let pageArray = getPageArray();
    let page = pageArray.pop();
    if (page === "")
      page = pageArray.pop();
    let handler = null;
    let pageNames = config.pages ? Object.keys(config.pages) : Object.keys(config.groupedPages);
    let pagesConfig = config.pages || config.groupedPages;
    let pagesHavePositions = pagesConfig[pageNames[0]].position;

    if (page.endsWith('#') && config.homepage && config.homepage.handler) {
      return config.handlers[config.homepage.handler];
    }
    else if (page.endsWith('#')){
      if (!pagesHavePositions)
          return config.handlers[actualPage(config, pageNames[0]).handler];
      else {
        let lowestPos = pagesConfig[pageNames[0]].position;
        let lowestHandler = actualPage(config, pageNames[0]).handler;
        pageNames.forEach((pn) => {
          if (pagesConfig[pn].position < lowestPos) {
            lowestPos = pagesConfig[pn].position;
            lowestHandler = actualPage(config, pn).handler;
          }
        })
        return config.handlers[lowestHandler];
      }

    }

    /*
     * Removed this code because I wasn't sure why try to go through the pages first to get the handler
     * instead of just goign straight to the handlers like we do below. Plus I think this commented code
     * relies on the name of the handler matchign the path of the handler, which is nto always guaranteed
     * to be true - scott mollon 12/4/2020
     */
    //look for handler in page list
    // const pageGroup = config.groupedPages ? Object.entries(config.groupedPages).find(p => p[1].pages.some(e => e[page] !== undefined)) : undefined;
    // if (config.pages && config.pages[page] || pageGroup){
    //   handler = config.pages ? config.handlers[config.pages[page].handler] : config.handlers[pageGroup.pages[page].handler] ;
    // }


    //if the handler is not found in the page list
    //look for it in the list of handlers
    //this might be necessary for pages that appear in action handlers
    //but not the page list
    if (!handler) {
      const lastButOnePathElement = getPageArray()[getPageArray().length - 2]; //For detail components where the last element is the pathParam
      const allHandlers = Object.values(config.handlers);
      return allHandlers.find( h => h.path === `/${page}` || h.path === `/${lastButOnePathElement}`);
    }

    return handler;
  };

  handleRequestError(error) {
    console.error(error)
    if (_.get(error,'errorResult.status') === 401) {
      if (!this.isSigningOut) {
        this.isSigningOut = true;
        this.state.actions.userLogout();
      }
    }
  }

  async initialize(loadConfigFromCache = true, showProjectPicker = true) {
    const self = this;
    const sessionManage = sessionStorage.manage;
    let token, user;

    store.dispatch({type: "PROJECT_SWITCHED"})
    console.log(store.getState())

    //check for invites. If so - redirect to signup
    if (window.location.search) {
      const parsed = parseQuery(window.location.search);
      if (parsed.hasOwnProperty('inviteId')) {
        window.location = this.authUrl + '&inviteId=' + parsed.inviteId;
        return;
      }
    }

    // if we've been passed a token then check it's valid
    if (window.location.hash) {
      const temp_token = IafSession.extractToken(window.location.hash);
      if (temp_token) {
        user = await IafSession.setSessionData(temp_token);
        if (user !== undefined) {
          token = temp_token;
        }
      }
    }

    // if we don't have a token yet and we have something in the session then
    // check that the token in the session is valid
    if (token === undefined && sessionManage !== undefined) {
      const temp_token = JSON.parse(sessionManage).token;
      user = await IafSession.setSessionData(temp_token);
      if (user !== undefined) {
        token = temp_token;
      }
    }

    // if we don't have a valid token at this point redirect to login page
    if (!token) {
      //go to login page
      window.location = this.authUrl;
    } else {

      if (this.props.ipaConfig) self.setSelectedItems({ipaConfig: this.props.ipaConfig})

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

      //config loader
      if (loadConfigFromCache && sessionStorage.ipadt_configData) {
        const jsonData = JSON.parse(sessionStorage.ipadt_configData);
        this.onConfigLoad(jsonData, this.testConfig(jsonData), token, user)
      } else {
        const callback = (config, routes) => this.onConfigLoad(config, routes, token, user);
        try {
          let projects = await IafProj.getProjects({_pageSize: 1000});
          if (showProjectPicker)
            self.context.ifefShowModal(
              <ProjectPickerModal configUserType={this.props.ipaConfig.configUserType} appContextProps={this.state} defaultConfig={EmptyConfig} onAcceptInvite={this.state.actions.restartApp}
                projects={projects} testConfig={self.testConfig} onConfigLoad={callback} onCancel={() => self.context.ifefShowModal(false)}/>);
        } catch (error) {
          console.log(error);
          callback(EmptyConfig, self.testConfig(EmptyConfig));
        }
      }

      if (this.props.ipaConfig && Array.isArray(_.get(this.props.ipaConfig, 'css'))) {
        this.props.ipaConfig.css.forEach((styleSheet) => {
          try {
            let customCss = require('../../../../../app/ipaCore/css/'+ styleSheet)
          } catch(e) {}
        })
      }
    }
  }

  async testConfig(config) {
    return await calculateRoutes(config, this.state, this.props.ipaConfig);
  }

  showIpaModal(modalContent) {
    const self = this
    self.context.ifefShowModal(modalContent)
  }

  async onConfigLoad(config, routes, token, user) {
    
    function hasSisenseConnectors(config) {
      if (config.connectors) {
  
        let sisenseConnector = _.find(config.connectors, {name: "SisenseIframe"}) || _.find(config.connectors, {name: "SisenseConnect"})
        if (sisenseConnector) {
  
          let sisUrl = sisenseConnector.config.url
          let lastChar = sisUrl.slice(-1)
          if (lastChar === '/' || lastChar === '\\')
            sisUrl = sisUrl.slice(0, -1)
  
          sessionStorage.setItem('sisenseBaseUrl', sisUrl)
          return sisUrl
        }
        else return false
  
      } else return false
    }
    
    console.log(config, routes)
    routes = await routes

    //clear routes immediately so that the UI rmeoves the last project's routes
    this.setState({
      token,
      user,
      router: {
        pageList: [],
        pageRoutes: [],
        pageGroups: [],
      },
      userConfig: config
    });

    this.sisenseLogout()

    //Clear all script state in cache and in script engine
    ScriptCache.clearCache();
    if(!ScriptHelper.isProjectNextGenJs()) {
      ScriptHelper.releaseExpressionExecCtx()
      ScriptHelper.initExpressionExecCtx()
    } else {
      IafScriptEngine.clearVars()
    }
    this.context.ifefShowModal(false);

    let selectedProj = IafProj.getCurrent();
    if (selectedProj) {

      /*
      * If Sisense Connectors are configured then we need to sign in to Sisense
      * This must be doen before any sisense content is needed
      */
      let sisenseUrl = hasSisenseConnectors(config)
      if (sisenseUrl) {
        const allOrchestrators = await IafDataSource.getOrchestrators();
        const sisenseSSOOrch = _.find(allOrchestrators._list, {_userType: 'Sisense_SSO_JWT_Generator'});

        if (!sisenseSSOOrch) {
          console.error('Sisense is configured in the project but the Sisense SSO Orchestrator is not present')
        } else {
          const orchId = sisenseSSOOrch.id;

          const params = {
              orchestratorId: orchId,
              _actualparams: [
                  {
                      sequence_type_id: _.get(sisenseSSOOrch, "orchsteps.0._compid"),
                      params: {
                          userGroupId: this.state.selectedItems.selectedUserGroupId,
                          projectNamespace: this.state.selectedItems.selectedProject._namespaces[0]
                      }
                  }
              ]
          }

          const orchResult = await IafDataSource.runOrchestrator(orchId, params);
          const encodedToken = _.get(orchResult, '_result.jwt');

          let sisensejwt_url = sisenseUrl + "/jwt?jwt=" + encodedToken;

          fetch(sisensejwt_url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'manual',
            credentials: 'include'
          }).catch((err) => {
            console.error("ERROR SIGNING IN TO SISENSE: " + sisensejwt_url)
            console.error(err)
          })
        }
      }

      //load all config level scripts
      if (!!config.onConfigLoad && !!config.onConfigLoad.load && config.onConfigLoad.load.length > 0) {

        //load each script
        let loadThese = config.onConfigLoad.load;
        for (let i = 0; i < loadThese.length; i++) {

          await ScriptHelper.loadScript({_userType: loadThese[i]});
        }
      }

      //execute all config level scripts
      if (!!config.onConfigLoad && !!config.onConfigLoad.exec && config.onConfigLoad.exec.length > 0) {

        //load each script
        let execThese = config.onConfigLoad.exec;
        for (let i = 0; i < execThese.length; i++) {

          await ScriptHelper.executeScript(execThese[i]);
        }
      }

      //need to enable the router after we load all the scripts in the config
      //to make sure all pages have data loaded into the script engine beforehand
      if (routes)
        this.setState({
          router: {pageList: routes.pageList, pageRoutes: routes.pageRoutes, pageGroups: routes.pageGroups},
        });

      this.setState({isLoading: false});

    // Eval the "autoeval" script for any bootstrap setup of app.
    if (config.scripts && config.scripts.autoeval) {
      if(!ScriptHelper.isProjectNextGenJs()) ScriptHelper.evalExpressions(config.scripts.autoeval);
    }
  } else {
      //This is state where the user has an account but no accepted invites
      if (routes)
        this.setState({
          router: {pageList: routes.pageList, pageRoutes: routes.pageRoutes, pageGroups: routes.pageGroups},
        });
      this.setState({
        isLoading: false
      });
  }

  store.dispatch(addUserConfig(config))
  store.dispatch(addUser(user))

  if (this.props.onConfigLoad) this.props.onConfigLoad(store, config, this.state)

  }

  navigateToHomepage() {
    window.location.hash = '/'; //Since we're outside the react router scope, we need to deal with the location object directly
  }

  

  render() {
    return <AppContext.Provider value={this.state}>{this.props.children}</AppContext.Provider>
  }
}

const addScriptFunction = (fn) => {
  let fnName = "$" + fn.name
  let fnWrapper = {}
  fnWrapper[fnName] = {
    operate: (a,b,c) => fn(expression.operate(a,b,c))
  }
  console.log(`Added Script Operator: ${fnName} => ${fn.name}`)
  expression.use(fnWrapper)
}

async function calculateRoutes(config, appContextProps, ipaConfig) {
  const pList = [];
  const pRoutes = [];
  const pGroups = [];

  /*
   * Loads a pageComponent for the app. It will first try to load the pageComponent
   * from the local application. If the pageComponent is not found there it will
   * try to load the pageComponent from the framework. This allows the local
   * application to override a framework page component if it so chooses.
   *
   * If the pageComponent is not found an error is sent to the console and
   * the page is skipped.
   *
   * pageComponents must be in the ./app/ipaCore/pageComponents folder
   */
  function asIpaPage(rawPageComponent) {
    return withAppContext(withGenericPage(rawPageComponent))
  }

  function getPageComponent(pageComponent) {

    let component
    try {
      component = require('../../../../../app/ipaCore/pageComponents/' + pageComponent + '.jsx').default;
      component = asIpaPage(component)
      console.log(pageComponent + ' loaded from application')
    } catch(e) {

      component = InternalPages[pageComponent] ? InternalPages[pageComponent] : null

      if (component) {
        component = asIpaPage(component)
        console.log(pageComponent + ' loaded from framework')
      }
      else {
        console.error(e)
        console.error("can't find page component: ", pageComponent)
        console.log("Skipping", pageComponent)
        component = null
      }
    }

    return component

  }

  function addRoute(handlerName, handler, addPage, pathPrefix, pageGroup) {
    if (!handler.pageComponent) {
      console.error("This version of AppProvider only supports handlers with a pageComponent")
      console.log("Skipping", handler)
      return
    }

    let component = getPageComponent(handler.pageComponent);
    if (!component) return

    let item = {
      path: pathPrefix ? pathPrefix + handler.path : (handler.path || '/' + handlerName),
      title: handler.title || 'no title',
      icon: (handler.icon || ''),
      name: handlerName,
      exact: true,
    };

    pRoutes.push(<Route path={item.path} key={item.path} component={component} exact={item.exact}/>);
    if(handler.detailPage){
      const component = getPageComponent(handler.detailPage.component);
      pRoutes.push(<Route path={`${handler.path}/${handler.detailPage.pathParam}`} key={handler.detailPage.pathParam} component={component} exact={item.exact}/>);
    }
    if (addPage) {
      pList.push(item);
      if(pageGroup){
        pGroups.find(g => g.groupName == pageGroup).items.push(item);
      }
    }
  }

  function addGroup(groupName, icon){
    let group = {
      groupName: groupName,
      icon: icon || '',
      items: []
    }
    pGroups.push(group);
  }

  let pages = config.pages ? Object.keys(config.pages) : Object.keys(config.groupedPages);
  const pagesConfig = config.pages || config.groupedPages;
  const usingGroupedConfig = !!config.groupedPages;
  if (pages.length == 0) {
    console.error("No pages to display = no routes to add")
    return
  }

  // Sort the pages as specified in config, or alphabetically
  if (pagesConfig[pages[0]].position) {
    pages.sort((a, b) => pagesConfig[a].position > pagesConfig[b].position ? 1 : -1)
  }
  else {
    pages.sort();
  }

  // Add the component for each page (dynamically requires the JSX)
  pages.forEach(key => {
    if(usingGroupedConfig){
      addGroup(key, pagesConfig[key].icon);
      pagesConfig[key].pages.forEach(page => {
        if (page.handler) {
          let handler = config.handlers[page.handler];
          addRoute(page.handler, handler, true, undefined, key);
        }
      })
    }else{
      let page = config.pages[key];
      if (page.handler) {
        let handler = config.handlers[page.handler];

        addRoute(page.handler, handler, true);
      }
    }
  });

  appContextProps.userConfig = config;

  // Add homepage
  let homePageHandler
  if (config.homepage) {
    homePageHandler = config.handlers[config.homepage.handler]
  }
  else {
    console.warn("no homepage specified, defaulting to first page")
    homePageHandler = config.handlers[actualPage(config, pages[0]).handler];
  }
  let HomePage = getPageComponent(homePageHandler.pageComponent);
  if (!HomePage) console.error("can't find page component, no homepage", homePageHandler.pageComponent)
  else {
    pRoutes.unshift(<Route path='/' key='/' exact={true} component={HomePage} />);
    pRoutes.push(<Redirect to={'/'} key={'redirect_to_root'}/>);
  }

  return {pageList: pList, pageRoutes: pRoutes, pageGroups: pGroups};
}

AppProvider.contextTypes = {
  ifefSnapper: PropTypes.object,
  ifefShowModal: PropTypes.func
};

export default AppProvider;
