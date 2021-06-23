
import React, { useState, useEffect } from "react";

import _ from 'lodash'
import clsx from 'clsx'
import Switch from '@material-ui/core/Switch';
import { withStyles } from "@material-ui/styles";
import Select from 'react-select'

import { IafItemSvc, IafPermission, IafProj } from '@invicara/platform-api'
import ScriptHelper from "../../IpaUtils/ScriptHelper";

import { RoundCheckbox } from "../../IpaControls/Checkboxes";

import './UserGroupPermissionTable.scss'

const itemClassPermObjMap = {
    NamedFileCollection: 'namedUserColls',
    Script: 'scripts',
    NamedUserCollection: 'namedUserColls',
    UserConfig: 'userConfigs',
    Default: 'namedUserItems'
}

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

export const UserGroupPermissionTable = ({usergroup, allowManagePermissions, itemFetchScript}) => {

    const [allUserItems, setAllUserItems] = useState([])
    const [usergroupPerms, setUserGroupPerms] = useState([])
    const [tableData, setTableData] = useState([])
    const [filterOptions, setFilterOptions] = useState([])
    const [filterValue, setFilterValue] = useState({value: "All", label: "All"})
    const [filteredTableData, setFilteredTableData] = useState([])
    const [accessAll, setAccessAll] = useState(false)
    const [actions, setActions] = useState([])

      useEffect(() => {
        
        async function getActionsAndItems() {
            let actions = Object.values(IafPermission.PermConst.Action).sort()
            actions = actions.filter(a => a !== '*')
            setActions(actions)
            
            let itemList
            if (itemFetchScript) {
                itemList = await ScriptHelper.executeScript(itemFetchScript)
            } else {
                itemList = await IafItemSvc.getNamedUserItems()
            }

            let userItems = itemList._list ? itemList._list : itemList
            userItems.sort((a,b) => {
                if (a._itemClass.localeCompare(b._itemClass) > 0) return 1
                if (a._itemClass.localeCompare(b._itemClass) < 0) return -1 

                if (a._name.localeCompare(b._name) > 0) return 1
                if (a._name.localeCompare(b._name) < 0) return -1

                return 0
            })

            setAllUserItems(userItems)
        }

        getActionsAndItems()

    }, [])

    useEffect(() => {

        getFilterOptions()
       
    }, [allUserItems])

    useEffect(() => {

        async function getUserGroupPermissions() {

            let query = {
                _namespace: usergroup._userAttributes.project_workspace._namespaces,
                "_user._id": usergroup._id,
                "_user._type": IafPermission.PermConst.UserType.UserGroup,
                "_resourceDesc._irn": "itemsvc:nameduseritem:*"
            }

            IafItemSvc.getPermissions(query).then((res) => {
                setUserGroupPerms(res._list)
            })
        }

        getUserGroupPermissions()

    }, [usergroup])

    useEffect(() => {

        getUserItemsWithPermissions()
    }, [usergroupPerms, allUserItems])

    const getFilterOptions = () => {
        let newFilterValues = _.uniq(allUserItems.map(u => u._itemClass))
        let newFilterOptions = [{value: "All", label: "All"}]
        newFilterValues.forEach((o) => {
            newFilterOptions.push({
                value: o, 
                label: o
            })
        })
        setFilterOptions(newFilterOptions)
    }

    const getUserItemsWithPermissions = () => {

        function hasAllAccess() {
            return !!_.find(usergroupPerms, {_resourceDesc: {_irn: IafPermission.AllAccessIrn}})
        }

        function getPermsForItem(item) {
            console.log('---------> ', item._name)

            let topLevelNamedUserItemPerms = usergroupPerms.filter(p => p._resourceDesc._irn === 'itemsvc:nameduseritem:*' && !p._resourceDesc._criteria)
            console.log('topLevelNamedUserItemPerms', topLevelNamedUserItemPerms)

            let itemClassItemPerms = usergroupPerms.filter(p => p._resourceDesc._criteria && p._resourceDesc._criteria._itemClass === item._itemClass)
            console.log('itemClassItemPerms', itemClassItemPerms)

            let userTypeItemPerms = usergroupPerms.filter(p => p._resourceDesc._criteria && p._resourceDesc._criteria._userType === item._userType)
            console.log('userTypeItemPerms', userTypeItemPerms)

            // let topLevelActions = topLevelNamedUserItemPerms && topLevelNamedUserItemPerms._actions ? topLevelNamedUserItemPerms._actions : []
            // let itemClassActions = itemClassItemPerms && itemClassItemPerms._actions ? itemClassItemPerms._actions : []
            // let userTypeActions = userTypeItemPerms && userTypeItemPerms._actions ? userTypeItemPerms._actions : []

            let topLevelActions = _.flatten(topLevelNamedUserItemPerms.map(p => p._actions))
            let itemClassActions = _.flatten(itemClassItemPerms.map(p => p._actions))
            let userTypeActions = _.flatten(userTypeItemPerms.map(p => p._actions))

            let combinedPerms = [
               ...topLevelActions,
               ...itemClassActions,
               ...userTypeActions
            ]

            combinedPerms.sort()
            console.log('combinedPerms', combinedPerms)

            let uniquePerms = _.uniq(combinedPerms, true)
            console.log('uniquePerms', uniquePerms)

            return uniquePerms
        }

        function createRowForTable(item, permissions, all) {

            let allAction = false
            if (!all && permissions.includes(IafPermission.PermConst.Action.All))
                allAction = true

            let collWithPerms = {
                item: item
            }

            Object.values(IafPermission.PermConst.Action).forEach((a) => {
                collWithPerms[a] = all || allAction || permissions.includes(a)
            })

            return collWithPerms
        }

        const findPermissionsObjectByItemClass = (usergroupPermissions, itemClass, userTypeToFind) => {

            //first look in the specialized location for permission set
            let permissions = usergroupPermissions[itemClassPermObjMap[itemClass]]
            permissions = permissions ? permissions : []
            let perms = _.find(permissions, {desc: {_userType: userTypeToFind}})
            if (perms) return perms

            //if not found in the specialized location look in the default location
            permissions = usergroupPermissions[itemClassPermObjMap['Default']]
            permissions = permissions ? permissions : []
            return _.find(permissions, {desc: {_userType: userTypeToFind}})
        }

        const isTopLevel = (permSet) => {
            return permSet.hasOwnProperty('actions') && !permSet.hasOwnProperty('desc')
        }

        const getTopLevelPermissionsByItemClass = (usergroupPermissions, itemClass) => {

            //first look in the specialized location
            let permissions = usergroupPermissions[itemClassPermObjMap[itemClass]]
            if (permissions) {
                for (let i = 0; i < permissions.length; i++) {
                    if (isTopLevel(permissions[i])) return permissions[i]
                }
            }

            //if not found in the specialized location look in the default location
            permissions = usergroupPermissions[itemClassPermObjMap['Default']]
            if (permissions) {
                for (let i = 0; i < permissions.length; i++) {
                    if (isTopLevel(permissions[i])) return permissions[i]
                }
            }

            return null
        }

        //let usergroupPermissions = usergroup._userAttributes.permissions
        let hasAllPermissions = hasAllAccess()

        console.log(hasAllAccess())

        setAccessAll(hasAllPermissions)

        let tableRows = allUserItems.map((item) => {
            if (hasAllPermissions)
                return createRowForTable(item, null, true)
            else {
                let itemPermissions = getPermsForItem(item)
                return createRowForTable(item, itemPermissions, false)
            }
        })

        // let tableRows = allUserItems.map((coll) => {
        //     if (hasAllPermissions)
        //         return createRowForTable(coll, null, null, true)
        //     else {
        //         let usergroupItemPerms = findPermissionsObjectByItemClass(usergroupPermissions, coll._itemClass, coll._userType)
        //         let topLevelPerms = getTopLevelPermissionsByItemClass(usergroupPermissions, coll._itemClass)
        //         if (!usergroupItemPerms && !topLevelPerms)
        //             return createRowForTable(coll, null, null, false)
        //         else {
        //             return createRowForTable(coll, usergroupItemPerms, topLevelPerms, false)
        //         }
        //     }
        // })

        setTableData(tableRows)
        setFilteredTableData(tableRows)
    }

    const onFilterChange = (f) => {
        
        if (f.value === 'All')
            setFilteredTableData(tableData)
        else {
            let filteredRows = tableData.filter(r => r.item._itemClass === f.value)
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
                    return <tr key={index} className={clsx('ug-perm-table-row', index%2 !== 0 && 'odd-row')}>
                        <td>
                            <div className='ug-perm-table-row-itemname'>{row.item._name}</div>
                            <div className='ug-perm-table-row-itemdesc'>{row.item._description}</div>
                        </td>
                        <td>{row.item._itemClass}</td>
                        {actions.map(a => <td key={row.name+a} className='perm-cell'>
                           {(!accessAll && allowManagePermissions) && <RoundCheckbox checked={row[a]} />}
                           {(accessAll || !allowManagePermissions) && <i className={clsx(row[a] && 'fas fa-check-circle', !row[a] && 'far fa-circle')}></i>}
                        </td>)}
                    </tr>
                })}
            </tbody>
        </table>
    </div>

}