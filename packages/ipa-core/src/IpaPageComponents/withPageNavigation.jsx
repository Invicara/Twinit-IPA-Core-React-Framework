import React from 'react';
import qs from 'qs';
import {connect} from "react-redux";
import { withRouter } from 'react-router';
import _ from 'lodash';
import { optionHandlers } from 'codemirror';


export const URL_LENGTH_WARNING = 80000
export function isSelectionInfoValid(selectionInfo) {
    if (selectionInfo && !selectionInfo.entityType) {
      console.error('Attempting to pass query parameters with no entity type!');
      return false;
    }
    
    return true;

}
export default function withPageNavigation(Component) {

    function WrappedComponent(props) {

        function onNavigate(destinationHandler, selectionInfo, options) {
    
            /*
             * handler: the name of a handler to navigate to
             *
             * selectionInfo:
             * {
             *    entityType: 'Asset',
             *    selectedEntities: [<array of entity ids>]
             * }
             *
             * Note: query, group and filter are handled by the GenericPage itself (this class).
             *       Call setQueryParams method from the child page.
             *       The queryParams can be overridden by providing queryParams in selectionInfo
             *
             */
        
            if (!destinationHandler || !Object.keys(props.userConfig.handlers).includes(destinationHandler)) {
              console.error('Attempting to navigate without a valid destination handler:', destinationHandler);
              return false;
            }
        
            if (!isSelectionInfoValid(selectionInfo)) {
              console.error('Attempting to navigate invalid query parameters!');
              return false;
            }
        

            let query = {}
    
            //override the pages queryParams if the selectionInfo also provides queryParams
            if (selectionInfo.queryParams) {
                query = _.cloneDeep(selectionInfo.queryParams)
            }

            if(selectionInfo) {
                query.entityType = selectionInfo.entityType
            }
            //if its not an array leave as is as then it represents settings for a fetch control
            if (query.query && query.query.value && !query.query.id && query.query.id !== 0)
                query.query.value = Array.isArray(query.query.value) ? query.query.value.join(',') : query.query.value
            if (selectionInfo && selectionInfo.selectedEntities && selectionInfo.selectedEntities.length>0) {
                query.selectedEntities = selectionInfo.selectedEntities.join(',');
                query.entityType = selectionInfo.entityType
                query.script = selectionInfo.script
            } else if (query.selectedEntities && Array.isArray(query.selectedEntities) && query.selectedEntities.length > 0) {
                query.selectedEntities = query.selectedEntities.join(',');
            }
            if (query.groups && query.groups.length) {
                query.groups = query.groups.join(',')
            }

            const newPath = props.userConfig.handlers[destinationHandler].path + '?' + qs.stringify(query);
        
            if (newPath.length > URL_LENGTH_WARNING)
              console.warn('url length is very large and navigation may not work!');
        

            if(options.newTab === true) {
                window.open(`${endPointConfig.baseRoot}/#${newPath}`, '_blank')?.focus()
            } else {
                props.history.push(newPath);
            }

        }

        return <Component onNavigate={onNavigate} {...props}/>
    }

    const mapStateToProps = state => ({
        userConfig: state.userConfig
    })
    const mapDispatchToProps = {
    }

    return withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedComponent));
}

