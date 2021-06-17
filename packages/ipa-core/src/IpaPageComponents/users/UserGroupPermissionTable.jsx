
import React, { useState, useEffect } from "react";

import _ from 'lodash'
import clsx from 'clsx'
import Switch from '@material-ui/core/Switch';
import { withStyles } from "@material-ui/styles";
import Select from 'react-select'

import { IafItemSvc, IafPermission } from '@invicara/platform-api'

import { RoundCheckbox } from "../../IpaControls/Checkboxes";

import './UserGroupPermissionTable.scss'

export const NamedUserItemsClassFriendlyNames = {
    NamedUserCollection: "User Collection",
    NamedFileCollection: "File Collection",
    NamedCompositeItem: "Composite Item",
    Script: "Script File",
    UserConfig: "UserConfig"
}


export const UserGroupPermissionTable = ({usergroup}) => {

    const [allUserItems, setAllUserItems] = useState([])
    const [tableData, setTableData] = useState([])
    const [filterOptions, setFilterOptions] = useState([])
    const [filterValue, setFilterValue] = useState({value: "All", label: "All"})
    const [filteredTableData, setFilteredTableData] = useState([])
    const [accessAll, setAccessAll] = useState(false)
    const [actions, setActions] = useState([])

    const AccentSwitch = withStyles({
        switchBase: {
          color: 'var(--app-accent-color) !important',
          "&$checked": {
            color: 'var(--app-accent-color) !important'
          },
          "&$checked + $track": {
            backgroundColor: 'var(--app-accent-color) !important'
          }
        },
        checked: {},
        track: {}
      })(Switch);

      useEffect(() => {
        
        let actions = Object.values(IafPermission.PermConst.Action).sort()
        setActions(actions)
        
        IafItemSvc.getNamedUserItems().then((resp) => {
            let userItems = resp._list
            userItems.sort((a,b) => {
                if (a._itemClass.localeCompare(b._itemClass) > 0) return 1
                if (a._itemClass.localeCompare(b._itemClass) < 0) return -1 

                if (a._name.localeCompare(b._name) > 0) return 1
                if (a._name.localeCompare(b._name) < 0) return -1

                return 0
            })
            setAllUserItems(userItems)

            let newFilterValues = _.uniq(userItems.map(u => u._itemClass))
            let newFilterOptions = [{value: "All", label: "All"}]
            newFilterValues.forEach((o) => {
                newFilterOptions.push({
                    value: NamedUserItemsClassFriendlyNames[o] ? NamedUserItemsClassFriendlyNames[o] : o, 
                    label: NamedUserItemsClassFriendlyNames[o] ? NamedUserItemsClassFriendlyNames[o] : o
                })
            })
            setFilterOptions(newFilterOptions)

        })
    }, [])

    useEffect(() => {
        getUserItemsForProjectWithPermissions()
    }, [usergroup, allUserItems])

    const getUserItemsForProjectWithPermissions = () => {

        function createRowForTable(coll, permissions, all) {
            console.log(coll, permissions, all)
            let collWithPerms = {
                name: coll._name,
                class: NamedUserItemsClassFriendlyNames[coll._itemClass] ? NamedUserItemsClassFriendlyNames[coll._itemClass] : coll._itemClass
            }

            Object.values(IafPermission.PermConst.Action).forEach((a) => {
                collWithPerms[a] = all ? true : permissions.actions.includes(a)
            })

            return collWithPerms
        }

        const findPermissionsObjectByItemClass = (usergroupPermissions, itemClass, userTypeToFind) => {

            console.log(usergroupPermissions, itemClass, userTypeToFind)
            const itemClassMap = {
                NamedFileCollection: 'namedUserItems',
                Script: 'scripts',
                NamedUserCollection: 'namedUserColls',
                UserConfig: 'userConfigs',
                Default: 'namedUserItems'
            }

            let permissions = usergroupPermissions[itemClassMap[itemClass] ? itemClassMap[itemClass] : itemClassMap['Default']]
            return _.find(permissions, {desc: {_userType: userTypeToFind}})
        }

        let usergroupPermissions = usergroup._userAttributes.permissions
        let hasAllPermissions = usergroupPermissions.accessAll

        setAccessAll(hasAllPermissions)

        let tableRows = allUserItems.map((coll) => {
            if (hasAllPermissions)
                return createRowForTable(coll, null, true)
            else {
                let usergroupItemPerms = findPermissionsObjectByItemClass(usergroupPermissions, coll._itemClass, coll._userType)
                if (!usergroupItemPerms)
                    return createRowForTable(coll, null, true)
                else {
                    return createRowForTable(coll, usergroupItemPerms, false)
                }
            }
        })

        setTableData(tableRows)
        setFilteredTableData(tableRows)
    }

    const onFilterChange = (f) => {
        
        if (f.value === 'All')
            setFilteredTableData(tableData)
        else {
            let filteredRows = tableData.filter(r => r.class === f.value)
            setFilteredTableData(filteredRows)
        }

        setFilterValue(f)
    }


    return <div className='permissions-table'>
        <div className='ug-perm-table-ctrls'>
            <div className='access-switch'><AccentSwitch checked={accessAll} disabled={true}/> Access All</div>
            <div className='ug-perm-filter'>Filter by: 
                <div style={{minWidth: '300px'}}><Select options={filterOptions} value={filterValue} 
                    onChange={onFilterChange} />
                </div>
            </div>
        </div>
        <table className='ug-perm-table'>
            <thead>
                <tr className='ug-perm-table-header'>
                    <th>Name</th>
                    <th>Class</th>
                    {actions.map(a => <th key={'head-'+a}>{a}</th>)}
                </tr>
            </thead>
            <tbody>
                {filteredTableData.map((row, index) => {
                    return <tr key={row.name} className={clsx('ug-perm-table-row', index%2 !== 0 && 'odd-row')}>
                        <td>{row.name}</td>
                        <td>{row.class}</td>
                        {actions.map(a => <td key={row.name+a} className='perm-cell'>
                           <RoundCheckbox checked={row[a]} disabled={accessAll}/>
                        </td>)}
                    </tr>
                })}
            </tbody>
        </table>
    </div>

}