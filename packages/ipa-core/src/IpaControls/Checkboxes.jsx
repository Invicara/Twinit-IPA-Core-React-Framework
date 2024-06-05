import Checkbox from '@mui/material/Checkbox';
import { default as CheckIcon } from '@mui/material/SvgIcon';
import {styled} from "@mui/system";
import produce from "immer";
import React, {useEffect, useState} from "react";
import {usePrevious} from "../IpaUtils/usePrevious";
import _ from "lodash";
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxRounded from '@mui/icons-material/IndeterminateCheckBoxRounded';
import CheckedCircle from '@mui/icons-material/CheckCircle';
import UncheckedCircle from '@mui/icons-material/RadioButtonUnchecked';

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

const StyledCheckBox = styled(Checkbox)(({ theme }) => ({
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
  }));

  export const PinkCheckbox = (props) => (
    <StyledCheckBox
      icon={<CheckBoxOutlineBlank />}
      indeterminateIcon={<IndeterminateCheckBoxRounded />}
      checkedIcon={<CheckBox />}
      {...props}
    />
  );
  

    const StyledSquareCheckBox = styled(Checkbox)(({ theme }) => ({
      icon: {
        width: 18,
        height: 18,
        margin: 3,
        border: "2px solid rgb(87,87,87)",
        backgroundColor: "#f5f8fa",
      },
      checkedIcon: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 18,
        height: 18,
        margin: 3,
        border: "2px solid var(--app-accent-color)",
        backgroundColor: "#f5f8fa",
      },
      innerCheckedIcon: {
        width: 8,
        height: 8,
        backgroundColor: "var(--app-accent-color)",
      },
    }));

    export const SquareInSquareCheckbox = (props) => {
      <StyledSquareCheckBox
        icon={<span className={props.classes.icon} />}
        checkedIcon={
          <span className={props.classes.checkedIcon}>
            <div className={props.classes.innerCheckedIcon} />
          </span>
        }
        {...produce(props, (props) => {
          delete props.classes.icon;
          delete props.classes.checkedIcon;
          delete props.classes.innerCheckedIcon;
        })}
      />;
    };



export const useChecked = (inputItems, checkCallback, allCheckCallback) => {
    const [items, setItems] = useState([]);
    //const previousItems = usePrevious(inputItems);

    useEffect(() => {
        setItems(previousItems => {
            function previousInstance(instance) {
                //find previous entity(._id) or file (.name)
                return previousItems.find(item=>item._id && item._id == instance._id || item.name && item.name == instance.name)
            }
            const newItems = inputItems.map(instance => {
                const previous = previousInstance(instance);
                return {...instance, checked: previous ? previous.checked : false};
            })
            return newItems;
        });
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