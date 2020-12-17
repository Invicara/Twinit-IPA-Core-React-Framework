import React, {useEffect, useState} from "react";
import SimpleSelect from "../../IpaControls/SimpleSelect"
import {PinkCheckbox} from "./EntityListView";
import LinkTwoToneIcon from '@material-ui/icons/LinkTwoTone';
import LinkOff from '@material-ui/icons/LinkOff';
import {FetchingLegend} from "../../IpaControls/FetchingLegend";
import clsx from "clsx";
import {produce} from "immer";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import _ from 'lodash';

export const SummaryPanel = ({parentEntities: baseEntities, fetching, handleCheck, checkedEntities, entityTypeOptions, removeRelated, recoverRelated}) => {
    const [collapsed, setCollapsed] = useState([])
    const [selectedEntityType, setSelectedEntityType] = useState()

    useEffect(() =>
            setCollapsed(collapsed => baseEntities.map((e, i) => collapsed[i] || false)),
        [baseEntities]
    )

    const toggle = i => setCollapsed(produce(collapsed => {
        collapsed[i] = !collapsed[i]
    }))    

    const getFilteredRelated = (entity) =>
        selectedEntityType ? entity.related.filter(r => r.entityType === selectedEntityType) : entity.related ;

    return <div className={'panel relations-modal-summary'}>
        <div className={'panel-title'}>Summary</div>
        {fetching ? <FetchingLegend legend={'Fetching relations...'}/> :
        <div>
        <SimpleSelect
            className={'entity-select'}
            placeholder={'Filter related by type'}
            options={entityTypeOptions}
            handleChange={(selected) => setSelectedEntityType(selected)}
            value={selectedEntityType}
        />
            <div className={'inner-panel'}>
        {baseEntities.map((entity, i) =>
            <div className={'parent-entity'} key={entity._id}>
                <div className={'entity-name'}>
                    <PinkCheckbox checked={_.get(checkedEntities[i], 'checked', false)}
                                  onChange={() => handleCheck(checkedEntities[i])}/>
                    {entity.entityName}
                    <div className={'toggle'}>
                        {collapsed[i] ? <ExpandMoreIcon onClick={() => toggle(i)}/> :
                            <ExpandLessIcon onClick={() => toggle(i)}/>}
                    </div>
                </div>
                <div className={clsx('entity-children', collapsed[i] && 'collapsed')}>

                    {_.isEmpty(getFilteredRelated(entity)) ?
                        <div className={'no-children'}>No children found</div> :
                        getFilteredRelated(entity).map(r => <div key={r._id}
                              className={clsx('child-container', r.new && 'new', r.removed && 'removed')}>
                            <div className={'child-text'}>
                                {r.removed ? <LinkOff className={'link-icon'}/> : <LinkTwoToneIcon className={'link-icon'}/>}
                                <span>{`${r.entityName} (${r.entityType})`}</span>
                            </div>
                            {!r.removed ?
                                <div className="delete-button" onClick={() => removeRelated({related: r, entityId: entity._id})}>
                                    <i className={'fa fa-times'} aria-hidden="true"/>
                                </div> :
                                <div className="delete-button" onClick={() => recoverRelated({related: r, entityId: entity._id})}>
                                    <i className={'fa fa-undo'} aria-hidden="true"/>
                                </div>
                            }
                        </div>)}
                </div>
            </div>
        )}
        </div></div>}
    </div>
}