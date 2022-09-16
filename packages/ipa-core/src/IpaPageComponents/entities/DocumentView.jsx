/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2020] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

 import React from "react"
 import _ from 'lodash'

 import {connect} from "react-redux";
 import {
     getAllCurrentEntities,
     getAppliedFilters,
     getFetchingCurrent,
     getFilteredEntities
 } from "../../redux/slices/entities";
 import {compose} from "@reduxjs/toolkit";
import IafDocViewer from '@invicara/iaf-doc-viewer';
import withEntitySearch from "./WithEntitySearch";
 
//  import './DocumentViewer.scss'
 
 
 const DocumentView = (props) => {

    if (props.isPageLoading) return null;

    const docIds = props.docIds || props.queryParams.docIds || [];

    console.log("DocumentViewer props", props)

    let pageContent;
    if (props.fetching) {
        pageContent = <span className="info-message">Retrieving data</span>
    } else if (!_.isEmpty(docIds)) {
        pageContent = <IafDocViewer
            docIds={docIds}
        />
    } else {
        pageContent = <span className="info-message">No data</span>
    }
    return (
        <div className='document-viewer'>
            <div className='content'>{pageContent}</div>
        </div>
    )
 }
 
 export default DocumentView
 