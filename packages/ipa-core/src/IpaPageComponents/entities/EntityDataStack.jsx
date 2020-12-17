import React from "react";
import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber"

import clsx from "clsx";
import _ from 'lodash'

import EntityDataContainer from './EntityDataContainer'

const EntityDataStack = ({config, entity, dataGroups, collapsable, getData}) => {
    let stack = dataGroups.map(dgName =>
        <EntityDataContainer
            key={"container-for-" + dgName}
            dataGroupName={dgName}
            config={config[dgName]}
            entity={entity}
            collapsable={collapsable}
            getData={getData}
        />)
    return <div className="entity-data-stack">{stack}</div>
}
export default EntityDataStack;

