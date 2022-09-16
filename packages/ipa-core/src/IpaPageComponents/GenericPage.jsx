/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
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
import qs from 'qs';
import _ from 'lodash'
import { Redirect } from 'react-router-dom'
import * as PropTypes from "prop-types";
import {PopoverMenuView} from "../IpaLayouts/PopoverMenuView";
import ScriptHelper from "../IpaUtils/ScriptHelper";
import produce from "immer";
import {connect} from "react-redux";
import {Box, Container, Toolbar} from '@material-ui/core';

import './GenericPage.scss'
import GenericMatButton from "../IpaControls/GenericMatButton";

import {GenericPageContext} from "./genericPageContext";
import {compose} from "@reduxjs/toolkit";

const URL_LENGTH_WARNING = 80000

const withGenericPage = (PageComponent, optionalProps = {}) => {

  class GenericPage extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
        project: null,
        userConfig: null,
        isLoading: true,
        isPageLoading: true,
        queryParams: this.parseQueryParams(props.location.search,this.isSelectionInfoValid)
      };

      this._loadPageData = this._loadPageData.bind(this);
      this.handleAction = this.handleAction.bind(this);
      this.onLoadComplete = this.onLoadComplete.bind(this);
      this.onNavigated = this.onNavigated.bind(this);


      //console.log("GENERIC PAGE constructor props.userConfig",{...props.userConfig});
    }

    async componentDidMount() {

      this.setState({project: this.props.selectedItems.selectedProject, userConfig: this.props.selectedItems.userConfig});
      await this._loadPageData();
      this.onNavigated();
    }

    componentDidUpdate(prevProps) {
      //if the search changes the component doesn't get re-mounted, but still we need to react to the change in navigation
      if(this.props.location.search !== prevProps.location.search){
        console.log("cdu onNavigated")
        this.onNavigated();
      }

      //patch: set project in case it has changed without this component being re-mounted
      if(this.state.project && (this.state.project._id !== this.props.selectedItems.selectedProject._id)){
        this.setState({project: this.props.selectedItems.selectedProject, userConfig: this.props.selectedItems.userConfig});
      }

      //if user switches project while on the page reload page
      if (!this.state.isPageLoading && !!this.state.project && (this.state.project._id !== this.props.selectedItems.selectedProject._id))
        this.props.history.push('/');

      //if user switches userCOnfig while on the page reload page
      if (!this.state.isPageLoading && !!this.state.userConfig && (this.state.userConfig._id !== this.props.userConfig._id))
        this.props.history.push('/');
    }

    async _loadPageData() {

      this.setState({isLoading: true, isPageLoading: true});

      let { handlers } = this.props.userConfig;
      //console.log("GENERIC PAGE PROPS",this.props);
      let handler = undefined;
      try {
          handler = await produce(this.props.actions.getCurrentHandler(), async handler => {

        //put selectBy info on handler if configured at the userConfig level and not the page level
        //and if selectBy config is not provided on the handler already, this allows to override selectBys at a page level
        if (handler.config && !handler.config.selectBy && handler.config.type && this.props.userConfig.entitySelectConfig) {
          if (!Array.isArray(handler.config.type) && this.props.userConfig.entitySelectConfig[handler.config.type.singular]) {

            //if the page is expecting only one selectBy config
            handler.config = {...handler.config, selectBy: this.props.userConfig.entitySelectConfig[handler.config.type.singular]}

          }
          else {
            //if the page is expecting multiple selectByConfigs filter to the ones it expects
            handler.config = {...handler.config,
              selectBy: _.fromPairs(
                  handler.config.type.filter(t => !!this.props.userConfig.entitySelectConfig[t.singular])
                      .map(t => [t.singular, this.props.userConfig.entitySelectConfig[t.singular]])
              )
            }

          }
        }

        const handlerHasConfig = !!handler?.config;
        const hasDefaultConfig = _.isObject(this.props.userConfig.entityDataConfig)
        const expectsMultipleDataConfig = Array.isArray(handler?.config?.type);

        if(hasDefaultConfig && handlerHasConfig) {
          if(expectsMultipleDataConfig) {

            handler.config = {...handler.config,
              data: _.fromPairs(
                  handler.config.type
                      .filter(t => !!this.props.userConfig.entityDataConfig[t.singular])
                      .map(t => {
                        const handlerData = handler?.config?.data?.[t.singular]
                        const defaultData = this.props.userConfig.entityDataConfig[t.singular];
                        let data = produce(defaultData || {}, function(data){
                          //merge handler config into default data, so treat as full override
                          _.merge(data, handlerData || {});
                        });
                        return [t.singular, data]
                      })
              )
            }
          } else {
            const entityType = handler.config.type;
            const handlerData = handler?.config?.data
            const defaultData = entityType && this.props.userConfig.entityDataConfig[entityType.singular]
            let data = produce(defaultData || {}, function(data){
              //merge handler config into default data, so treat as full override
              _.merge(data, handlerData || {});
            });
            handler.config = {...handler.config, data};
          }
        }

        let hasActions = !!handler.actionHandlers && !!handler.actionHandlers.length;

        if (hasActions) {
          let actions = [];

          handler.actionHandlers.forEach((action) => {
            actions.push({title: handlers[action].actionTitle, onClick: (e) => this.handleAction(action)});
          });

          this.context.ifefUpdatePopover(<PopoverMenuView actions={actions}/>);

        } else {
          this.context.ifefUpdatePopover(null);
        }

        //load script from userConfig
        let scriptTypes = handler.scriptTypes ? handler.scriptTypes : null;

        if (!!scriptTypes && scriptTypes.length > 0) {

          //load all script types on the handler
          for (let i = 0; i < scriptTypes.length; i++) {
            try {
              await ScriptHelper.loadScript({_userType: scriptTypes[i]});
            } catch (error) {
              if(this.props.handlePageHandlerLoadError){
                //if we have error handler, execute it (in case of mocking provider)
                this.props.handlePageHandlerLoadError(error);
              } else {
                //else throw error and break handler loading (note errors in lifecycle components will be swallowed)
                console.log(error);
                throw error;
              }
            }
          }
        }

        //load script from userConfig
        let runScripts = handler.onHandlerLoad ? handler.onHandlerLoad : null;
        if (!!runScripts && runScripts.length > 0) {

          //load all script types on the handler
          for (let i = 0; i < runScripts.length; i++) {
            try {
              await ScriptHelper.executeScript(runScripts[i]);
            } catch (error) {
              if(this.props.actions.handlePageHandlerLoadError){
                //if we have error handler, execute it (in case of mocking provider)
                this.props.actions.handlePageHandlerLoadError(error);
              } else {
                //else throw error and break handler loading (note errors in lifecycle components will be swallowed)
                console.error(error);
                throw error;
              }
            }
          }
        }
      })
      }
      catch (e){
        console.error("Error generating handler");
        console.error(e);
      }
      //console.log("HANDLER PREPARED",handler);
      this.setState({isLoading: false, handler});
    }

    handleAction(handler) {
      this.context.ifefShowPopover(false);
      const {match, history, userConfig} = this.props;

      history.push(`${match.path}${userConfig.handlers[handler].path}`);
    }

    onLoadComplete() {
      this.setState({isPageLoading: false});
    }

    onLoadComplete() {
      this.setState({isPageLoading: false});
    }

    isSelectionInfoValid(selectionInfo) {

      if (selectionInfo && !selectionInfo.entityType) {
        console.error('Attempting to pass query parameters with no entity type!');
        return false;
      }
      else return true;

    }

    setQueryParams = (partial) => this.setState({queryParams: {...this.state.queryParams, ...partial}})

    //provide pageComponents with a navigate function to place query criteria in the url to pass to other pages
    onNavigateOut = (userConfig, genericQueryParams, validator, history) => (destinationHandler, selectionInfo, options = {}) => {

      /*
       * handler: the name of a handler to navigate to
       *
       * selectionInfo:
       * {
       *    entityType: 'Asset',
       *    selectedEntities: [<array of entity ids>]
       * }
       *
       * Note: query, group and filter are handled by the GenericPage itself (this class).
       *       Call setQueryParams method from the child page.
       *       The queryParams can be overridden by providing queryParams in selectionInfo
       *
       */

      if (!destinationHandler || !Object.keys(userConfig.handlers).includes(destinationHandler)) {
        console.error('Attempting to navigate without a valid destination handler:', destinationHandler);
        return false;
      }

      if (!validator(selectionInfo)) {
        console.error('Attempting to navigate invalid query parameters!');
        return false;
      }

      let newPath
      if (!selectionInfo && !genericQueryParams.query) {
        newPath = this.props.userConfig.handlers[destinationHandler].path;
      }
      else {
        let query = Object.assign({}, genericQueryParams)

        //override the pages queryParams if the selectionInfo also provides queryParams
        if (selectionInfo.queryParams) {
          query = Object.assign(query, selectionInfo.queryParams)
        }

        if(selectionInfo) {
          query.entityType = selectionInfo.entityType
        }

        //if query has an array which represents the total entities to be fetched (not highlighted) turn it into a string
        //if its not an array leave as is as then it represents settings for a fetch control
        if (query.query && query.query.value && !query.query.id && query.query.id !== 0)
          query.query.value = Array.isArray(query.query.value) ? query.query.value.join(',') : query.query.value
        if (selectionInfo && selectionInfo.selectedEntities && selectionInfo.selectedEntities.length>0) {
          query.selectedEntities = selectionInfo.selectedEntities.join(',');
          query.entityType = selectionInfo.entityType
          query.script = selectionInfo.script
        } else if (query.selectedEntities && Array.isArray(query.selectedEntities) && query.selectedEntities.length > 0) {
          query.selectedEntities = query.selectedEntities.join(',');
        }
        if (query.groups && query.groups.length) {
          query.groups = query.groups.join(',')
        }
        newPath = userConfig.handlers[destinationHandler].path + '?' + qs.stringify(query);
      }

      // console.log('url sizes: ', urlSizeUtf8Chrome, urlSizeUtf16Chrome, urlLengthEdge);
      if (newPath.length > URL_LENGTH_WARNING)
        console.warn('url length is very large and navigation may not work!');

      if(options.newTab === true) {
        window.open(`${endPointConfig.baseRoot}/#${newPath}`, '_blank')?.focus()
      } else {
        history.push(newPath);
      }
    }

    parseQueryParams(path, validator) {

      let queryParams = {};

      if (path) {
        let rawParams = path.split('?')[1];
        // using decoder to parse boolean and int https://github.com/ljharb/qs/issues/91#issuecomment-437926409
        // qs will also limit specifying indices in an array to a maximum index of 20. Any array members with an
        // index of greater than 20 will instead be converted to an object with the index as the key.
        // This is needed to handle cases when someone sent, for example, a[999999999] and it will take significant time to iterate over this huge array.
        // This limit can be overridden by passing an arrayLimit option: We are going to use an arraylimit of 100 to cover almost every case,
        // if we are still finding more bugs on this parse, we will need to implement another solution for these arrays

        queryParams = qs.parse(rawParams, { arrayLimit: 100,
          decoder(str, decoder, charset) {
            const strWithoutPlus = str.replace(/\+/g, ' ');
            if (charset === 'iso-8859-1') {
              // unescape never throws, no try...catch needed:
              return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
            }

            if (/^(\d+|\d*\.\d+)$/.test(str)) {
              return parseFloat(str)
            }

            const keywords = {
              true: true,
              false: false,
              null: null,
              undefined,
            }
            if (str in keywords) {
              return keywords[str]
            }

            // utf-8
            try {
              return decodeURIComponent(strWithoutPlus);
            } catch (e) {
              return strWithoutPlus;
            }
          }
        })

        //if the query contains no id and a value which is a string, turn the value into an array
        //in this case its a list of ids to fetch
        if (queryParams.query && !queryParams.query.id && queryParams.query.id !== 0 && queryParams.query.value) {
          if (typeof(queryParams.query.value)=="string") {
            queryParams.query.value = queryParams.query.value.split(',');
          }
        }

        if (queryParams.selectedEntities) {
          if (typeof(queryParams.selectedEntities)=="string") {
            queryParams.selectedEntities = queryParams.selectedEntities.split(',');
          }
        }

        if (!validator(queryParams)) {
          console.error('Navigation occurred with invalid query parameters!');
          queryParams = {};
        }

        if (queryParams.groups)
          queryParams.groups = queryParams.groups.split(',');

        if (queryParams.query && queryParams.query.type && queryParams.query.value) {
          if (queryParams.query.type === "<<TEXT_SEARCH>>")
            queryParams.query.value = queryParams.query.value.toString()

          delete queryParams.query.type
        }
      }

      return queryParams;
    }

    onNavigated() {

      const queryParams = this.parseQueryParams(this.props.location.search,this.isSelectionInfoValid)
      if(!_.isEqual(queryParams, this.state.queryParams)) {
        this.setState({queryParams});
      } else {
        this.setState({queryParams: {}});
      }

    }

    toolbar = () => {
      return this.state.handler.toolbar && <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/*breadcrumbs to the left*/}
          <Box sx={{ flexGrow: 1 }}>
            {this.state.handler.toolbar.breadcrumbButtons && (this.state.handler.toolbar.breadcrumbButtons.map((b) => (
                <GenericMatButton {...b.props}>{b.text}</GenericMatButton>
            )))}
          </Box>
          {/*actions to the right to the left*/}
          <Box sx={{ flexGrow: 0 }}>
            {this.state.handler.toolbar.actionButtons && (this.state.handler.toolbar.actionButtons.map((b) => (
                <GenericMatButton {...b.props}>{b.text}</GenericMatButton>
            )))}
            {this.state.handler.toolbar.pagination && this.state.handler.pagination.toolbar.hasPrevious && <GenericMatButton>Prev</GenericMatButton>}
            {this.state.handler.toolbar.pagination && this.state.handler.pagination.toolbar.hasNext && <GenericMatButton>Next</GenericMatButton>}
          </Box>

        </Toolbar>
      </Container>

    }

    body = (genericPageContext) => this.state.isLoading ? (
        <div style={{padding: '40px'}}>
          <div className="spinningLoadingIcon projectLoadingIcon vAlignCenter"></div>
        </div>
    ) : (<React.Fragment>
      {this.toolbar()}
      <PageComponent {...optionalProps} {...this.props}
                     onLoadComplete={this.onLoadComplete}
                     handler={this.state.handler}
                     onNavigate={genericPageContext.onNavigate}
                     setQueryParams={this.setQueryParams}
                     queryParams={this.state.queryParams}
      />
    </React.Fragment>)

    isNestedDetailPage = () => (optionalProps && optionalProps.detailPage && optionalProps.detailPage.nested);

    withPageLayout = (body) => <div className='page'>
      <div className="generic-page-body">
        {body}
      </div></div>

    renderGenericPage = (genericPageContext) => {
      return this.isNestedDetailPage() ? this.body(genericPageContext) : this.withPageLayout(this.body(genericPageContext))
    }

    render() {

      const onNavigate = this.onNavigateOut(this.props.userConfig,this.state.queryParams,this.isSelectionInfoValid,this.props.history);

      //looks like handler is "calculated" only when component mounts and never changes
      const genericPageContext = {
        handler: this.state.handler,
        onNavigate: onNavigate
      };
      return <GenericPageContext.Provider value={genericPageContext}>{this.renderGenericPage(genericPageContext)}</GenericPageContext.Provider>
    }

  };

  GenericPage.contextTypes = {
    ifefPlatform: PropTypes.object,
    ifefSnapper: PropTypes.object,
    ifefNavDirection: PropTypes.string,
    ifefShowPopover: PropTypes.func,
    ifefUpdatePopover: PropTypes.func,
    ifefUpdatePopup: PropTypes.func,
    ifefShowModal: PropTypes.func
  };

  const mapStateToProps = state => ({
    //please connect here only high level generic slices
  })
  const mapDispatchToProps = {
  }

  return compose(
      connect(mapStateToProps, mapDispatchToProps),
  )(GenericPage);

};



export default withGenericPage;