import React from "@types/react";

const DocumentViewerTable = ({actions, entity, type, context, getEntityActionComponent, iconRenderer}) => {

    return <TableComponent
        config={handler.config.tableView.component}
        onDetail={this.openDetail}
        entities={this.tableEntities()}
        actions={tableActions}
        context={this.context}
        entityPlural={this.props.entityPlural}
        entitySingular={this.props.entitySingular}

    />

}

{
    documents: [
        {// object representing a document and all the configuration data useful to the presentational component
            documentData: <object>, //contains the document data as fetched by the api
                currentVersion: <file_version_id>,
                    setCurrentVersion: (file_id, version) => void,
                    actions: [ //"per document" actions config: overrides top level actions config
                    {
                        key: "DOWNLOAD", //is used to reconcile the action behaviour between row actions and bulk actions
                        name: "Download",
                        component?: <React node>, //(optional) "per document" row icon component with a tooltip attached
                        props?: <object>, //(optional) props sent to the optional component, will override default props
                        onClick?: (document) => void, //(optional) "per document" event handler
                        disabled?: false, //(optional) "per document" disabled state
                        hidden?: false, //(optional) "per document" hidden state
                        },
                    {
                        key: "VIEW", //is used to reconcile the action behaviour between row actions and bulk actions
                        name: "View",
                        component?: <React node>, //(optional) "per document" row icon component with a tooltip attached
                        props?: <object>, //(optional) props sent to the optional component, will override default props
                        onClick?: (document) => void, //(optional) "per document" event handler
                        disabled?: true, //(optional) "per document" disabled state
                        hidden?: false, //(optional) "per document" hidden state
                        },
                        ]
                        },
                        //... more documents
                        ],
                        actions: [ //top level actions config: define the behaviour of bulk actions and row actions (unless overridden by the "per document" actions config)
                    {
                        key: "DOWNLOAD", //is used to reconcile the action behaviour between row actions and bulk actions
                        name: "Download",
                        onClick: (documents) => void, //event handler for bulk action and row action (unless overriden by "per document" action config)
                        bulk: {
                        component?: <React node>//(optional) bulk action button component, override default button from presentational component,
                        props?: <object>, //(optional) props sent to the optional component, will override default props
                        disabled?: false, //(optional) disabled state for bulk action, defaults to false
                        hidden?: false, //(optional) hidden state for bulk action, defaults to false
                        },
                        single: {
                        component?: <React node>//(optional) row icon component with a tooltip attached for all rows (unless overriden by "per document" action config), defaults to icon from presentational component
                        props?: <object>, //(optional) props sent to the optional component, will override default props
                        disabled?: false, //(optional) disabled state for row action, defaults to false
                        hidden?: false //(optional) hidden state for row action, defaults to false
                        }
                        },
                    {
                        key: "VIEW", //is used to reconcile the action behaviour between row actions and bulk actions
                        name: "View",
                        onClick: (documents) => void, //event handler for bulk action and row action (unless overriden by "per document" action config)
                        bulk: {
                        component?: <React node>//(optional) bulk action button component, override default button from presentational component,
                        props?: <object>, //(optional) props sent to the optional component, will override default props
                        disabled?: false, //(optional) disabled state for bulk action, defaults to false
                        hidden?: false, //(optional) hidden state for bulk action, defaults to false
                        },
                        single: {
                        component?: <React node>//(optional) row icon component with a tooltip attached for all rows (unless overriden by "per document" action config), defaults to icon from presentational component
                        props?: <object>, //(optional) props sent to the optional component, will override default props
                        disabled?: false, //(optional) disabled state for row action, defaults to false
                        hidden?: false //(optional) hidden state for row action, defaults to false
                        }
                        },
                        ]
                        tableConfig: {
                        lockedColumns: ["version", "name"], //order insensitive
                        columns?: ["version", "name", "filetype"], //determines which columns should be displayed (order sensitive), defaults to ["version", "name"]
                        onColumnsChange: (columns) => void, //callback triggered when user confirmed order change in presentational component
                        sort?: { //If not defined, the presentational component handles the sorting logic
                        currentColumn: "name", //The currently sorted column, if null, no sorting is allowed
                        onSort?: (columnKey: string) => void //(optional) Called by the presentational component to defined additional instructions on sort,
                        isDescending?: false, //defaults to false
                    }
                    }
                        }