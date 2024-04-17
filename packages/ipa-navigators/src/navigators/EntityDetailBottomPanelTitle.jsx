import React, {useMemo} from "react";
import {
    EntityActionsPanel,
    withEntitySearch
} from "@invicara/ipa-core/modules/IpaPageComponents";

const EntityDetailBottomPanelTitle = ({/*props from HOC withEntityStore, HOC withEntitySearch, HOC withEntityConfig*/
                                      onEntityChange, doEntityAction, entitySingular, perEntityConfig,
                                      /*props from parent component*/
                                      detailedEntity, onReloadSearchTokenChanged}) => {

    const actions = useMemo(() => {
        const onActionSuccess = (actionType, newEntity, result) => {
            onReloadSearchTokenChanged(Math.floor((Math.random() * 100) + 1));
            onEntityChange(actionType, newEntity, result);
        }
        const config = perEntityConfig[entitySingular];
        if (config.actions) {
            let actions = {...config.actions}
            actions.onSuccess = onActionSuccess
            actions.doEntityAction = doEntityAction
            return actions;
        }
    },[perEntityConfig[entitySingular], doEntityAction, onEntityChange]);


    const context=null;// = useContext(AppContext);

    return <EntityActionsPanel
        context={context}
        actions={actions}
        entity={detailedEntity}
        type={perEntityConfig[entitySingular]}
        iconRenderer={icons => <div className="bottom-panel-actions">{icons}</div>}
    />
}

export default withEntitySearch(EntityDetailBottomPanelTitle);