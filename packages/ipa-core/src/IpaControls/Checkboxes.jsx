import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import CheckIcon from "@material-ui/core/SvgIcon/SvgIcon";
import withStyles from "@material-ui/core/styles/withStyles";
import produce from "immer";
import React, {useEffect, useState} from "react";
import {usePrevious} from "../IpaUtils/usePrevious";
import _ from "lodash";
import {CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBoxRounded} from "@material-ui/icons";
import CheckedCircle from '@material-ui/icons/CheckCircle';
import UncheckedCircle from '@material-ui/icons/RadioButtonUnchecked';

const iconStyle = {fontSize: 18};

export const TickCheckbox = ({...props}) => <Checkbox
    icon={<CheckIcon style={{...iconStyle, color: '#666666'}}/>}
    checkedIcon={<CheckIcon style={{...iconStyle, color: 'var(--app-accent-color)'}}/>}
    {...props}
/>;

export const RoundCheckbox = ({...props}) => <Checkbox
    icon={<UncheckedCircle style={{...iconStyle, color: '#666666'}}/>}
    checkedIcon={<CheckedCircle style={{...iconStyle, color: 'var(--app-accent-color)'}}/>}
    {...props}
/>;

export const PinkCheckbox = withStyles({
    root: {
        color: "#B8B8B8",
        '&$checked': {
            color: 'var(--app-accent-color)'
        },
    },
    indeterminate: {
        color: 'var(--app-accent-color)'
    },
    checked: {},
})((props) => <Checkbox
    icon={<CheckBoxOutlineBlank/>}
    indeterminateIcon={<IndeterminateCheckBoxRounded/>}
    checkedIcon={<CheckBox/>}
    
    {...produce(props, props => {delete props.classes.icon})} />);

export const SquareInSquareCheckbox = withStyles({
    icon: {

        width: 18,
        height: 18,
        margin: 3,
        border: '2px solid rgb(87,87,87)',
        backgroundColor: '#f5f8fa',
    },
    checkedIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 18,
        height: 18,
        margin: 3,
        border: '2px solid var(--app-accent-color)',
        backgroundColor: '#f5f8fa',
    },
    innerCheckedIcon: {
        width: 8,
        height: 8,
        backgroundColor: 'var(--app-accent-color)',
    }
})((props) => <Checkbox
    icon={<span className={props.classes.icon}/>}
    checkedIcon={<span className={props.classes.checkedIcon}><div className={props.classes.innerCheckedIcon}/></span>}
    {...produce(props, props => {delete props.classes.icon; delete props.classes.checkedIcon; delete props.classes.innerCheckedIcon})} />);

export const useChecked = (inputItems, checkCallback, allCheckCallback) => {
    const [items, setItems] = useState([]);
    const previousItems = usePrevious(inputItems);

    useEffect(() => {//if items get added or removed, update. This behavior is simplified for current use cases
        if (inputItems.length !== _.get(previousItems, 'length', 0)) 
        setItems(inputItems.map(instance => ({
            ...instance,
            checked: instance.checked
        })))
    }, [inputItems]);

    const handleCheck = (checkedInstance) => {
        checkCallback?.(checkedInstance, !checkedInstance.checked);
        setItems(instances =>
        instances.map(instance => instance === checkedInstance ? {
            ...checkedInstance,
            checked: !checkedInstance.checked
        } : instance))
    };

    const allChecked = items.every(i => i.checked);

    const handleAllCheck = () => {
        allCheckCallback?.(!allChecked);
        setItems(instances => instances.map(instance => ({
            ...instance,
            checked: !allChecked
        })));
    }

    const resetChecked = (newInstances) => {
        setItems(oldInstances => (newInstances || oldInstances).map(instance => ({
                ...instance,
                checked: false
            }))
        );
    }

    return {allChecked, handleCheck, handleAllCheck, items, resetChecked}

}