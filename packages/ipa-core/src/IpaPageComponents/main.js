import withEntityStore from './entities/WithEntityStore'
import withEntitySearch from './entities/WithEntitySearch'
import withEntityConfig from './entities/WithEntityConfig'
import withEntityAvailableGroups from './entities/WithEntityAvailableGroups'
import {GenericPageContext, withGenericPageContext} from './genericPageContext'
import EntitySelectionPanel from './entities/EntitySelectionPanel'
import {TreeSelectMode} from './entities/EntitySelectionPanel'
import EntityDataStack from './entities/EntityDataStack'
import * as EntityDataContainer from './entities/EntityDataContainer'
import {useEntityData} from './entities/EntityDataContainer'
import * as EntityDataGroupContainer from './entities/EntityDataGroupContainer'
import EntityActionsPanel from "./entities/EntityActionsPanel";
import {EntityListView} from "./entities/EntityListView";
import {EntityTableContainer} from "./entities/EntityTableContainer";
import {JSONEditor} from "./omapi/JSONEditor";
import useSortEntities, {ASCENDING_ORDER, DESCENDING_ORDER, ENTITY_LIST_SORT_PREFERENCE, usePaginateEntities} from "./entities/sortEntities";
import withGenericPageErrorBoundary from "./GenericPageErrorBoundary";
import withGenericErrorBoundary from "./GenericErrorBoundary";

const IpaPageComponents = {
    //higher order components
    withEntityStore, withEntitySearch, withEntityConfig, withEntityAvailableGroups, withGenericErrorBoundary,
    GenericPageContext, withGenericPageContext, withGenericPageErrorBoundary,
    //components
    EntitySelectionPanel,
    EntityDataStack,
    EntityDataContainer,
    EntityDataGroupContainer,
    useEntityData,
    TreeSelectMode,
    EntityActionsPanel, 
    EntityListView,
    EntityTableContainer,
    JSONEditor,
    //custom hooks
    useSortEntities, usePaginateEntities,
    //static strings
    ASCENDING_ORDER, DESCENDING_ORDER, ENTITY_LIST_SORT_PREFERENCE,


}

export default IpaPageComponents
export {
    //higher order components
    withEntityStore, withEntitySearch, withEntityConfig, withEntityAvailableGroups, withGenericErrorBoundary,
    GenericPageContext, withGenericPageContext, withGenericPageErrorBoundary,
    //components
    EntitySelectionPanel,
    EntityDataStack,
    EntityDataContainer,
    EntityDataGroupContainer,
    useEntityData,
    TreeSelectMode,
    EntityActionsPanel,
    EntityListView,
    EntityTableContainer,
    JSONEditor,
    //custom hooks
    useSortEntities, usePaginateEntities,
    //static strings
    ASCENDING_ORDER, DESCENDING_ORDER, ENTITY_LIST_SORT_PREFERENCE,
}