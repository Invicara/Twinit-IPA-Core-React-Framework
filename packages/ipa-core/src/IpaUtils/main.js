
import {listEquals, listIncludes, propsEqual, setIncludesBy} from './compare'
import FileHelpers, {downloadDocuments, getFileUrl, getFileUrlForFilename} from './FileHelpers'
import ScriptHelper from './ScriptHelper'
import TreeRendererHelper, {branchNodeRenderer, leafNodeRenderer} from './TreeRendererHelper'
import ScriptCache from './script-cache'
//import {AppContext} from './../AppProvider'
import AdvSearchQueryBuilder from "./AdvSearchQueryBuilder";
import AttributeHelpers from "./AttributeHelpers";
import {formatBytes} from "./bytesunit";
import {asSelectOption, asSelectOptions} from "./controls";
import {curriedFlip} from "./function";
import {
    getPlatform,
    getRandomString,
    getTitleBarInfoFromProps,
    group,
    isValidUrl,
    nestedGroup,
    parseQuery
} from "./helpers";
import {distinct} from "./list";
import {
    defaultBranchRenderer,
    defaultLeafRenderer,
    propagateNodeStatusDown,
    propagateNodeStatusUp, recalculateNodeStatus, TreeNodeStatus, TreeNodeActionName,
    withoutPropagation
} from "./TreeHelpers";
import {usePrevious} from "./usePrevious";
import {getEntityFromModel, getFilteredEntitiesBy} from "./entities";
import FilterControl from "../IpaControls/FilterControl";

const IpaUtils = {
    //AppContext,
    AdvSearchQueryBuilder,
    AttributeHelpers,
    formatBytes,
    listEquals,
    listIncludes,
    propsEqual,
    setIncludesBy,
    asSelectOption,
    asSelectOptions,
    downloadDocuments: downloadDocuments,
    getFileUrlForFilename,
    getFileUrl,
    curriedFlip,
    getPlatform,
    parseQuery,
    getTitleBarInfoFromProps,
    getRandomString,
    group,
    nestedGroup,
    isValidUrl,
    distinct,
    ScriptHelper,
    ScriptCache,
    FileHelpers,
    defaultLeafRenderer,
    defaultBranchRenderer,
    withoutPropagation,
    propagateNodeStatusDown,
    propagateNodeStatusUp,
    recalculateNodeStatus,
    leafNodeRendererOld: leafNodeRenderer,
    branchNodeRendererOld: branchNodeRenderer,
    usePrevious,
    getFilteredEntitiesBy,
    applyFilters : FilterControl.applyFilters,
    getEntityFromModel,
    TreeNodeStatus, TreeNodeActionName
}

export default IpaUtils