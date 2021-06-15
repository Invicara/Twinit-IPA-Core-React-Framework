import React from "react";
import _ from "lodash";
import {IafSession, IafDataSource} from "@invicara/platform-api";

//const sisenseBaseUrl = endPointConfig.sisenseBaseUrl;

class SisenseLoginPage extends React.Component {
    componentDidMount() {
        //IafSession.setConfig(endPointConfig);
        //this.createSisenseToken();
    }

    async createSisenseToken() {
        const allOrchestrators = await IafDataSource.getOrchestrators();
        const sisenseSSOOrch = _.find(allOrchestrators._list, {_userType: 'Sisense_SSO_JWT_Generator'});

        if(!sisenseSSOOrch) {
            console.error("Sisense SSO Orchestrator is not added in datasources for this project.");
            return;
        }

        const orchId = sisenseSSOOrch.id;
        const params = {
            "orchestratorId": orchId,
            "_actualparams": [
                {
                    "sequence_type_id": _.get(sisenseSSOOrch, "orchsteps.0._compid"),
                    "params": {
                        "userGroupId": this.getUserGroup(),
                        "projectNamespace":  this.getProject()
                    }
                }
            ]
        };

        const orchResult = await IafDataSource.runOrchestrator(orchId, params);
        const encodedToken = _.get(orchResult, '_result.jwt');

        let redirect_url = this.getSisenseBaseUrl() + "/jwt?jwt=" + encodedToken;

        let url = _.get(this, "props.location.href", "");

        const urlParams = new URLSearchParams(url);

        if(urlParams.has('return_to')) {
            redirect_url += "&return_to=" + urlParams.get('return_to');
        }

        return redirect_url
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
        sessionStorage.getItem('sisenseBaseUrl')
    }

    render() {
        return this.createSisenseToken();
    }

}

export default SisenseLoginPage;

