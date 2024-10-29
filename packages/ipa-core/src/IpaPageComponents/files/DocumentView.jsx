import React from "react";
import _ from "lodash";
import IafDocViewer from '@dtplatform/iaf-doc-viewer';
import "./DocumentView.scss";

const DocumentView = (props) => {
  if (props.isPageLoading) return null;

  const docIds = props.docIds || props.queryParams.docIds || [];

  let pageContent;
  if (props.fetching) {
    pageContent = <span className="info-message">Retrieving data</span>;
  } else if (props.handler.config.canView !== true) {
    pageContent = (
      <span className="info-message">
        You don't have permission to view this file.
      </span>
    );
  } else if (!_.isEmpty(docIds)) {
    pageContent = <IafDocViewer
        docIds={docIds}
    />
  } else {
    pageContent = <span className="info-message">No data</span>;
  }
  return (
    <div className="document-viewer">
      <div className="content">{pageContent}</div>
    </div>
  );
};

export default DocumentView;
