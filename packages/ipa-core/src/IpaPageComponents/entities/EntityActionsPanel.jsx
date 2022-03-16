import React from "react"
import {compose} from "redux";
import {connect, useStore} from "react-redux";
import _ from 'lodash'
import ScriptHelper from "../../IpaUtils/ScriptHelper";

import { getEntityActionComponent } from '../../redux/slices/entityUI'

import '../../IpaStyles/DbmTooltip.scss'

const EntityActionsPanel = ({actions, entity, type, context, getEntityActionComponent, iconRenderer}) => {
  let icons = []

  const reduxStore = useStore();

  const runPreEntityActionScript = async (payload) => {

    const {action, entity, type} = payload

    if(!action.preActionScript){
      return entity;
    }

    let result = await ScriptHelper.executeScript(action.preActionScript, {entity: entity, entityType: action.entitySchema ? action.entitySchema : type.singular.toLowerCase()});

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

      let mockEntity = {
        "Asset Name": "Door-Lift.-",
        "assetCollections": {
            "_pageSize": 1,
            "_list": [
                {
                    "Collection Name": "Elevators",
                    "public": true,
                    "_id": "61fc29fbfb43412ccc41afa4",
                    "_metadata": {
                        "_updatedById": "ad9cb74a-d31c-4d87-94d5-ab9c5a87bdb3",
                        "_createdAt": 1643915771889,
                        "_createdById": "ad9cb74a-d31c-4d87-94d5-ab9c5a87bdb3",
                        "_updatedAt": 1643915771889
                    },
                    "properties": {
                        "Entity Types": {
                            "val": [
                                "Asset"
                            ],
                            "dName": "Entity Types",
                            "type": "tags"
                        },
                        "Type": {
                            "val": "Convenyance",
                            "dName": "Type",
                            "type": "text"
                        }
                    }
                }
            ],
            "_offset": 0,
            "_total": 1
        },
        "_id": "61e57078fb43412ccc41a8c4",
        "_metadata": {
            "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
            "_createdAt": 1642426488927,
            "_createdById": "ad9cb74a-d31c-4d87-94d5-ab9c5a87bdb3",
            "_updatedAt": 1646822511803
        },
        "properties": {
            "dtCategory": {
                "val": "Elevator",
                "hasMultipleValues": false
            },
            "BA Name": {
                "val": "A-M_Elevator_-_Center_284::72\" x 114\" Hospital min.",
                "dName": "BA Name",
                "type": "text",
                "hasMultipleValues": false
            },
            "Room Number": {
                "val": "Lift.",
                "dName": "Room Number",
                "type": "text",
                "hasMultipleValues": false
            },
            "dtType": {
                "val": "Doors",
                "hasMultipleValues": false
            },
            "Image Url": {
                "val": "",
                "dName": "Image Url",
                "type": "text",
                "hasMultipleValues": false
            },
            "Mark": {
                "val": "D-16",
                "dName": "Mark",
                "type": "text",
                "hasMultipleValues": false
            },
            "Revit Family": {
                "val": "A-M_Elevator_-_Center_284",
                "dName": "Revit Family",
                "type": "text",
                "hasMultipleValues": false
            },
            "Date": {
                "val": "10/9/76",
                "dName": "Date",
                "epoch": 210985200000,
                "type": "date",
                "hasMultipleValues": false
            },
            "Revit Type": {
                "val": "72\" x 114\" Hospital min.",
                "dName": "Revit Type",
                "type": "text",
                "hasMultipleValues": false
            },
            "Matterport Url": {
                "val": "",
                "dName": "Matterport Url",
                "type": "text",
                "hasMultipleValues": false
            },
            "Manufacturer": {
                "val": "",
                "dName": "Manufacturer",
                "type": "text",
                "hasMultipleValues": false
            },
            "Model": {
                "val": "",
                "dName": "Model",
                "type": "text",
                "hasMultipleValues": false
            },
            "Containing Floor": {
                "val": "First Floor",
                "dName": "Containing Floor",
                "type": "text",
                "hasMultipleValues": false
            }
        }
    }

      let newEntity = Array.isArray(entity) ? [...entity, mockEntity] :  {...mockEntity}

      newEntity = await runPreEntityActionScript({action, entity: newEntity, type})
      // the factory create method can use the app context to display the component
      // e.g. context.ifefShowModal(modal);
      factory.create({action, entity: newEntity, type, context, reduxStore})
    }
    else {
      // if there's no component execute the action directly
      let newEntity = action.showOnTable && Array.isArray(entity) ? [...entity] : Object.assign({}, entity)

      newEntity = await runPreEntityActionScript({action, entity: newEntity, type});

      let origEntity = action.showOnTable && !Array.isArray(entity) ? [{...entity}] : entity;

      let result = await action.doEntityAction(action.name, {new: newEntity, original: origEntity});
      if (result.success) {
        if (action.onSuccess) action.onSuccess(action.type, newEntity, result)
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
          <div key={"icon-"+actionName} className="dbm-tooltip">
            <i className={action.icon}  onClick={e=>doAction(actionName)}/>
            <span className="dbm-tooltiptext">{actionName}</span>
          </div>
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