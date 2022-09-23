import React, { useState, useEffect } from 'react'
import GenericModal from '../../IpaDialogs/GenericModal'
import ActionButton from "../../IpaControls/ActionButton"
import './ReorderColumnsModal.scss'
import * as modal from '../../redux/slices/modal'
import { useStore } from "react-redux"
import _ from 'lodash'

const ReorderColumnsModal = (props) => {
    const [columns, setColumns] = useState(props.columns.map(col => { return { ...col, selected: false } }))
    const reduxStore = useStore();
    const CloseModal = () => {
        reduxStore.dispatch(modal.actions.setModal({
            open: false
        }))
    }

    let draggedItem
    const onDragStart = (e, index) => {
        draggedItem = columns[index];
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.parentNode);
        e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
    }
    const onDragOver = (index) => {
        const draggedOverItem = columns[index]
        // if the item is dragged over itself, ignore
        if (draggedItem === draggedOverItem || draggedItem === (null || undefined)) {
            return; 0
        }
        // filter out the currently dragged item
        let items = columns.filter((item) => item !== draggedItem)   
        // add the dragged item after the dragged over item
        items.splice(index, 0, draggedItem)
        setColumns(items)
    }
    const onDragEnd = () => {
        draggedItem = null
    }
    const onSelectColumn = (index) => {
        let selectedItem = columns[index]
        selectedItem.selected = !selectedItem.selected
        let items = columns.filter((item) => item !== columns[index] || item === null)
        items.splice(index, 0, selectedItem)
        setColumns(items)
    }
    const onReorderButtonClick = () => {
        let items = columns.map(column => {
            if (column.selected) {
                column.active = !column.active
                column.selected = !column.selected
            }
            return column
        })
        setColumns(items)
    }
    const ApplyChanges = () => {
        let UserConfigColumns = JSON.stringify(columns)
        localStorage.setItem('DocumentViewerUserConfigColumns', UserConfigColumns)
        props.onColumnsChange(columns)
        CloseModal()
    }
    useEffect(()=>{
        let UserConfigColumnsText = localStorage.getItem('DocumentViewerUserConfigColumns') 
        let UserConfigColumns = JSON.parse(UserConfigColumnsText)
        if(UserConfigColumns){
            setColumns(UserConfigColumns)
        }
    },[])

    return (
        <GenericModal
            title="Change Columns"
            modalBody={<div className='reorder-columns-modal'>
                <div className='reorder-columns-columns'>
                    <div>
                        <span>Active Columns</span>
                        <ul>
                            {columns ? columns.map((doc, index) => {
                                if(_.includes(props.lockedColumns, doc.name)) return
                                if (doc != undefined)
                                    if (doc.active)
                                        return <li key={doc.name} onDragOver={() => onDragOver(index)}>
                                            <div className={`drag ${doc.selected ? 'selected' : 'unselected'}`} draggable
                                                onClick={() => onSelectColumn(index)}
                                                onDragStart={(e) => onDragStart(e, index)}
                                                onDragEnd={() => onDragEnd()}
                                            >{doc.name}</div></li>
                            }) : null}
                        </ul>
                    </div>
                    <ActionButton disabled={false}
                        title={"Reorder"}
                        icon={'fas fa-arrows-alt-h'}
                        onClick={() => { onReorderButtonClick() }} />
                    <div>
                        <span>Inactive Columns</span>
                        <ul>
                            {columns ? columns.map((doc, index) => {
                                if (doc != undefined)
                                    if (!doc.active)
                                        return <li key={doc.name}>
                                            <div className={`${doc.selected ? 'selected' : 'unselected'}`}
                                                onClick={() => onSelectColumn(index)}>{doc.name}</div></li>
                            }) : null}</ul>
                    </div>
                </div>
                <div className='reorder-columns-buttons'>
                    <button onClick={() => CloseModal()} className="cancel">Cancel</button>
                    <button onClick={() => ApplyChanges()} className="load">Apply Changes</button>
                </div>
            </div>}
        />
    )
}

export default ReorderColumnsModal