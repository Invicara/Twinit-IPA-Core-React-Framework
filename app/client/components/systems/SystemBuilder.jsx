import React, {useEffect, useState} from "react";
import {compose} from "redux";
import {withAppContext} from "../../AppProvider";
import withGenericPage from "../GenericPage";
import {connect} from "react-redux";
import {StackableDrawer} from "../controls/StackableDrawer";
import {ScriptedOptionsSelect} from "../controls/ScriptedOptionsSelect";
import {
    changeLevel,
    changeOrder,
    clearEntities,
    getAppliedFilters,
    getCheckedEntities,
    getCurrentEntityType,
    getEntities,
    getFilteredEntities,
    getGroups,
    getHiddenEntities,
    getIsolatedEntities,
    getSelectedEntities,
    getSelectedEntitiesIds,
    getSelectedSystemCategories,
    getSystemElements,
    getSystemName,
    getSystemStatus,
    removeElement,
    selectEntitiesFromModels,
    setChecked,
    setCurrentEntityType,
    setEntities,
    setFilters,
    setGroups,
    setHiddenEntities,
    setSelectedEntities,
    setSelectedSystemCategories,
    setSystemName,
    setSystemStatus,
    updateChecked
} from "../../redux/slices/system-builder";
import {EnhancedIafViewer} from "../../components/navigator/EnhancedIafViewer";
import {EntityGroupAndFilterTree} from "./EntityGroupAndFilterTree";
import _ from "lodash";
import {EntityDetailTable} from "./EntityDetailTable";
import {EnhancedPickListSelect} from "../controls/EnhancedPickListSelect";
import Select from 'react-select';
import SimpleTable from "../controls/SimpleTable";
import {SystemsOrderableTree} from "./SystemsOrderableTree";

const SystemBuilder = ({
                           onLoadComplete, handler, entities, filters, groups, setEntities, setFilters, setGroups, selectedItems, filteredEntities,
                           setCurrentEntityType, selectedEntities, isolatedEntities, selectEntitiesFromModels, selectedEntitiesIds, clearEntities,
                           setSelectedEntities, hiddenEntities, setHiddenEntities, checkedEntities, setChecked, updateChecked, currentEntityType,
                           systemElements, changeLevel, changeOrder, removeElement, selectedSystemCategories,
                           setSelectedSystemCategories, setSystemName, systemName, systemStatus, setSystemStatus
                       }) => {

    const [collapseSystemInfo, setCollapseSystemInfo] = useState(systemName && systemStatus && selectedSystemCategories);

    useEffect(() => {
        onLoadComplete();
    }, []);

    const onEntitySelectChange = (entitiesResult) => {
        clearEntities();
        const entityConfig = handler.config.allowEntities.find(e => entitiesResult.selected === e.type)
        setCurrentEntityType(entityConfig ? {
            plural: entityConfig.plural,
            singular: entityConfig.singular,
            entityFromModelScript: entityConfig.entityFromModelScript,
            spaceMode: entityConfig.spaceMode,
            script: entityConfig.script
        } : null)
        setEntities({entities: entitiesResult.scriptResult, shouldIsolate: true});
    }
    const handleCheck = (checkedInstance) => updateChecked({id: checkedInstance._id, checked: !checkedInstance.checked})

    const allChecked = checkedEntities.length === entities.length;

    const handleAllCheck = () => setChecked(allChecked ? [] : entities.map(e => e._id));

    const systemInfoColumns = [
        {name: 'System Name', accessor: 'systemName'},
        {name: 'System Category', accessor: 'systemCategory'},
        {name: 'System Type', accessor: 'systemType'},
        {name: 'System Status', accessor: 'systemStatus'}]

    return <div className='systems-builder-view'>
        <StackableDrawer level={1} iconKey={'fa-search'}>
            <div className='fetch-container'>
                <ScriptedOptionsSelect
                    selectedOption={currentEntityType ? {
                        value: currentEntityType.script,
                        label: currentEntityType.plural,
                        key: currentEntityType.plural
                    } : undefined}
                    onChange={onEntitySelectChange}
                    selectOptions={handler.config.allowEntities.map((e) => {
                        return {display: e.type, script: e.script}
                    })}
                    placeholder='Select an Entity'
                    label='Search for:'
                />
                <EntityGroupAndFilterTree
                    entities={entities}
                    groups={groups}
                    filters={filters}
                    onFilterChange={setFilters}
                    onGroupChange={setGroups}
                    selectedEntities={selectedEntities}
                    onEntitiesSelected={setSelectedEntities}
                    hiddenEntities={hiddenEntities}
                    onEntitiesHidden={setHiddenEntities}
                />
            </div>
        </StackableDrawer>
        <div className='content'>
            <div className='middle-content'>
                <div className='systems-viewer'>
                    <EnhancedIafViewer model={selectedItems.selectedModel}
                                       viewerResizeCanvas={true}
                                       isolatedElementIds={
                                           isolatedEntities.map(e => e.modelViewerIds[0])
                                       }
                                       highlightedElementIds={
                                           selectedEntities.map(e => e.modelViewerIds[0])
                                       }
                                       onSelect={
                                           modelEntities => selectEntitiesFromModels(modelEntities)
                                       }
                                       hiddenElementIds={
                                           hiddenEntities.map(e => e.modelViewerIds[0])
                                       }
                    />
                </div>
                <EntityDetailTable
                    entities={selectedEntities.map(e => ({...e, checked: checkedEntities.some(c => c._id === e._id)}))}
                    onCheck={handleCheck} onAllCheck={handleAllCheck} allChecked={allChecked}
                    columns={_.get(handler.config.allowEntities.find(e => e.type === currentEntityType), 'tableConfig')}
                />
            </div>
            <div className='right-content'>
                <div className='system-info-table'>
                    <SimpleTable
                        className={"system-information-grid"}
                        columns={systemInfoColumns}
                        showHeader={false}
                        objects={{
                            systemName: systemName,
                            systemCategory: selectedSystemCategories ? selectedSystemCategories['System Category'][0]?.display : '',
                            systemType: selectedSystemCategories ? selectedSystemCategories['System Type'][0]?.display : '',
                            systemStatus: systemStatus
                        }}
                    />

                    {handler.config.canEditSystems &&
                    <div className="dbm-tooltip">
                        <i className={"fas " + (collapseSystemInfo ? 'fa-edit' : 'fa-chevron-up')} onClick={() => {
                            setCollapseSystemInfo(!collapseSystemInfo)
                        }}/>
                        <span className="dbm-tooltiptext">{collapseSystemInfo ? 'Edit' : 'Collapse'}</span>
                    </div>}
                </div>
                {handler.config.canEditSystems && <div className={'editable-system-information-controls' + (collapseSystemInfo ? ' collapsed' : '')}>
                    <div className='system-name'>
                        <span className='system-name-label'>System Name</span>
                        <input type="text" value={systemName} onChange={e => setSystemName(e.target.value)}
                               placeholder='Select a System Name' className='system-name-input'/>
                    </div>
                    <EnhancedPickListSelect
                        currentValue={selectedSystemCategories}
                        onChange={setSelectedSystemCategories}
                        disabled={false}
                        selects={handler.config.picklistSelectsConfig.selects}
                        pickListScript={handler.config.picklistSelectsConfig.pickListScript}
                        initialPickListType={handler.config.picklistSelectsConfig.initialPickListType}
                        canCreateItems={handler.config.picklistSelectsConfig.canCreateItems}
                        updateScript={handler.config.picklistSelectsConfig.createPickListScript}
                    />
                    <div className='scripted-selects-control'>
                        <span className="select-title">System Status</span>
                        <Select
                            isMulti={false}
                            value={systemStatus ? {value: systemStatus, label: systemStatus, key: systemStatus} : null}
                            onChange={selected => setSystemStatus(selected.value)}
                            options={handler.config.systemStatus.map(status => ({
                                value: status,
                                label: status,
                                key: status
                            }))}
                            className="select-element"
                            closeMenuOnSelect={true}
                            isClearable={false}
                            placeholder={`Select a Status`}
                            isDisabled={false}
                            menuPlacement="auto"
                            menuPosition="fixed"
                        />
                    </div>
                </div>}
                <SystemsOrderableTree systemElements={systemElements}
                                      onLevelChange={(systemElement, newParentId, newOrder) => changeLevel({systemElement,newParentId, newOrder})}
                                      onOrderChange={(systemElement, newOrder) => changeOrder({systemElement,newOrder})}
                                      onElementRemoved={removeElement}
                />
            </div>
        </div>
    </div>
}

const mapStateToProps = state => ({
    entities: getEntities(state),
    groups: getGroups(state),
    filters: getAppliedFilters(state),
    filteredEntities: getFilteredEntities(state),
    isolatedEntities: getIsolatedEntities(state),
    selectedEntities: getSelectedEntities(state),
    selectedEntitiesIds: getSelectedEntitiesIds(state),
    hiddenEntities: getHiddenEntities(state),
    checkedEntities: getCheckedEntities(state),
    currentEntityType: getCurrentEntityType(state),
    systemElements: getSystemElements(state),
    selectedSystemCategories: getSelectedSystemCategories(state),
    systemName: getSystemName(state),
    systemStatus: getSystemStatus(state),
});


const mapDispatchToProps = {
    setEntities,
    setGroups,
    setFilters,
    setCurrentEntityType,
    clearEntities,
    selectEntitiesFromModels,
    setSelectedEntities,
    setHiddenEntities,
    setChecked,
    updateChecked,
    setSelectedSystemCategories,
    setSystemName,
    setSystemStatus,
    changeLevel,
    changeOrder,
    removeElement
}

export default compose(
    withAppContext,
    withGenericPage,
    connect(mapStateToProps, mapDispatchToProps),
)(SystemBuilder)