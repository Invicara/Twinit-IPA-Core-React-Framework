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
import withEntityConfig from "./WithEntityConfig";

const withEntityStore = (WrappedComponent) => {
    const EntityStoreHOC =  class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                //when entity changes we will switch between the "stores", kind of
                storeCacheMap: {}
            };
        }

        initStoreValues = (initialEntityType) => {
            // it updates the store couple of times separately, no need for a new reducer here yet
            // as it's run from the constructor and child components are not connected yet
            let {queryParams} = this.props;
            if (initialEntityType) {
                const isCurrentEntityType = queryParams && queryParams.entityType === initialEntityType.singular
                if(isCurrentEntityType && queryParams.filters) {
                    this.props.applyFiltering(queryParams.filters);
                }
                if(isCurrentEntityType && queryParams.groups) {
                    this.props.applyGrouping(queryParams.groups);
                }
                this.props.setCurrentEntityType(initialEntityType);
            }
        }

        componentDidMount() {
            if(this.props.currentEntityType){
                //store is already populated, nothing here to do
                return;
            }
            // hello, we have connected to an empty redux store
            // entity type must be set on state to make up for the empty store
            const initialEntityType = this.deriveInitialEntityType(this.props.queryParams, this.props.handler);
            //re-render the component with entity type
            this.initStoreValues(initialEntityType);
        }

        componentWillUnmount() {
            //this.saveStore();
            //TODO Once filters are moved to store, refactor the queryParam logic so that it can identify when URL applied
            // filters and entity match the current ones in the store and this cleaning (and the later refetching) of the entities
            // can be removed for being unnecessary and only done when needed
            //this.props.resetEntities();
        }

        deriveInitialEntityType = (queryParams) => {
            if (queryParams) {
                const currentEntityConfig = this.props.perEntityConfig[queryParams.entityType]
                // if we have a query and it's for an available entity type at this page and the query was originated at
                // a page dealing with the same entity type it is meant to retrieve, then we can run the passed in query,
                // fetching the entities using the selectors
                if (queryParams.query && _.includes(this.props.allowedEntityTypes, queryParams.entityType) &&
                    queryParams.entityType === queryParams.senderEntityType) {
                    // note: id might be an index into the array or a textual id from the user config....
                    return this.props.perEntityConfig[queryParams.entityType];
                }
                // else if we have selected entities for an available entity type at this page but they come from a page
                // dealing with another type of entities, that means we can't use the query from the source page so we
                // run a query to select those ids directly and keep the original sender ...
            }
            //if we don't have query, or it should not influence entity type, we assume we are going to use first entity from the handler config
            return _.values(this.props.perEntityConfig)[0];
        }

        updateEntityType = (args) => {
            const {singular, plural, ...rest} = args;
            const currentEntity = this.props.currentEntityType;
            if(currentEntity.singular!==singular || currentEntity.plural!==plural) {
                const newEntityConfig = _.includes(this.props.allowedEntityTypes, singular) ? _.values(this.props.perEntityConfig)[singular] : {};
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

    return connect(mapStateToProps, mapDispatchToProps)(withEntityConfig(EntityStoreHOC))
};



export default withEntityStore
