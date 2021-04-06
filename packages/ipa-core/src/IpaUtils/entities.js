import {applyFilters} from "../IpaControls/FilterControl";
import ScriptHelper from "./ScriptHelper";

export const getFilteredEntitiesBy = (entities, filters) => applyFilters(entities, filters, (a, p) => {
    return p == "Entity Name" ? a["Entity Name"] : a.properties[p]
});

export const getEntityFromModel = async (script, modelEntity) => {//TODO fix script so that it returns model id if possible
    const entity = await ScriptHelper.executeScript(script, {modelInfo: modelEntity})
    if (entity) return {...entity, modelViewerIds: [modelEntity.id]}
    else return undefined
}