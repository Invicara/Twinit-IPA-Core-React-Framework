import withEntityStore from './entities/WithEntityStore'
import withEntitySearch from './entities/WithEntitySearch'
import EntitySelectionPanel from './entities/EntitySelectionPanel'
import {TreeSelectMode} from './entities/EntitySelectionPanel'
import EntityDataStack from './entities/EntityDataStack'
import * as EntityDataContainer from './entities/EntityDataContainer'
import * as EntityDataGroupContainer from './entities/EntityDataGroupContainer'
import EntityActionsPanel from "./entities/EntityActionsPanel";
import {EntityListView} from "./entities/EntityListView";
import {EntityTableContainer} from "./entities/EntityTableContainer";
import useSortEntities, {ASCENDING_ORDER, DESCENDING_ORDER, ENTITY_LIST_SORT_PREFERENCE, usePaginateEntities} from "./entities/sortEntities";

const IpaPageComponents = {
    withEntitySearch,
    withEntityStore,
    EntitySelectionPanel,
    EntityDataStack,
    EntityDataContainer,
    EntityDataGroupContainer,
    TreeSelectMode,
    EntityActionsPanel, 
    EntityListView,
    EntityTableContainer,
    useSortEntities, ASCENDING_ORDER, DESCENDING_ORDER, ENTITY_LIST_SORT_PREFERENCE,
    usePaginateEntities
}

export default IpaPageComponents