import React from "react";
import _ from "lodash";
import {IafSession, IafDataSource} from "@invicara/platform-api";

class SisenseLoginPage extends React.Component {
    componentDidMount() {
        this.createSisenseToken();
    }

    async createSisenseToken() {
 
        IafSession.setConfig(endPointConfig);
        const allOrchestrators = await IafDataSource.getOrchestrators();
        const sisenseSSOOrch = _.find(allOrchestrators._list, {_userType: 'Sisense_SSO_JWT_Generator'});

        if(!sisenseSSOOrch) {
            console.error("Sisense SSO Orchestrator is not added in datasources for this project.");
            return;
        }

        const orchId = sisenseSSOOrch.id;
        const params = {
            orchestratorId: orchId,
            _actualparams: [
                {
                    sequence_type_id: _.get(sisenseSSOOrch, "orchsteps.0._compid"),
                    params: {
                        userGroupId: this.getUserGroup(),
                        projectNamespace:  this.getProject()
                    }
                }
            ]
        };

        const orchResult = await IafDataSource.runOrchestrator(orchId, params);
        const encodedToken = _.get(orchResult, '_result.jwt');

        let redirect_url = this.getSisenseBaseUrl() + "/jwt?jwt=" + encodedToken;

        //let url = _.get(this, "props.location.href", "");
        let queryParams = null
        let urlstring = window.location.href
        let urlstringSplit = urlstring.split('?')
        console.log(urlstring, urlstringSplit)
        if (urlstringSplit.length > 1) {
            queryParams = urlstringSplit[1]
        }
       
        if(queryParams) {
            redirect_url += queryParams
        }

        console.log(redirect_url)

        //window.location.href = redirect_url;
    }

    getProject() {
        return sessionStorage && sessionStorage.project ?
            _.get(JSON.parse(sessionStorage.project), "_namespaces.0") : undefined;
    }

    getSelectedGroup(storage) {
        return storage && storage.ipadt_selectedItems ?
            _.get(JSON.parse(storage.ipadt_selectedItems), "selectedUserGroupId") : undefined;
    }

    getUserGroup() {
        const selectedGroupInSessionStorage = this.getSelectedGroup(sessionStorage);
        const selectedGroupId = selectedGroupInSessionStorage ?  selectedGroupInSessionStorage :
            this.getSelectedGroup(localStorage);
        return selectedGroupId;
    }

    getSisenseBaseUrl() {
        return sessionStorage.getItem('sisenseBaseUrl')
    }

    render() {
        return null
    }

}

export default SisenseLoginPage;

