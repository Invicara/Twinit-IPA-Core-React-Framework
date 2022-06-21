import React from "react";

import FileHelpers from '../../IpaUtils/FileHelpers';
import _ from "lodash";
import ScriptHelper from "../../IpaUtils/ScriptHelper";
import ScriptCache from "../../IpaUtils/script-cache";
import withEntityStore from './WithEntityStore';

//TODO Most of this logic (probably all) should be gradually moved to thunks and the reducer in the entities store
const withEntitySearch = WrappedComponent => {
    const EntitySearchHOC =  class extends React.Component {
        constructor(props) {
            super(props);
            let queryParamsPerEntityType = this.initQueryParamsValues(props,props.currentEntityType.singular);
            this.state = {
                isPageLoading: true,
                availableDataGroups: {},
                //groups: _.get(this, 'props.queryParams.groups'),
                extendedData : this.deriveExtendedDataFromProps(props.handler),
                //when entity changes, we will switch between "queries", kind of
                queryParamsPerEntityType
            };
        }

        getCurrentConfig = () => this.props.handler.config;

        //Checks if this handler/page supports multiple entity types (like assets and spaces)
        allowsMultipleEntityTypes = () => Array.isArray(this.getCurrentConfig().type);

        getAllowedEntityTypes = () => this.allowsMultipleEntityTypes() ?
            this.getCurrentConfig().type.map(entityType => entityType.singular) :
            [this.getCurrentConfig().type.singular];


        //don't use GenericPage setQueryParams directly, it will mix partial queries from different entities
        setQueryParams = (queryParamsPartial, callback) => {
            const entityType = queryParamsPartial.entityType || this.props.entitySingular;
            const current = this.state.queryParamsPerEntityType[entityType] || {};
            const merged = {...current, ...queryParamsPartial};
            this.setState({queryParamsPerEntityType : {...this.state.queryParamsPerEntityType, [entityType] : merged}}, callback || _.noop);
            //no need to send that up to state, as selectionInfo.queryParams will have all the info
            //this.props.setQueryParams(queryParamsPartial);
        }

        setAvailableDataGroups = (entity, propertiesOnly) => {

            // First pass through mark any "property groups" as available
            let availableDataGroups = {}
            this.setState({loadingAvailableDataGroups: true})
            Object.entries(this.props.getPerEntityConfig()).forEach(([entityType, config]) => {
                if(config.data){
                    Object.entries(config.data).forEach(([dataGroupName, dataGroup]) => {
                        if (dataGroup.isProperties) {
                            availableDataGroups[entityType] = availableDataGroups[entityType] || {}
                            availableDataGroups[entityType][dataGroupName] = true
                        }
                    })
                }
            })
            this.setState({availableDataGroups})

            if (!propertiesOnly) {
                // Second pass through run the scripts for each extended data and see if they have data
                const _setAvailable = (entityType, dataGroupName, val) => {
                  
                    let isAvailable
                    if (!val)
                      isAvailable = false
                    else if (Array.isArray(val) && val.length > 0)
                      isAvailable = true
                    else if (Object.keys(val).length > 0)
                      isAvailable = true
                    else
                      isAvailable = false
                  
                    let availableDataGroups = Object.assign({}, this.state.availableDataGroups)
                    availableDataGroups[entityType] = availableDataGroups[entityType] || {}
                    availableDataGroups[entityType][dataGroupName] = isAvailable
                    this.setState({availableDataGroups})
                }
                let scriptPromises = []
                Object.entries(this.props.getPerEntityConfig()).forEach(([entityType, config]) => {
                    Object.entries(config.data).forEach(([dataGroupName, dataGroup]) => {
                        if (dataGroup.script && entity) {
                            scriptPromises.push(ScriptCache.runScript(dataGroup.script, {entityInfo: entity}, {scriptExpiration: dataGroup.scriptExpiration})
                                .then(extendedData => {
                                    _setAvailable(entityType, dataGroupName, extendedData)
                                })
                                .catch(error => {
                                    _setAvailable(entityType, dataGroupName, false)
                                }))
                        }
                    })
                })
                Promise.all(scriptPromises).finally(() => {
                  this.setState({loadingAvailableDataGroups: false})
                })
            } else {
                this.setState({loadingAvailableDataGroups: false})
            }
        };


        async componentDidMount() {
            this.selectedEntitiesEffect();
            //run on load complete every time isPageLoading updates
            this.setState({isPageLoading: false}, this.onLoadComplete);
        }

        componentDidUpdate(prevProps, prevState, snapshot) {
            if(prevProps.selectedEntities !== this.props.selectedEntities) {
                this.selectedEntitiesEffect()
            }
        }

        selectedEntitiesEffect(){
            if (this.props.selectedEntities) {
                this.setAvailableDataGroups(this.props.selectedEntities[0], false)
            }
        }

        onLoadComplete = async () => {
            if (this.props.onLoadComplete) this.props.onLoadComplete();
            //redux store should already be set with appropriate entity types
            await this.initialFetchFromQuery();
        }

        initQueryParamsValues = (props, initialEntitySingular) => {
            const queries = {};
            this.getAllowedEntityTypes().forEach((et)=>{
                queries[et] = {};
            });
            let {queryParams} = props;
            if (queryParams && (queryParams.entityType || initialEntitySingular)) {
                queries[queryParams.entityType || initialEntitySingular] = queryParams;
            }
            return queries;
        }

        initialFetchFromQuery = async () => {
            let {queryParams} = this.props
            if (queryParams!==undefined) {
                const queryEntityConfig = this.props.getPerEntityConfig()[queryParams.entityType]
                // if we have a query and it's for an available entity type at this page and the query was originated at
                // a page dealing with the same entity type it is meant to retrieve, then we can run the passed in query,
                // fetching the entities using the selectors
                if (queryParams.query && _.includes(this.getAllowedEntityTypes(), queryParams.entityType) &&
                    queryParams.entityType === queryParams.senderEntityType
                    //this check is important not to mess with store
                    && queryParams.entityType === this.props.entitySingular) {
                    // note: id might be an index into the array or a textual id from the user config....
                    let selector = queryEntityConfig.selectors[queryParams.query.id]
                    if (!selector) selector = queryEntityConfig.selectors.find(s => s.id === queryParams.query.id)
                    //if the queryParams have a query, but no id and value, assume thats its a list of ids to fetch
                    //this may not always be true?
                    if (!selector && queryParams.query && !queryParams.id && queryParams.query.value && Array.isArray(queryParams.query.value)) {
                        selector = {query: "<<ID_SEARCH>>"}
                    }
                    if (selector) {
                        let fetcher = this.getFetcher(queryEntityConfig.script)
                        fetcher(selector, queryParams.query.value, true, this.onInitialFetchComplete)
                    } else {
                        console.warn("Unable to find selectBy with id of", queryParams.query.id)
                    }
                }
                // else if we have selected entities for an available entity type at this page but they come from a page
                // dealing with another type of entities, that means we can't use the query from the source page so we
                // run a query to select those ids directly and keep the original sender ...
                else if (_.includes(this.getAllowedEntityTypes(), queryParams.entityType) &&
                    queryParams.entityType !== queryParams.senderEntityType &&
                    queryParams.selectedEntities
                    //this check is important not to mess with store
                    && queryParams.entityType === this.props.entitySingular) {
                    let fetcher = this.getFetcher(currentEntityConfig.script, queryParams.senderEntityType)
                    fetcher({query: "<<ID_SEARCH>>"}, queryParams.selectedEntities, true)
                }
                // otherwise warn the developer if something strange happened... (possibly a user configuraiton issue?)
                //TODO add a config validator on load
                else if (queryParams.entityType && !_.includes(this.getAllowedEntityTypes(), queryParams.entityType)) {
                    console.warn("Incompatible entity type provided in query params got:", queryParams.entityType,
                        "but expected one of ", this.getAllowedEntityTypes())
                } else {
                    console.warn("Incompatible entity type provided in query params got:", queryParams.entityType,
                        "but expected ", this.props.entitySingular)
                }
            }
        }

        onInitialFetchComplete = () => {
            //we assume that last query run is the one this callback is for, so we get groups and filters from here
            const queryParams = this.state.queryParamsPerEntityType[this.props.entitySingular];
            //If there were filters, be sure to apply them after entity selection
            if(queryParams.filters){
                this.props.applyFiltering(queryParams.filters);
            }
            if(queryParams.groups){
                this.props.applyGrouping(queryParams.groups);
            }
            // set selectedEntities from a list of queryParam entity ids
            if (queryParams.selectedEntities) {
                this.props.setSelecting(queryParams.selectedEntities.length === 1)
                let selectedEntities = []
                queryParams.selectedEntities.forEach(id =>
                    selectedEntities.push(this.props.entities.find(e => e._id == id)))
                if (selectedEntities.length > 0)
                    this.setSelectedEntities(selectedEntities)
                this.props.setSelecting(false)
            }
        }


        deriveExtendedDataFromProps = (handler) => {
            let extendedData = {};
            //check for extended data on entities
            if (handler.config.data) {
                let dataTypes = Object.keys(handler.config.data);
                if (!!dataTypes.length) {
                    //gets an object of all the extended datatypes
                    let consolidatedExtendedData = _.values(handler.config.data).reduce((acc, current) => ({...acc, ...current}));
                    extendedData = handler.config.type ? consolidatedExtendedData : handler.config.data;
                }
            }
            return extendedData;
        }

        onEntityChange = (changeType, entity, result) => {          
          if (Array.isArray(entity)) {
            entity.forEach((ent) => {
              this.props.changeEntity(changeType, ent, result)
            })
          } else {
              this.props.changeEntity(changeType, entity, result)
          }
        }

        doEntityAction = async (action, entityInfo, type) => {
            if (!Object.keys(this.getCurrentConfig().actions).includes(action)) {
                console.error("Unconfigured action: '" + action + "' : No action taken!");
                return undefined;
            } else if (this.getCurrentConfig().actions[action].type === 'navigate') {
                let selectionInfo = {};
                let navConfig = this.getCurrentConfig().actions[action]

                if (navConfig.script) {
                    // if there's a pre-processing script then execute it

                    let selectedEntities;
                    // first try checked table items (entityInfo.original contains the checked table items)
                    if (_.isArray(entityInfo.original) && entityInfo.original.length > 0)
                        selectedEntities = entityInfo.original;
                    // then try selected tree items
                    else if (this.props.selectedEntities && this.props.selectedEntities.length > 0)
                        selectedEntities = this.props.selectedEntities
                    // if nothing selected then pass the filtered entities in the tree (which could be all if no filters)
                    else
                        selectedEntities = this.props.filteredEntities

                    let result = await ScriptHelper.executeScript(
                        navConfig.script,
                        {entityInfo: {selectedEntities}})

                    let selectedIds = []
                    if (_.isArray(result.selectedEntities))
                        selectedIds = result.selectedEntities.map(e => e._id)
                    else if (_.isObject(result.selectedEntities))
                        selectedIds = [result.selectedEntities._id];


                    let entityType = navConfig.scriptResultType ? navConfig.scriptResultType : this.props.entitySingular;

                    const emptyQueryParams = {
                        query: null,
                        groups: null,
                        filters: null,
                        senderEntityType: this.props.entitySingular,
                        entityType: (type || this.props.entitySingular)
                    }
                    /* domi: commenting this out - not needed - we can do that below without triggering async state update
                    this.setQueryParams(emptyQueryParams);
                    */

                    //overwrite GenericPage current queryParams by sending empty ones
                    selectionInfo = {entityType, selectedEntities: selectedIds, queryParams : emptyQueryParams}

                } else {

                    /* domi: commenting this out -
                    1. we can do that below without triggering async state update
                    2. also this might be wrong now as type can be now an array
                    this.setQueryParams({
                       entityType: this.getCurrentConfig().type.singular,
                       senderEntityType: this.getCurrentConfig().type.singular
                    })
                    */

                    selectionInfo['queryParams'] = {...this.state.queryParamsPerEntityType[this.props.entitySingular], selector : undefined};
                    selectionInfo['entityType'] = ((typeof type === 'string' ? type : type?.singular) || this.props.entitySingular);
                    selectionInfo['script'] = this.props.getPerEntityConfig()[this.props.entitySingular].script;
                    // entityInfo.original contains the checked table items...
                    if (_.isArray(entityInfo.original) && entityInfo.original.length > 0)
                        selectionInfo['selectedEntities'] = entityInfo.original.map(e => e._id)
                    // selectedEntities are the entities selected in the tree...
                    else if (this.props.selectedEntities && this.props.selectedEntities.length > 0)
                        selectionInfo['selectedEntities'] = this.props.selectedEntities.map(ent => ent._id);
                }

                this.props.onNavigate(navConfig.navigateTo, selectionInfo);

                return {success: true};

            } else if (this.getCurrentConfig().actions[action].type === 'fileDownload') {
                FileHelpers.downloadDocuments(Array.isArray(entityInfo.original) ? entityInfo.original : [entityInfo.original]);
                return {success: true};
            } else {
                let scriptName = this.getCurrentConfig().actions[action].script;
                let result = await ScriptHelper.executeScript(scriptName, {entityInfo: entityInfo});
                return result;
            }
        }

        //TODO turn this into a reasonable thunk and move to redux layer
        getFetcher = (script, originalSender, runScriptOptions) => async (selector, value, initialPageLoad, onInitialFetchComplete) => {
            //get fetcher should never run for a different entity then what's in the state
            if(selector.query.entityType && selector.query.entityType !== this.props.entitySingular){
                const reason = `fetching ${selector.query.entityType} type not allowed, expecting ${this.props.entitySingular}`;
                console.error(reason);
                return Promise.reject();
            }
            console.log("getFetcher", runScriptOptions)
            await this.props.fetchEntities(script, selector, value, runScriptOptions);
            //in case of initial query triggered by this page, this callback will still use old query
            if(onInitialFetchComplete)onInitialFetchComplete();
            const fetchedQuery = {
                query: {type: selector.query, id: selector.id, value},
                senderEntityType: originalSender || this.props.entitySingular,
                entityType: this.props.entitySingular,
                selector: selector
            }
            this.setQueryParams(fetchedQuery);
        }



        getEntityExtendedData = (extendedDataConfig) => {
            if (!extendedDataConfig) {
                console.error("Unconfigured extended data");
                return () => undefined;
            }
            return async (dataType, entityInfo) => {
                let scriptName = extendedDataConfig[dataType].script;
                let scriptExpiration = extendedDataConfig[dataType].scriptExpiration;
                let result = await ScriptCache.runScript(scriptName, {entityInfo: entityInfo}, {scriptExpiration: scriptExpiration});
                return result;
            }
        };

        onGroupOrFilterChange = (changes) => {
            this.setQueryParams(changes)
            this.props.resetForFilteringAndGrouping({
                filters: changes.filters,
                groups: changes.groups
            })
        }

        render() {
            const wrappedProps = {...this.props, ...this.state,
                queryParams : this.state.queryParamsPerEntityType[this.props.entitySingular],
                setQueryParams : this.setQueryParams
            }
            return <WrappedComponent onEntityChange={this.onEntityChange}
                                     doEntityAction={this.doEntityAction}
                                     getEntityExtendedData={this.getEntityExtendedData}
                                     getPerEntityConfig={this.props.getPerEntityConfig}
                                     entitiesSelected={this.props.setSelectedEntities}
                                     getFetcher={this.getFetcher}
                                     setAvailableDataGroups={this.setAvailableDataGroups}
                                     updateEntityType={this.updateEntityType}
                                     onGroupOrFilterChange={this.onGroupOrFilterChange}
                                     {...wrappedProps}/>
        }
    }

    return withEntityStore(EntitySearchHOC);
};

export default withEntitySearch;
