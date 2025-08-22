import React, {useState, useEffect} from "react";
import _ from "lodash";
import IafDocViewer from '@dtplatform/iaf-doc-viewer';
import "./DocumentView.scss";

import { LinearProgress } from "@mui/material";

const DocumentView = (props) => {
  if (props.isPageLoading) return null;

  const [loading, setLoading] = useState(false);

  // This should be a temporary solution, to be replaced when the IafDocViewer can provide an 'isReady' callback function
  useEffect(() => {
    const targetNode = document.body
    if (!targetNode) return

    const observer = new MutationObserver(() => {
      const noDocsDiv = document.querySelector("#no-documents");
      setLoading(!!noDocsDiv)
    })

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    })

    const initialCheck = document.querySelector("#no-documents")
    setLoading(!!initialCheck)

    return () => {
      observer.disconnect()
    }
  }, [])

  let docIds = props.docIds || props.queryParams.docIds || [];

  // If more then 100 files are selected, docIds will be an object of objects. Need to convert it to an array.
  if(!Array.isArray(docIds)) {
    docIds = Object.values(docIds)
  }

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
    pageContent = <>
                    {loading?  
                        <LinearProgress 
                          sx={{ 
                            height: '4px', 
                            backgroundColor: '#FCE8F3', 
                            '& .MuiLinearProgress-bar': { 
                                backgroundColor: '#DF158C'
                            }
                          }}
                        /> 
                    : null }  
                    <IafDocViewer
                        docIds={docIds}
                    />
                </>
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
