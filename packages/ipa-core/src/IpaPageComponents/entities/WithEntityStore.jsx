import React from "react";
import _ from "lodash";
import {
    applyFiltering,
    resetFiltering,
    changeEntity,
    getAllCurrentEntities,
    getFilteredEntities,
    getFetchingCurrent,
    getSelectedEntities,
    resetEntities,
    setCurrentEntityType,
    setEntities,
    getCurrentEntityType,
    setFetching,
    setSelectedEntities,
    setSelecting,
    fetchEntities,
    clearForNewEntityType,
    getSnapshot,
    loadSnapshot,
    resetForFilteringAndGrouping, getAppliedGroups, applyGrouping
} from "../../redux/slices/entities";
import {connect} from "react-redux";

const withEntityStore = WrappedComponent => {
    const EntityStoreHOC =  class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                //when entity changes we will switch between the "stores", kind of
                storeCacheMap: {}
            };
        }

        getCurrentConfig = () => this.props.handler.config;

        //Checks if this handler/page supports multiple entity types (like assets and spaces)
        allowsMultipleEntityTypes = () => Array.isArray(this.getCurrentConfig().type);

        getAllowedEntityTypes = () => this.allowsMultipleEntityTypes() ?
            this.getCurrentConfig().type.map(entityType => entityType.singular) :
            [this.getCurrentConfig().type.singular];

        //keeping this method name to avoid too much refactoring :)
        getPerEntityConfig = () => this._getPerEntityConfig(this.getCurrentConfig());
        _getPerEntityConfig =  _.memoize((currentConfig) => {
            const {entityData, type, selectBy, data} = currentConfig;
            if (this.allowsMultipleEntityTypes()) {
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
                        entityFromModelScript: entityData[type.singular].getEntityFromModel,
                        spaceMode: entityData[type.singular].spaceMode,
                        selectors: selectBy,
                        data,
                        singular: type.singular,
                        plural: type.plural
                    }
                }
            }
        });

        initStoreValues = (initialEntityType) => {
            // it updates the store couple of times separately, no need for a new reducer here yet
            // as it's run from the constructor and child components are not connected yet
            let {queryParams} = this.props;
            if (initialEntityType) {
                const currentEntityType = {singular : initialEntityType.singular, plural: initialEntityType.plural}
                if(queryParams && queryParams.entityType === initialEntityType.singular && queryParams.filters) {
                    this.props.applyFiltering(queryParams.filters);
                }
                if(queryParams && queryParams.entityType === initialEntityType.singular && queryParams.groups) {
                    this.props.applyGrouping(queryParams.groups);
                }
                this.props.setCurrentEntityType(currentEntityType);
            }
        }

        componentDidMount() {
            // hello, we have connected to an empty redux store
            // entity type must be set on state to make up for the empty store
            const initialEntityType = this.deriveInitialEntityType(this.props.queryParams, this.props.handler);
            //re-render the component with entity type
            this.initStoreValues(initialEntityType);
        }

        componentWillUnmount() {
            this.saveStore();
            //TODO Once filters are moved to store, refactor the queryParam logic so that it can identify when URL applied
            // filters and entity match the current ones in the store and this cleaning (and the later refetching) of the entities
            // can be removed for being unnecessary and only done when needed
            this.props.resetEntities();
        }

        deriveInitialEntityType = (queryParams) => {
            if (queryParams) {
                const currentEntityConfig = this.getPerEntityConfig()[queryParams.entityType]
                // if we have a query and it's for an available entity type at this page and the query was originated at
                // a page dealing with the same entity type it is meant to retrieve, then we can run the passed in query,
                // fetching the entities using the selectors
                if (queryParams.query && _.includes(this.getAllowedEntityTypes(), queryParams.entityType) &&
                    queryParams.entityType === queryParams.senderEntityType) {
                    // note: id might be an index into the array or a textual id from the user config....
                    return this.getPerEntityConfig()[queryParams.entityType];
                }
                // else if we have selected entities for an available entity type at this page but they come from a page
                // dealing with another type of entities, that means we can't use the query from the source page so we
                // run a query to select those ids directly and keep the original sender ...
            }
            //if we don't have query, or it should not influence entity type, we assume we are going to use first entity from the handler config
            return this.allowsMultipleEntityTypes() ? _.values(this.getPerEntityConfig())[0] : this.getCurrentConfig();
        }

        updateEntityType = (args) => {
            const {singular, plural, ...rest} = args;
            const currentEntity = this.props.currentEntityType;
            if(currentEntity.singular!==singular || currentEntity.plural!==plural) {
                const newEntityConfig = this.allowsMultipleEntityTypes() && _.includes(this.getAllowedEntityTypes(), singular) ? _.values(this.getPerEntityConfig())[singular] : this.getCurrentConfig();
                const newEntityType = {...args,...newEntityConfig};
                this.saveStore();
                this.switchStore(newEntityType);
            }
        }

        switchStore = ({singular, plural, ...rest}) => {
            //if we change entities check if we have previously saved store
            if(this.state.storeCacheMap[singular]){
                this.props.loadSnapshot(this.state.storeCacheMap[singular])
            } else {
                //if we haven't previously saved store for new entity, use current store, make sure we clear current store
                this.props.clearForNewEntityType({singular, plural, ...rest});
            }
        }

        saveStore = () => {
            if(!this.props.currentEntityType){
                console.error(`tried to save store for wrong entity type: ${this.props.currentEntityType}`)
                return;
            }
            const storeCacheMap = {...this.state.storeCacheMap, [this.props.currentEntityType.singular] : this.props.storeSnapshot};
            this.setState({storeCacheMap : storeCacheMap});
        }

        getWrappedComponent = (wrappedProps) => <WrappedComponent
            getPerEntityConfig={this.getPerEntityConfig}
            updateEntityType={this.updateEntityType}
            entitySingular={this.props.currentEntityType.singular}
            entityPlural={this.props.currentEntityType.plural}
            {...wrappedProps}/>

        render() {
            const wrappedProps = {...this.props/*, ...this.state*/}
            return this.props.currentEntityType == null ? null : this.getWrappedComponent(wrappedProps)
        }
    }
    const mapStateToProps = state => ({
        entities: getAllCurrentEntities(state),
        selectedEntities: getSelectedEntities(state),
        fetching: getFetchingCurrent(state),
        filteredEntities: getFilteredEntities(state),
        storeSnapshot: getSnapshot(state),
        currentEntityType: getCurrentEntityType(state),
        //groups where previously here in the state, carrying the name over
        groups: getAppliedGroups(state)
    })

    const mapDispatchToProps = {
        setEntities,
        setFetching, 
        resetEntities, 
        setSelectedEntities, 
        setCurrentEntityType,
        setSelecting, 
        applyFiltering,
        applyGrouping,
        resetFiltering,
        changeEntity, 
        fetchEntities,
        clearForNewEntityType,
        loadSnapshot,
        resetForFilteringAndGrouping
    }

    return connect(mapStateToProps, mapDispatchToProps)(EntityStoreHOC)
};



export default withEntityStore
