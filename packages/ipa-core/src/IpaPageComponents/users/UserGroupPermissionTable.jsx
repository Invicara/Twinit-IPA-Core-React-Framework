
import React, { useState, useEffect } from "react";

import _ from 'lodash'
import clsx from 'clsx'
import Switch from '@material-ui/core/Switch';
import { withStyles } from "@material-ui/styles";
import Select from 'react-select'

import { IafItemSvc, IafPermission, IafFileSvc } from '@invicara/platform-api'
import ScriptHelper from "../../IpaUtils/ScriptHelper";

import { RoundCheckbox } from "../../IpaControls/Checkboxes";
import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber"

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

    //top level state
    const [accessAll, setAccessAll] = useState(false)
    const [actions, setActions] = useState([])
    

    //itemservice state
    const [allUserItems, setAllUserItems] = useState([])
    const [usergroupItemPerms, setUserGroupItemPerms] = useState([])
    const [itemTableData, setItemTableData] = useState([])
    const [itemFilterOptions, setItemFilterOptions] = useState([])
    const [itemFilterValue, setItemFilterValue] = useState({value: "All", label: "All"})
    const [itemFilteredTableData, setItemFilteredTableData] = useState([])
    const [loadingItemPerms, setLoadingItemPerms] = useState(true)

    //fileservice state
    const [filePerms, setFilePerms] = useState([])
    const [fileTableData, setFileTableData] = useState([])
    const [loadingFilePerms, setLoadingFilePerms] = useState(true)
    

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

        async function getUserGroupPermissions() {

            let query = {
                _namespace: usergroup._userAttributes.project_workspace._namespaces,
                "_user._id": usergroup._id,
                "_user._type": IafPermission.PermConst.UserType.UserGroup,
                "_resourceDesc._irn": IafPermission.NamedUserItemIrnAll
            }

            IafItemSvc.getPermissions(query).then((res) => {
                setUserGroupItemPerms(res._list)
            })

            let filequery = {
                _namespace: usergroup._userAttributes.project_workspace._namespaces,
                "_user._id": usergroup._id,
                "_user._type": IafPermission.PermConst.UserType.UserGroup,
                "_resourceDesc._irn": IafPermission.FileIrnAll
            }

            IafFileSvc.getPermissions(filequery).then((fres) => {
                setFilePerms(fres._list)
            })

        }

        resetPerms()
        getUserGroupPermissions()

    }, [usergroup])

    useEffect(() => {

        getItemFilterOptions()
       
    }, [allUserItems])

    useEffect(() => {

        getUserItemsWithPermissions()
    }, [usergroupItemPerms, allUserItems, accessAll])

    useEffect(() => {

        getFilesWithPermissions()

    }, [filePerms, accessAll])

    const resetPerms = () => {
        setLoadingItemPerms(true)
        setLoadingFilePerms(true)
        setAccessAll(false)
        setUserGroupItemPerms([])
        setFilePerms([])
        setItemTableData([])
        setItemFilteredTableData([])
        setFileTableData([])
    }

    const getItemFilterOptions = () => {
        let newFilterValues = _.uniq(allUserItems.map(u => u._itemClass))
        let newFilterOptions = [{value: "All", label: "All"}]
        newFilterValues.forEach((o) => {
            newFilterOptions.push({
                value: o, 
                label: o
            })
        })
        setItemFilterOptions(newFilterOptions)
    }

    const createRowForTable = (item, permissions, all) => {

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

    const hasAllAccess = (where) => {
        let hasAccessAll = accessAll || !!_.find(where, {_resourceDesc: {_irn: IafPermission.AllAccessIrn}})
        if (hasAccessAll !== accessAll) setAccessAll(hasAccessAll)
        return hasAccessAll
    }

    const getUserItemsWithPermissions = () => {

        function getPermsForItem(item) {

            let topLevelNamedUserItemPerms = usergroupItemPerms.filter(p => p._resourceDesc._irn === 'itemsvc:nameduseritem:*' && !p._resourceDesc._criteria)

            let itemClassItemPerms = usergroupItemPerms.filter(p => p._resourceDesc._criteria && p._resourceDesc._criteria._itemClass === item._itemClass)

            let userTypeItemPerms = usergroupItemPerms.filter(p => p._resourceDesc._criteria && p._resourceDesc._criteria._userType === item._userType)

            let topLevelActions = _.flatten(topLevelNamedUserItemPerms.map(p => p._actions))
            let itemClassActions = _.flatten(itemClassItemPerms.map(p => p._actions))
            let userTypeActions = _.flatten(userTypeItemPerms.map(p => p._actions))

            let combinedPerms = [
               ...topLevelActions,
               ...itemClassActions,
               ...userTypeActions
            ]

            combinedPerms.sort()

            let uniquePerms = _.uniq(combinedPerms, true)

            return uniquePerms
        }

        let hasAllPermissions = hasAllAccess(usergroupItemPerms)

        let tableRows = allUserItems.map((item) => {
            if (hasAllPermissions)
                return createRowForTable(item, null, true)
            else {
                let itemPermissions = getPermsForItem(item)
                return createRowForTable(item, itemPermissions, false)
            }
        })

        setItemTableData(tableRows)
        setItemFilteredTableData(tableRows)
        setLoadingItemPerms(false)
    }

    const onFilterChange = (f) => {
        
        if (f.value === 'All')
            setItemFilteredTableData(itemTableData)
        else {
            let filteredRows = itemTableData.filter(r => r.item._itemClass === f.value)
            setItemFilteredTableData(filteredRows)
        }

        setItemFilterValue(f)
    }

    const getFilesWithPermissions = () => {
        
        let hasAllPermissions = hasAllAccess(filePerms)

        let item = {
            _name: "All Files",
            _descriptions: "All files in file service"
        }

        let permissionsObj = _.find(filePerms, {_resourceDesc: {_irn: IafPermission.FileIrnAll}})

        let permissions = permissionsObj ? permissionsObj._actions : []

        let fileTableRows = createRowForTable(item, permissions, hasAllPermissions)

        setFileTableData([fileTableRows])
        setLoadingFilePerms(false)
    }


    return <div className='permissions-table'>
        <div className='access-switch'><AccentSwitch checked={accessAll} disabled={true}/> Access All</div>
        <div className='ug-perm-table-ctrls'>
            <h3 className='service-name'>File Service</h3>
        </div>
        {loadingFilePerms && <SimpleTextThrobber throbberText="Loading File Permissions"/>}
        {!loadingFilePerms && <table className='ug-perm-table'>
            <thead>
                <tr className='ug-perm-table-header'>
                    <th></th>
                    {actions.map(a => <th key={'file-head-'+a}>{a}</th>)}
                </tr>
            </thead>
            <tbody>
                {fileTableData.map((row, index) => {
                        return <tr key={index} className={clsx('ug-perm-table-row', index%2 !== 0 && 'odd-row')}>
                            <td>
                                <div className='ug-perm-table-row-itemname'>{row.item._name}</div>
                                <div className='ug-perm-table-row-itemdesc'>{row.item._description}</div>
                            </td>
                            {actions.map(a => <td key={row.name+a} className='perm-cell'>
                                {(!accessAll && allowManagePermissions) && <RoundCheckbox checked={row[a]} />}
                                {(accessAll || !allowManagePermissions) && <i className={clsx(row[a] && 'fas fa-check-circle', !row[a] && 'far fa-circle')}></i>}
                            </td>)}
                        </tr>
                    })}
            </tbody>
        </table>}
        <div className='ug-perm-table-ctrls'>
            <h3 className='service-name'>Item Service</h3>
            <div className='ug-perm-filter'>Filter by: 
                <div style={{minWidth: '300px'}}><Select options={itemFilterOptions} value={itemFilterValue} 
                    onChange={onFilterChange} />
                </div>
            </div>
        </div>
        {loadingItemPerms && <SimpleTextThrobber throbberText="Loading Item Permissions"/>}
        {!loadingItemPerms && <table className='ug-perm-table'>
            <thead>
                <tr className='ug-perm-table-header'>
                    <th>Name</th>
                    <th>Class</th>
                    {actions.map(a => <th key={'head-'+a}>{a}</th>)}
                </tr>
            </thead>
            <tbody>
                {itemFilteredTableData.map((row, index) => {
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
        </table>}
    </div>

}