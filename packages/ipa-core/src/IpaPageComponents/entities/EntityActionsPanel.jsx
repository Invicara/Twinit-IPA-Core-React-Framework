import React from "react"
import {compose} from "redux";
import {connect, useStore} from "react-redux";
import _ from 'lodash'
import ScriptHelper from "../../IpaUtils/ScriptHelper";

import { getEntityActionComponent } from '../../redux/slices/entityUI'
import './EntityActionsPanel.scss';
import '../../IpaStyles/DbmTooltip.scss'
import { Tooltip } from "@material-ui/core";

const EntityActionsPanel = ({actions, entity, type, context, getEntityActionComponent, iconRenderer}) => {
  let icons = []

  const reduxStore = useStore();

  const runPreEntityActionScript = async (payload) => {

    const {action, entity, type} = payload

    if(!action.preActionScript){
      return entity;
    }

    let result = await ScriptHelper.executeScript(action.preActionScript, {entity: entity, entityType: action.entitySchema ? action.entitySchema : type?.singular?.toLowerCase()});

    return result ?? entity;
  }

  const renderIcons = (icons) => iconRenderer ? iconRenderer(icons) : <div className="entity-actions-panel">{icons}</div>

  const doAction = async (actionName) => {
    let action = _.cloneDeep(actions[actionName])

    // populate the specific action with info needed by the action component
    action.name = actionName
    action.doEntityAction = actions.doEntityAction
    action.onSuccess = actions.onSuccess
    action.onError = actions.onError
    action.onCancel = actions.onCancel

    if (action.component) {
      // if there's a component then create it and let it handle the execution
      let factory = getEntityActionComponent(action.component.name)
      if (!factory) {
        console.error("No factory for " + action.component.name)
        return null
      }

      let newEntity = Array.isArray(entity) ? [...entity] :  {...entity}

      newEntity = await runPreEntityActionScript({action, entity: newEntity, type})
      // the factory create method can use the app context to display the component
      // e.g. context.ifefShowModal(modal)
      factory.create({action, entity: newEntity, type, context, reduxStore})
    } else {
      // if there's no component execute the action directly
      let newEntity = action.showOnTable && Array.isArray(entity) ? [...entity] : Object.assign({}, entity)

      newEntity = await runPreEntityActionScript({action, entity: newEntity, type});

      let origEntity = action.showOnTable && !Array.isArray(entity) ? [{...entity}] : entity;

      let result = await action.doEntityAction(action.name, {new: newEntity, original: origEntity}, type);
      if (result.success) {
        if (action.onSuccess) {
          action.onSuccess(action.type, newEntity, result)
        }
      }
      else {
        if (action.onError) action.onError(action.type, entity, result)
      }
    }
  }

  if (actions) {
    Object.keys(actions).forEach(actionName => {
      let action = actions[actionName]
      if (action.allow)
        icons.push(
          <Tooltip key={"icon-"+actionName} title={actionName}>
            <i className={action.icon}  onClick={e=>doAction(actionName)}/>
          </Tooltip>
        )
    })
  }
  return renderIcons(icons);
}

//export default EntityActionsPanel
const mapStateToProps = state => ({});

const mapDispatchToProps = {
    getEntityActionComponent
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(EntityActionsPanel)