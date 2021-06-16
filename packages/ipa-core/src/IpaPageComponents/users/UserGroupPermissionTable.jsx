
import React, { useState, useEffect } from "react";

import _ from 'lodash'
import clsx from 'clsx'
import Switch from '@material-ui/core/Switch';
import { withStyles } from "@material-ui/styles";

import { IafItemSvc, IafPermission } from '@invicara/platform-api'

import { RoundCheckbox } from "../../IpaControls/Checkboxes";

import './UserGroupPermissionTable.scss'

export const UserGroupPermissionTable = ({usergroup}) => {

    const [allCollections, setAllCollections] = useState([])
    const [tableData, setTableData] = useState([])
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

    const getCollectionsForProjectWithPermissions = () => {

        function createCollForTable(coll, permissions, all) {

            let collWithPerms = {
                name: coll._name
            }

            Object.values(IafPermission.PermConst.Action).forEach((a) => {
                if (a !== '*') {
                    collWithPerms[a] = all ? true : permissions.actions.includes(a)
                }
            })

            return collWithPerms
        }

        let usergroupPermissions = usergroup._userAttributes.permissions
        let hasAllPermissions = usergroupPermissions.accessAll
        if (!hasAllPermissions) usergroupPermissions = usergroupPermissions.namedUserColls
        if (!usergroupPermissions) hasAllPermissions = true

        setAccessAll(hasAllPermissions)

        let tableCollections = allCollections.map((coll) => {
            if (hasAllPermissions)
                return createCollForTable(coll, null, true)
            else {
                let usergroupCollPerms = _.find(usergroupPermissions, {desc: {_userType: coll._userType}})
                if (!usergroupCollPerms)
                    return createCollForTable(coll, null, true)
                else {
                    return createCollForTable(coll, usergroupCollPerms, false)
                }
            }
        })

        setTableData(tableCollections)
    }

    useEffect(() => {
        
        let actions = Object.values(IafPermission.PermConst.Action).sort()
        actions = actions.filter(a => a !== '*')
        setActions(actions)
        
        IafItemSvc.getNamedUserItems({query: {_itemClass: IafItemSvc.ItemClass.UserCollection}}).then((resp) => {
            let collections = resp._list
            collections.sort((a,b) => {
                return a._name.localeCompare(b._name)
            })
            setAllCollections(collections)
        })
    }, [])

    useEffect(() => {
        getCollectionsForProjectWithPermissions()
    }, [usergroup, allCollections])


    return <div className='permissions-table'>
        <AccentSwitch checked={accessAll} disabled={true}/> Access All
        <table className='ug-perm-table'>
            <thead>
                <tr className='ug-perm-table-header'>
                    <th>Collection Name</th>
                    {actions.map(a => <th key={'head-'+a}>{a}</th>)}
                </tr>
            </thead>
            <tbody>
                {tableData.map((row, index) => {
                    return <tr key={row._id} className={clsx('ug-perm-table-row', index%2 !== 0 && 'odd-row')}>
                        <td>{row.name}</td> 
                        {actions.map(a => <td key={row.name+a} className='perm-cell'>
                           <RoundCheckbox checked={row[a]} disabled={accessAll}/>
                        </td>)}
                    </tr>
                })}
            </tbody>
        </table>
    </div>

}