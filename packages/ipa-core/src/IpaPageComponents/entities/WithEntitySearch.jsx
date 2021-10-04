import React from "react";

import FileHelpers from '../../IpaUtils/FileHelpers';
import _ from "lodash";
import {
    applyFiltering,
    changeEntity,
    getAllCurrentEntities, getFilteredEntities,
    getFetchingCurrent, getSelectedEntities,
    resetEntities, setCurrentEntityType,
    setEntities,
    setFetching, setSelectedEntities, setSelecting, fetchEntities
} from "../../redux/slices/entities";
import {connect} from "react-redux";

import ScriptHelper from "../../IpaUtils/ScriptHelper";
import ScriptCache from "../../IpaUtils/script-cache";


//TODO Most of this logic (probably all) should be gradually moved to thunks and the reducer in the entities store
const withEntitySearch = WrappedComponent => {
    const EntitySearchHOC =  class extends React.Component {
        constructor(props) {
            super(props);
            //FIXME this is rather ugly but we need to get rid of the props-to-state copies in EntitySelectionPanel to be able to fix this
            props.applyFiltering(_.get(this, 'props.queryParams.filters'))
            this.state = {
                isPageLoading: true,
                availableDataGroups: {},
                groups: _.get(this, 'props.queryParams.groups')
            };
        }

        getCurrentConfig = () => this.props.handler.config;

        allowsMultipleEntities = () => Array.isArray(this.getCurrentConfig().type);

        getAllowedEntityTypes = () => this.allowsMultipleEntities() ?
            this.getCurrentConfig().type.map(entityType => entityType.singular) :
            [this.getCurrentConfig().type.singular];

        getPerEntityConfig = () => {
            const {entityData, type, selectBy, data} = this.getCurrentConfig();
            if (this.allowsMultipleEntities()) {
                const consolidatedConfig = _.mergeWith({...entityData}, {...selectBy}, (entityData, selectors, key) => ({
                    script: entityData.script,
                    entityFromModelScript: entityData.getEntityFromModel,
                    spaceMode: entityData.spaceMode,
                    selectors,
                    data: data[key]
                }));
                let result = _.mapValues(consolidatedConfig, (entityConfig, entityName) =>
                    ({...entityConfig, ...type.find(t => t.singular === entityName)})
                );
                return result;
            } else {
                return {
                    [type.singular]: {
                        script: entityData[type.singular].script,
                        spaceMode: entityData[type.singular].spaceMode,
                        selectors: selectBy,
                        data,
                        singular: type.singular,
                        plural: type.plural
                    }
                }
            }
        };

        setAvailableDataGroups = (entity, propertiesOnly) => {

            // First pass through mark any "property groups" as available
            let availableDataGroups = {}
            this.setState({loadingAvailableDataGroups: true})
            Object.entries(this.getPerEntityConfig()).forEach(([entityType, config]) => {
                Object.entries(config.data).forEach(([dataGroupName, dataGroup]) => {
                    if (dataGroup.isProperties) {
                        availableDataGroups[entityType] = availableDataGroups[entityType] || {}
                        availableDataGroups[entityType][dataGroupName] = true
                    }
                })
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
                Object.entries(this.getPerEntityConfig()).forEach(([entityType, config]) => {
                    Object.entries(config.data).forEach(([dataGroupName, dataGroup]) => {
                        if (dataGroup.script) {
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
                
                Promise.all(scriptPromises).then(() => {
                  this.setState({loadingAvailableDataGroups: false})
                })
            }
        };

        componentWillUnmount() {
            //TODO Once filters are moved to store, refactor the queryParam logic so that it can identify when URL applied
            // filters and entity match the current ones in the store and this cleaning (and the later refetching) of the entities
            // can be removed for being unnecessary and only done when needed
            this.props.resetEntities();
        }


        async componentDidMount() {
            this.setState({isPageLoading: true});
            const entityType = this.allowsMultipleEntities() ? _.values(this.getPerEntityConfig())[0] : this.getCurrentConfig().type;
            this.updateEntityType(entityType)
            await this.loadPageData();
            this.setState({isPageLoading: false}, this.onLoadComplete);
        }

        componentDidUpdate(prevProps, prevState, snapshot) {
            if(prevProps.selectedEntities !== this.props.selectedEntities) this.selectedEntitiesEffect()
        }

        selectedEntitiesEffect(){
            if (this.props.selectedEntities) {
                if (this.props.selectedEntities.length === 1) this.setAvailableDataGroups(this.props.selectedEntities[0], false)
                if (this.props.selectedEntities.length > 1) this.setAvailableDataGroups(this.props.selectedEntities[0], true)
            }
        }

        updateEntityType = ({singular, plural, ...rest}) => {
            //TODO remove these from state and always take from store
            this.setState({entitySingular: singular, entityPlural: plural});
            this.props.setCurrentEntityType({singular, plural, ...rest})
        }

        onLoadComplete = () => {
            if (this.props.onLoadComplete) this.props.onLoadComplete()
            let {queryParams} = this.props
            if (queryParams) {
                const currentEntityConfig = this.getPerEntityConfig()[queryParams.entityType]
                // if we have a query and it's for an available entity type at this page and the query was originated at
                // a page dealing with the same entity type it is meant to retrieve, then we can run the passed in query,
                // fetching the entities using the selectors
                if (queryParams.query && _.includes(this.getAllowedEntityTypes(), queryParams.entityType) &&
                    queryParams.entityType === queryParams.senderEntityType) {
                    // note: id might be an index into the array or a textual id from the user config....
                    this.updateEntityType(this.getPerEntityConfig()[queryParams.entityType])
                    let selector = currentEntityConfig.selectors[queryParams.query.id]
                    if (!selector) selector = currentEntityConfig.selectors.find(s => s.id === queryParams.query.id)
                    
                    //if the queryParams have a query, but no id and value, assume thats its a list of ids to fetch
                    //this may not always be true?
                    if (!selector && queryParams.query && !queryParams.id && queryParams.query.value && Array.isArray(queryParams.query.value))
                      selector = {query: "<<ID_SEARCH>>"}
                    if (selector) {
                        let fetcher = this.getFetcher(currentEntityConfig.script)
                        fetcher(selector, queryParams.query.value, true, this.onInitialFetchComplete)
                    } else
                        console.warn("Unable to find selectBy with id of", queryParams.query.id)
                }
                // else if we have selected entities for an available entity type at this page but they come from a page
                // dealing ith another typo of entities, that means we can't use the query from the source page so we
                // run a query to select those ids directly and keep the original sender ...
                else if (_.includes(this.getAllowedEntityTypes(), queryParams.entityType) &&
                    queryParams.entityType !== queryParams.senderEntityType &&
                    queryParams.selectedEntities) {
                    let fetcher = this.getFetcher(currentEntityConfig.script, queryParams.senderEntityType)
                    fetcher({query: "<<ID_SEARCH>>"}, queryParams.selectedEntities, true)
                }
                // otherwise warn the developer if something strange happened... (possibly a user configuraiton issue?)
                //TODO add a config validator on load
                else if (queryParams.entityType && !_.includes(this.getAllowedEntityTypes(), queryParams.entityType)) {
                    console.warn("Incompatible entity type provided in query params got:", queryParams.entityType,
                        "but expected one of ", this.getAllowedEntityTypes())
                }
            }
        }

        loadPageData = async () => {
            let handler = this.props.handler;

            const getConsolidatedExtendedData = () => _.values(handler.config.data).reduce((acc, current) => ({...acc, ...current}));

            //check for extended data on entities
            if (handler.config.data) {
                let dataTypes = Object.keys(handler.config.data);
                if (!!dataTypes.length) {
                    this.setState({extendedData: handler.config.type ? getConsolidatedExtendedData() : handler.config.data});
                }
            }
        }


        onInitialFetchComplete = () => {
            //If there were filters, be sure to apply them after entity selection
            if(_.get(this, 'props.queryParams.filters')){
                this.props.applyFiltering(_.get(this, 'props.queryParams.filters'))
            }
            // set selectedEntities from a list of queryParam entity ids
            if (this.props.queryParams.selectedEntities) {
                this.props.setSelecting(this.props.queryParams.selectedEntities.length === 1)
                let selectedEntities = []
                this.props.queryParams.selectedEntities.forEach(id =>
                    selectedEntities.push(this.props.entities.find(e => e._id == id)))
                if (selectedEntities.length > 0)
                    this.entitiesSelected(selectedEntities)
                this.props.setSelecting(false)
            }
        }

        onEntityChange = (changeType, entity, result) => {
          
          if (Array.isArray(entity)) {
            entity.forEach((ent) => {
              this.props.changeEntity(changeType, ent, result)
            })
          } else
            this.props.changeEntity(changeType, entity, result)
        }

        doEntityAction = async (action, entityInfo) => {
            if (!Object.keys(this.getCurrentConfig().actions).includes(action)) {
                console.error("Unconfigured action: '" + action + "' : No action taken!");
                return undefined;
            } else if (this.getCurrentConfig().actions[action].type === 'navigate') {
                let query = {};
                let navConfig = this.getCurrentConfig().actions[action]

                if (navConfig.script) {
                    // if there's a pre-processing script then execute it
                    let entityType = navConfig.scriptResultType ? navConfig.scriptResultType : this.state.entitySingular
                    this.props.setQueryParams({
                        query: null,
                        groups: null,
                        filters: null,
                        senderEntityType: this.state.entitySingular,
                        entityType
                    });
                    let selectedEntities;
                    // first try checked table items
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
                        selectedIds = [result.selectedEntities._id]
                    query = {entityType, selectedEntities: selectedIds}
                } else {
                    this.props.setQueryParams({
                       entityType: this.getCurrentConfig().type.singular,
                       senderEntityType: this.getCurrentConfig().type.singular
                    })
                    query['entityType'] = this.getCurrentConfig().type.singular;
                    query['script'] = this.getPerEntityConfig()[this.state.entitySingular].script;
                    // entityInfo.original contains the checked table items...
                    if (_.isArray(entityInfo.original) && entityInfo.original.length > 0)
                        query['selectedEntities'] = entityInfo.original.map(e => e._id)
                    // selectedEntities are the entities selected in the tree...
                    else if (this.props.selectedEntities && this.props.selectedEntities.length > 0)
                        query['selectedEntities'] = this.props.selectedEntities.map(ent => ent._id);
                }
                this.props.onNavigate(navConfig.navigateTo, query);
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
        getFetcher = (script, originalSender) => async (selector, value, initialPageLoad, onInitialFetchComplete) => {
            await this.props.fetchEntities(script, selector, value);
            if(onInitialFetchComplete) onInitialFetchComplete()
            this.props.setQueryParams({
                query: {type: selector.query, id: selector.id, value},
                senderEntityType: originalSender || this.state.entitySingular,
                entityType: this.state.entitySingular
            });
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

        entitiesSelected = this.props.setSelectedEntities

        onGroupOrFilterChange = (changes) => {
            this.props.setQueryParams(changes)
            if (changes.filters) {
                this.props.applyFiltering(changes.filters)
            }
            this.entitiesSelected([])
        }

        render() {
            const wrappedProps = {...this.props, ...this.state}
            return <WrappedComponent onEntityChange={this.onEntityChange} doEntityAction={this.doEntityAction}
                                     getEntityExtendedData={this.getEntityExtendedData}
                                     getPerEntityConfig={this.getPerEntityConfig}
                                     entitiesSelected={this.entitiesSelected} getFetcher={this.getFetcher}
                                     setAvailableDataGroups={this.setAvailableDataGroups}
                                     updateEntityType={this.updateEntityType}
                                     onGroupOrFilterChange={this.onGroupOrFilterChange}
                                     {...wrappedProps}/>
        }
    }
    const mapStateToProps = state => ({
        entities: getAllCurrentEntities(state),
        selectedEntities: getSelectedEntities(state),
        fetching: getFetchingCurrent(state),
        filteredEntities: getFilteredEntities(state)
    })

    const mapDispatchToProps = {
        setEntities, setFetching, resetEntities, setSelectedEntities, setCurrentEntityType, setSelecting, applyFiltering,
        changeEntity, fetchEntities
    }

    return connect(mapStateToProps, mapDispatchToProps)(EntitySearchHOC)
};



export default withEntitySearch
