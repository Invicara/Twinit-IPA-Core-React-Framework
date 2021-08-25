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

import './GenericPage.scss'

const URL_LENGTH_WARNING = 80000

const withGenericPage = (PageComponent) => {

  class GenericPage extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
        project: null,
        userConfig: null,
        isLoading: true,
        isPageLoading: true,
        queryParams: {},
        redirectTo: null
      };

      this._loadPageData = this._loadPageData.bind(this);
      this.handleAction = this.handleAction.bind(this);
      this.onLoadComplete = this.onLoadComplete.bind(this);
      this.onNavigate = this.onNavigate.bind(this);
      this.onNavigated = this.onNavigated.bind(this);
    }

    componentDidMount() {

      console.log('generic onmount locatiom', window.location.href)

      let hrefSplits = window.location.href.split('?')
      console.log(hrefSplits)

      if (hrefSplits.length > 1 && hrefSplits[1].includes('route=')) {
        let routeSplit = hrefSplits[1].split("=")
        console.log(routeSplit)
        let redirectTo = {
          pathname: '/' + routeSplit[1],
          search: '?' + hrefSplits[2].slice(0,-2)
        }
        console.log(redirectTo)

        this.setState({redirectTo, isLoading: false})
      } else {
        this.setState({project: this.props.selectedItems.selectedProject, userConfig: this.props.selectedItems.userConfig});
        this._loadPageData();
        this.onNavigated();
      }
    }

    componentDidUpdate(prevProps) {
      //if the search changes the component doesn't get re-mounted, but still we need to react to the change in navigation
      if(this.props.location.search !== prevProps.location.search){
        this.onNavigated();
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
      let handler = await produce(this.props.actions.getCurrentHandler(), async handler => {

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

        if (handler.config && !handler.config.data && handler.config.type && this.props.userConfig.entityDataConfig) {
          if (!Array.isArray(handler.config.type) && this.props.userConfig.entityDataConfig[handler.config.type.singular]) {

            //if the page is expecting only one data config
            handler.config = {...handler.config, data: this.props.userConfig.entityDataConfig[handler.config.type.singular]};

          }
          else {
            //if the page is expecting multiple data configs filter to the ones it expects            
            handler.config = {...handler.config,
                              data: _.fromPairs(
                                handler.config.type.filter(t => !!this.props.userConfig.entityDataConfig[t.singular])
                                                    .map(t => [t.singular, this.props.userConfig.entityDataConfig[t.singular]])
                                                )
                              }
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
            await ScriptHelper.loadScript({_userType: scriptTypes[i]});
          }
        }

        //load script from userConfig
        let runScripts = handler.onHandlerLoad ? handler.onHandlerLoad : null;
        if (!!runScripts && runScripts.length > 0) {

          //load all script types on the handler
          for (let i = 0; i < runScripts.length; i++) {
            await ScriptHelper.executeScript(runScripts[i]);
          }
        }
      })

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

    isSelectionInfoValid(selectionInfo) {

      if (selectionInfo && !selectionInfo.entityType) {
        console.error('Attempting to pass query parameters with no entity type!');
        return false;
      }
      else return true;

    }

    setQueryParams = (partial) => this.setState({queryParams: Object.assign(this.state.queryParams, partial)})

    //provide pageComponents with a navigate function to place query criteria in the url to pass to other pages
    onNavigate(destinationHandler, selectionInfo) {

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

      if (!destinationHandler || !Object.keys(this.props.userConfig.handlers).includes(destinationHandler)) {
        console.error('Attempting to navigate without a valid destination handler:', destinationHandler);
        return false;
      }

      if (!this.isSelectionInfoValid(selectionInfo)) {
        console.error('Attempting to navigate invalid query parameters!');
        return false;
      }
      let newPath
      if (!selectionInfo && !this.state.queryParams.query) {
        newPath = this.props.userConfig.handlers[destinationHandler].path;
      }
      else {
        let query = Object.assign({}, this.state.queryParams)

        //override the pages queryParams if the selectionInfo also provides queryParams
        if (selectionInfo.queryParams) {
          query = Object.assign(query, selectionInfo.queryParams)
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
        newPath = this.props.userConfig.handlers[destinationHandler].path + '?' + qs.stringify(query);
      }

      // console.log('url sizes: ', urlSizeUtf8Chrome, urlSizeUtf16Chrome, urlLengthEdge);
      if (newPath.length > URL_LENGTH_WARNING)
        console.warn('url length is very large and navigation may not work!');

      this.props.history.push(newPath);
    }

    onNavigated() {

      if (this.props.location.search) {
        let rawParams = this.props.location.search.split('?')[1];
        // using decoder to parse boolean and int https://github.com/ljharb/qs/issues/91#issuecomment-437926409
        // qs will also limit specifying indices in an array to a maximum index of 20. Any array members with an 
        // index of greater than 20 will instead be converted to an object with the index as the key. 
        // This is needed to handle cases when someone sent, for example, a[999999999] and it will take significant time to iterate over this huge array.
        // This limit can be overridden by passing an arrayLimit option: We are going to use an arraylimit of 100 to cover almost every case, 
        // if we are still finding more bugs on this parse, we will need to implement another solution for these arrays

        let queryParams = qs.parse(rawParams, { arrayLimit: 100,
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
        
         if (!this.isSelectionInfoValid(queryParams)) {
            console.error('Navigation occurred with invalid query parameters!');
            this.setState({queryParams: {}});
          }

        if (queryParams.groups)
          queryParams.groups = queryParams.groups.split(',');

        console.log("on nav qp", queryParams)

        this.setState({queryParams});
      }
      else this.setState({queryParams: {}});

    }

    render() {

      return (
        <div className='page'>
            <div className="generic-page-body">
            {this.state.isPageLoading &&
              <div style={{padding: '40px'}}>
                <div className="spinningLoadingIcon projectLoadingIcon vAlignCenter"></div>
              </div>}
            
            {!this.state.isLoading && this.state.redirectTo && <Redirect push to={this.state.redirectTo} />}

            {!this.state.isLoading && !this.state.redirectTo && <PageComponent {...this.props}
                                          onLoadComplete={this.onLoadComplete}
                                          handler={this.state.handler}
                                          onNavigate={this.onNavigate}
                                          setQueryParams={this.setQueryParams}
                                          queryParams={this.state.queryParams}
                                      />}
          </div>
      </div>)
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

  const mapStateToProps = state => ({})
  const mapDispatchToProps = {
  }

  return connect(mapStateToProps, mapDispatchToProps)(GenericPage);

};



export default withGenericPage;
