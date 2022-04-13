import withEntitySearch from './entities/WithEntitySearch'
import EntitySelectionPanel from './entities/EntitySelectionPanel'
import {TreeSelectMode} from './entities/EntitySelectionPanel'
import EntityDataStack from './entities/EntityDataStack'
import * as EntityDataContainer from './entities/EntityDataContainer'
import * as EntityDataGroupContainer from './entities/EntityDataGroupContainer'
import EntityActionsPanel from "./entities/EntityActionsPanel";
import {EntityListView, sortEntities} from "./entities/EntityListView";

const IpaPageComponents = {
    withEntitySearch,
    EntitySelectionPanel,
    EntityDataStack,
    EntityDataContainer,
    EntityDataGroupContainer,
    TreeSelectMode,
    EntityActionsPanel, 
    EntityListView,
    sortEntities
}

export default IpaPageComponents