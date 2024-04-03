import React from "react";
import {getAllByText, getByText, render, waitFor} from "@testing-library/react";
import _ from 'lodash'
import EmptyComponent from "../IpaPageComponents/mock/EmptyComponent";
import {decorateWithMockAppProvider} from "../IpaMock/MockAppProvider";
import RenderHandlerByPath from "../stories/mock/RenderRoute";
import sampleUserConfig from "../stories/IpaPageComponents/sample_user_config.json";
import sampleSelectedItems from "../stories/IpaPageComponents/sample_selectedItems.json.json";

const mockInterceptedComponent = jest.fn();
jest.mock("../IpaPageComponents/mock/EmptyComponent", () => (props) => {
    console.log("MOCKING",props);
    mockInterceptedComponent(props);
    return <div>{props.children}</div>;
});

test("Navigator config should use default", async () => {

    const configOverride = {
        handlers: {
            navigator: {
                pageComponent: "mock/EmptyComponent"
            }
        }
    }

    const currentPath = "/navigator";
    const userConfig = _.cloneDeep(sampleUserConfig);
    const userConfigMerged = _.merge(userConfig, configOverride);
    const DigitalTwinNavigatorTest = decorateWithMockAppProvider(()=><RenderHandlerByPath path={currentPath}></RenderHandlerByPath>, {}, userConfigMerged, currentPath, sampleSelectedItems);

    const container = render(DigitalTwinNavigatorTest);

    container.debug();

    jest.advanceTimersByTime(15000);
    //const spinners = await container.findAllByText(/spinningLoadingIcon/i);
    await waitFor(() => expect(container.getAllByText(/spinningLoadingIcon/i).length).toBe(1))
    //console.log("Spinners",spinners.length);


    jest.advanceTimersByTime(15000);
    container.debug();
    //expect(container.getByText("Data:")).toBeInTheDocument();

    expect(mockInterceptedComponent).toBeCalled();

  /*
  expect(mockInterceptedComponent).toHaveBeenCalledWith(
      expect.objectContaining({handler : navigatorHandlerExpected})
  );
    expect(mockInterceptedComponent).toBeCalledWith(
        expect.objectContaining({
            handler: expect.objectContaining(navigatorHandlerExpected)
        }),
    );

   */
});

test("Component is called, I know silly test", () => {
  render(<div />);
  expect(mockInterceptedComponent).toHaveBeenCalled();
});

const assetHandlerExpected = {
    "title": "Assets",
    "icon": "fas fa-dice-d6 fa-2x",
    "shortName": "assets",
    "description": "Asset Register",
    "pageComponent": "mock/EmptyComponent",
    "path": "/assets",
    "scriptTypes": [
        "iaf_asset_allusers",
        "iaf_relations_scripts",
        "iaf_space_allusers",
        "iaf_dt_types",
        "iaf_files_allusers"
    ],
    "onHandlerLoad": [
        "loadFileAttributes"
    ],
    "config": {
        "type": {
            "singular": "Asset",
            "plural": "Assets"
        },
        "entityData": {
            "Asset": {
                "script": "getAssets"
            }
        },
        "entitySelectionPanel": {
            "nonFilterableProperties": [],
            "nonGroupableProperties": [],
            "defaultGroups": [
                "Mark",
                "Type Mark",
                "Level"
            ]
        },
        "tableView": {
            "component": {
                "name": "EntityListView",
                "className": "entity-list-view-default",
                "multiselect": true,
                "columns": [
                    {
                        "name": "Asset Name",
                        "accessor": "Entity Name"
                    },
                    {
                        "name": "Mark",
                        "accessor": "properties.Mark.val"
                    },
                    {
                        "name": "Type Mark",
                        "accessor": "properties.Type Mark.val"
                    },
                    {
                        "name": "dtCategory",
                        "accessor": "properties.dtCategory.val"
                    },
                    {
                        "name": "dtType",
                        "accessor": "properties.dtType.val"
                    },
                    {
                        "name": "Level",
                        "accessor": "properties.Level.val"
                    },
                    {
                        "name": "Room Name",
                        "accessor": "properties.Room Name.val"
                    },
                    {
                        "name": "Room Number",
                        "accessor": "properties.Room Number.val"
                    },
                    {
                        "name": "SensorIDs",
                        "accessor": "properties.SensorIDs.val"
                    }
                ]
            }
        },
        "actions": {
            "Navigator": {
                "allow": true,
                "icon": "fas fa-compass fa-2x",
                "type": "navigate",
                "showOnTable": true,
                "navigateTo": "navigator"
            },
            "Elements": {
                "allow": true,
                "icon": "fas fa-building fa-2x",
                "type": "navigate",
                "showOnTable": true,
                "script": "assetsToElements",
                "scriptResultType": "Model Element",
                "navigateTo": "modelelems"
            },
            "Spaces": {
                "allow": true,
                "icon": "fas fa-vector-square fa-2x",
                "type": "navigate",
                "showOnTable": true,
                "script": "assetsToSpaces",
                "scriptResultType": "Space",
                "navigateTo": "spaces"
            },
            "Upload": {
                "allow": true,
                "icon": "icofont-upload-alt",
                "type": "navigate",
                "showOnTable": true,
                "navigateTo": "fileUpload"
            },
            "Edit": {
                "allow": true,
                "icon": "fas fa-edit",
                "type": "edit",
                "script": "editAsset",
                "showOnTable": false,
                "component": {
                    "name": "EntityModal",
                    "hierarchySelects": {
                        "id": "edithierarchyselects",
                        "query": "<<SCRIPTED_LINKED_SELECTS>>",
                        "display": "Category",
                        "selects": [
                            {
                                "display": "dtCategory",
                                "script": "getDtCategories"
                            },
                            {
                                "display": "dtType",
                                "script": "getDtTypes",
                                "multi": false
                            }
                        ]
                    },
                    "showGroupNames": true,
                    "groups": {
                        "Asset Data": [
                            "Manufacturer"
                        ],
                        "Identification": [
                            "Type Mark",
                            "Mark"
                        ],
                        "Location": [
                            "Level",
                            "Room Name",
                            "Room Number"
                        ],
                        "Classification": [
                            "dtCategory",
                            "dtType"
                        ]
                    },
                    "okButtonText": "Save"
                }
            },
            "Export": {
                "allow": true,
                "icon": "fas fa-file-export",
                "script": "exportAssets",
                "showOnTable": true
            },
            "Delete": {
                "allow": true,
                "icon": "fas fa-trash-alt",
                "type": "delete",
                "script": "deleteAsset",
                "showOnTable": false,
                "component": {
                    "name": "EntityModal",
                    "disableAll": true,
                    "okButtonText": "Delete"
                }
            }
        },
        "selectBy": [
            {
                "id": "assetsearch",
                "query": "<<TEXT_SEARCH>>",
                "display": "Asset Search"
            },
            {
                "id": "assetadvsrch",
                "query": "<<ADVANCED_SEARCH>>",
                "display": "Advanced Search",
                "searchable": {
                    "Mark": {
                        "type": "text"
                    },
                    "Revit Family": {
                        "type": "text"
                    },
                    "Revit Type": {
                        "type": "text"
                    }
                }
            },
            {
                "id": "treesearch",
                "query": "<<TREE_SEARCH>>",
                "display": "Tree Search",
                "treeLevels": [
                    {
                        "property": "dtCategory",
                        "script": "getCategoriesWithCount"
                    },
                    {
                        "property": "dtType",
                        "script": "getDtTypesWithChildrenCount"
                    }
                ]
            }
        ],
        "data": {
            "Asset Properties": {
                "selected": true,
                "isProperties": true,
                "component": {
                    "name": "SimpleTableGroup",
                    "className": "simple-property-grid",
                    "groupClassName": "simple-table-group-name",
                    "hidden": [],
                    "groups": {
                        "Identification": [
                            "Mark",
                            "Type Mark",
                            "Manufacturer",
                            "Description"
                        ],
                        "Sensor Information": [
                            "SensorIDs"
                        ],
                        "Location": [
                            "Level",
                            "Room Name",
                            "Room Number"
                        ],
                        "System Information": [
                            "System Name",
                            "System Classification",
                            "Workset"
                        ],
                        "Classification": [
                            "dtCategory",
                            "dtType",
                            "ClassificationCode",
                            "ClassificationCode(2)",
                            "ClassificationCode(3)",
                            "ClassificationCode(4)",
                            "ClassificationCode(5)",
                            "OmniClass Number",
                            "OmniClass Title",
                            "Assembly Code",
                            "Assembly Description",
                            "NRM1 Code",
                            "NRM1 Description",
                            "Hoare Lea Schedule",
                            "CISfb Code"
                        ],
                        "Revit Data": [
                            "Revit Family",
                            "Revit Type",
                            "revitGuid",
                            "revitId"
                        ]
                    }
                }
            },
            "Asset Performance": {
                "script": "getAssetSensorChartData2",
                "scriptExpiration": 0,
                "refreshInterval": 0,
                "component": {
                    "name": "SimpleTable",
                    "className": "simple-property-grid simple-property-grid-clearheader"
                }
            },
            "Files": {
                "script": "getDocumentsForAsset",
                "scriptExpiration": 0,
                "showCount": true,
                "component": {
                    "name": "SimpleTable",
                    "className": "fixed-header simple-property-grid",
                    "columns": [
                        {
                            "name": "Name",
                            "accessor": "name",
                            "download": true
                        },
                        {
                            "name": "Discipline",
                            "accessor": "fileAttributes.fileDiscipline"
                        },
                        {
                            "name": "Type",
                            "accessor": "fileAttributes.fileType"
                        },
                        {
                            "name": "Stage",
                            "accessor": "fileAttributes.stageDescription"
                        }
                    ]
                }
            },
            "Specification Data": {
                "script": "getAssetSpecificationData",
                "component": {
                    "name": "SimpleTable",
                    "className": "simple-property-grid simple-property-grid-clearheader"
                }
            }
        }
    }
}

const navigatorHandlerExpected = {
    "title": "Navigator",
    "icon": "fas fa-compass fa-2x",
    "shortName": "navi",
    "description": "Model Navigator",
    "pageComponent": "mock/EmptyComponent",
    "path": "/navigator",
    "scriptTypes": [
        "iaf_asset_allusers",
        "iaf_space_allusers",
        "iaf_schemas_allusers",
        "iaf_dt_model_elems",
        "iaf_pick_lists",
        "iaf_systems_scripts",
        "living-lab-int"
    ],
    "config": {
        "type": [
            {
                "singular": "Model Element",
                "plural": "Model Elements"
            },
            {
                "singular": "Asset",
                "plural": "Assets"
            },
            {
                "singular": "Space",
                "plural": "Spaces"
            }
        ],
        "entityData": {
            "Model Element": {
                "script": "getModelElementsBySourceFile",
                "getEntityFromModel": "getElementFromModel",
                "spaceMode": false
            },
            "Asset": {
                "script": "getAssets",
                "getEntityFromModel": "getAssetFromModel",
                "spaceMode": false
            },
            "Space": {
                "script": "getSpaces",
                "getEntityFromModel": "getSpaceFromModel",
                "spaceMode": true
            }
        },
        "data": {
            "Model Element": {
                "Element Properties": {
                    "selected": true,
                    "isProperties": true,
                    "component": {
                        "name": "SimpleTableGroup",
                        "className": "simple-property-grid",
                        "groupClassName": "simple-table-group-name",
                        "groups": {
                            "Base Properties": [
                                "Revit Family",
                                "Revit Type",
                                "SystemelementId"
                            ]
                        }
                    }
                }
            },
            "Asset": {
                "Asset Properties": {
                    "selected": true,
                    "isProperties": true,
                    "component": {
                        "name": "SimpleTableGroup",
                        "className": "simple-property-grid",
                        "groupClassName": "simple-table-group-name",
                        "hidden": [],
                        "groups": {
                            "Identification": [
                                "Mark",
                                "Type Mark",
                                "Manufacturer",
                                "Description"
                            ],
                            "Sensor Information": [
                                "SensorIDs"
                            ],
                            "Location": [
                                "Level",
                                "Room Name",
                                "Room Number"
                            ],
                            "System Information": [
                                "System Name",
                                "System Classification",
                                "Workset"
                            ],
                            "Classification": [
                                "dtCategory",
                                "dtType",
                                "ClassificationCode",
                                "ClassificationCode(2)",
                                "ClassificationCode(3)",
                                "ClassificationCode(4)",
                                "ClassificationCode(5)",
                                "OmniClass Number",
                                "OmniClass Title",
                                "Assembly Code",
                                "Assembly Description",
                                "NRM1 Code",
                                "NRM1 Description",
                                "Hoare Lea Schedule",
                                "CISfb Code"
                            ],
                            "Revit Data": [
                                "Revit Family",
                                "Revit Type",
                                "revitGuid",
                                "revitId"
                            ]
                        }
                    }
                },
                "Asset Performance": {
                    "script": "getAssetSensorChartData2",
                    "scriptExpiration": 0,
                    "refreshInterval": 0,
                    "component": {
                        "name": "SimpleTable",
                        "className": "simple-property-grid simple-property-grid-clearheader"
                    },
                    "alerts": {
                        "script": "getAlertsForAssetDemo",
                        "query": {
                            "tags": [
                                "AHU"
                            ]
                        }
                    }
                },
                "Files": {
                    "script": "getDocumentsForAsset",
                    "scriptExpiration": 0,
                    "showCount": true,
                    "component": {
                        "name": "SimpleTable",
                        "className": "fixed-header simple-property-grid",
                        "columns": [
                            {
                                "name": "Name",
                                "accessor": "name",
                                "download": false
                            },
                            {
                                "name": "Discipline",
                                "accessor": "fileAttributes.fileDiscipline"
                            },
                            {
                                "name": "Type",
                                "accessor": "fileAttributes.fileType"
                            },
                            {
                                "name": "Stage",
                                "accessor": "fileAttributes.stageDescription"
                            }
                        ]
                    }
                },
                "Specification Data": {
                    "script": "getAssetSpecificationData",
                    "component": {
                        "name": "SimpleTable",
                        "className": "simple-property-grid simple-property-grid-clearheader"
                    }
                }
            },
            "Space": {
                "Space Properties": {
                    "selected": true,
                    "isProperties": true,
                    "component": {
                        "name": "SimpleTableGroup",
                        "className": "simple-property-grid",
                        "groupClassName": "simple-table-group-name",
                        "hidden": [
                            "Area Num"
                        ],
                        "groups": {
                            "Location Information": [
                                "Level",
                                "Name",
                                "Number",
                                "Area"
                            ],
                            "Sensor Information": [
                                "SensorIDs"
                            ],
                            "Revit Information": [
                                "Revit Family",
                                "Revit Type",
                                "Revit Category",
                                "revitGuid",
                                "revitId"
                            ]
                        }
                    }
                },
                "Real Time IAQ": {
                    "script": "getRealtimeAwair",
                    "scriptExpiration": 0,
                    "component": {
                        "name": "SimpleTable",
                        "className": "fixed-header simple-property-grid",
                        "columns": [
                            {
                                "name": "Metric",
                                "accessor": "metric"
                            },
                            {
                                "name": "Value",
                                "accessor": "value"
                            }
                        ]
                    }
                },
                "Occupancy vs CO2": {
                    "script": "getSpaceOccVsC02DemoData",
                    "scriptExpiration": 0,
                    "refreshInterval": 0,
                    "component": {
                        "name": "ScriptedChart",
                        "style": {
                            "height": "250px"
                        },
                        "chart": "TwoAxisLine",
                        "script": "getSpaceOccVsC02DemoData",
                        "chartConfig": {
                            "line1": {
                                "axisLabel": "Occupancy",
                                "axisLabelPosition": "middle",
                                "displayInTooltip": "Occupancy",
                                "colors": [
                                    "#7AAABE"
                                ],
                                "curve": "monotoneX",
                                "yScale": {
                                    "type": "linear",
                                    "min": 0,
                                    "max": 20
                                },
                                "axisBottom": null,
                                "enableGridX": false,
                                "enablePoints": false,
                                "lineWidth": 4
                            },
                            "line2": {
                                "colors": [
                                    "#9B8DC6",
                                    "#DBCBE8"
                                ],
                                "curve": "monotoneX",
                                "axisLabel": "CO2",
                                "axisLabelPosition": "middle",
                                "yScale": {
                                    "type": "linear"
                                },
                                "axisBottom": null,
                                "enableGridX": false,
                                "enablePoints": false,
                                "lineWidth": 4,
                                "displayInTooltip": "CO2"
                            }
                        },
                        "config": {},
                        "alerts": {
                            "script": "getAlertsForSpaceDemo",
                            "query": {
                                "tags": [
                                    "CO2"
                                ]
                            }
                        }
                    },
                    "alerts": {
                        "script": "getAlertsForSpaceDemo",
                        "query": {
                            "tags": [
                                "CO2"
                            ]
                        }
                    }
                }
            }
        },
        "actions": {
            "Asset": {
                "Relate": {
                    "allow": true,
                    "icon": "fas fa-link",
                    "type": "relate",
                    "showOnTable": true,
                    "getScript": "getEntityRelatedItems",
                    "updateScript": "updateRelations",
                    "relatedTypes": [
                        {
                            "singular": "Asset",
                            "plural": "Assets",
                            "isChild": true
                        },
                        {
                            "singular": "File",
                            "plural": "Files",
                            "isChild": true
                        },
                        {
                            "singular": "Space",
                            "plural": "Spaces",
                            "isParent": true
                        },
                        {
                            "singular": "Collection",
                            "plural": "Collection",
                            "isParent": true
                        },
                        {
                            "singular": "BMS Equipment",
                            "plural": "BMS Equipment",
                            "isChild": true
                        }
                    ],
                    "component": {
                        "name": "RelationsModal"
                    }
                },
                "Upload": {
                    "allow": true,
                    "icon": "icofont-upload-alt",
                    "type": "navigate",
                    "showOnTable": true,
                    "navigateTo": "fileUpload"
                },
                "Collections": {
                    "allow": true,
                    "icon": "icofont-cubes",
                    "type": "collect",
                    "showOnTable": true,
                    "script": "addAssetsToCollections",
                    "component": {
                        "name": "EntityCollectionModal",
                        "okButtonText": "Apply",
                        "scripts": {
                            "getCollectionTypes": "getCollectionTypes",
                            "getCollectionNames": "getCollectionNames"
                        }
                    }
                },
                "Create": {
                    "allow": true,
                    "icon": "fas fa-plus",
                    "type": "create",
                    "preActionScript": "createAssetFromSchema",
                    "script": "createAsset",
                    "showOnTable": true,
                    "component": {
                        "name": "EntityModal",
                        "hierarchySelects": {
                            "id": "edithierarchyselects",
                            "query": "<<SCRIPTED_LINKED_SELECTS>>",
                            "display": "Category",
                            "selects": [
                                {
                                    "display": "dtCategory",
                                    "script": "getDtCategories"
                                },
                                {
                                    "display": "dtType",
                                    "script": "getDtTypes",
                                    "multi": false
                                }
                            ]
                        },
                        "showGroupNames": true,
                        "groups": {
                            "Asset Properties": [
                                "Floor",
                                "Mark",
                                "Room"
                            ],
                            "Product": [
                                "Manufacturer",
                                "Model"
                            ],
                            "Classification": [
                                "Revit Family",
                                "Revit Type",
                                "dtCategory",
                                "dtType"
                            ],
                            "General": [
                                "Date",
                                "DateTime",
                                "Image Url",
                                "Matterport Url",
                                "WithUnitNumber",
                                "WithUnitText"
                            ]
                        },
                        "okButtonText": "Save"
                    }
                },
                "Edit": {
                    "allow": true,
                    "icon": "fas fa-edit",
                    "type": "edit",
                    "script": "editAsset",
                    "showOnTable": true,
                    "component": {
                        "name": "EntityModal",
                        "requiredProperties": [
                            "dtCategory",
                            "dtType"
                        ],
                        "hierarchySelects": {
                            "id": "edithierarchyselects",
                            "query": "<<SCRIPTED_LINKED_SELECTS>>",
                            "display": "Category",
                            "selects": [
                                {
                                    "display": "dtCategory",
                                    "script": "getDtCategories",
                                    "multi": false
                                },
                                {
                                    "display": "dtType",
                                    "script": "getDtTypes",
                                    "multi": false
                                }
                            ]
                        },
                        "showGroupNames": true,
                        "hidden": [
                            "dtCategory",
                            "dtType",
                            "Revit Blob"
                        ],
                        "disabledInMulti": [
                            "Revit Family",
                            "Revit Type"
                        ],
                        "groups": {
                            "Asset Properties": [
                                "Containing Floor",
                                "Mark",
                                "Room Number",
                                "BA Name"
                            ],
                            "Product": [
                                "Manufacturer",
                                "Model"
                            ],
                            "Classification": [
                                "Revit Type",
                                "Revit Family"
                            ],
                            "General": [
                                "Date",
                                "Image Url",
                                "Matterport Url"
                            ]
                        },
                        "okButtonText": "Save"
                    }
                },
                "Export": {
                    "allow": true,
                    "icon": "fas fa-file-export",
                    "script": "exportAssets",
                    "showOnTable": true
                },
                "Delete": {
                    "allow": true,
                    "icon": "fas fa-trash-alt",
                    "type": "delete",
                    "script": "deleteAsset",
                    "showOnTable": true,
                    "component": {
                        "name": "EntityModal",
                        "disableAll": true,
                        "okButtonText": "Delete"
                    }
                }
            },
            "Space": {
                "Relate": {
                    "allow": true,
                    "icon": "fas fa-link",
                    "type": "relate",
                    "showOnTable": true,
                    "getScript": "getEntityRelatedItems",
                    "updateScript": "updateRelations",
                    "relatedTypes": [
                        {
                            "singular": "Asset",
                            "plural": "Assets",
                            "isChild": true
                        },
                        {
                            "singular": "File",
                            "plural": "Files",
                            "isChild": true
                        },
                        {
                            "singular": "Space",
                            "plural": "Spaces",
                            "isParent": true
                        },
                        {
                            "singular": "Collection",
                            "plural": "Collection",
                            "isParent": true
                        },
                        {
                            "singular": "BMS Equipment",
                            "plural": "BMS Equipment",
                            "isChild": true
                        }
                    ],
                    "component": {
                        "name": "RelationsModal"
                    }
                },
                "Create": {
                    "allow": true,
                    "icon": "fas fa-plus",
                    "type": "create",
                    "script": "createSpace",
                    "preActionScript": "createSpaceFromSchema",
                    "showOnTable": true,
                    "component": {
                        "name": "EntityModal",
                        "disabled": [
                            "Level",
                            "Area"
                        ],
                        "disabledInMulti": [
                            "Number"
                        ],
                        "propertyUiTypes": {
                            "Type": {
                                "query": "<<CREATABLE_SCRIPTED_SELECTS>>",
                                "script": "getSpaceTypeOptions",
                                "multi": true
                            }
                        },
                        "showGroupNames": true,
                        "groups": {
                            "Space Properties": [
                                "Floor",
                                "Number",
                                "Type",
                                "Area"
                            ]
                        },
                        "okButtonText": "Save"
                    }
                },
                "Edit": {
                    "allow": true,
                    "icon": "fas fa-edit",
                    "type": "edit",
                    "script": "editSpace",
                    "showOnTable": true,
                    "component": {
                        "name": "EntityModal",
                        "disabled": [
                            "Level",
                            "Area"
                        ],
                        "disabledInMulti": [
                            "Number"
                        ],
                        "propertyUiTypes": {
                            "Type": {
                                "query": "<<CREATABLE_SCRIPTED_SELECTS>>",
                                "script": "getSpaceTypeOptions",
                                "multi": true
                            }
                        },
                        "showGroupNames": true,
                        "groups": {
                            "Space Properties": [
                                "Floor",
                                "Number",
                                "Type",
                                "Area"
                            ]
                        },
                        "okButtonText": "Save"
                    }
                },
                "Export": {
                    "allow": true,
                    "icon": "fas fa-file-export",
                    "script": "exportSpaces",
                    "showOnTable": true
                }
            }
        },
        "tableView": {
            "Model Element": {
                "component": {
                    "name": "EntityListView",
                    "className": "entity-list-view-default",
                    "multiselect": true,
                    "columns": [
                        {
                            "name": "Name",
                            "accessor": "Entity Name"
                        }
                    ]
                }
            },
            "Asset": {
                "component": {
                    "name": "EntityListView",
                    "className": "entity-list-view-default",
                    "multiselect": true,
                    "columns": [
                        {
                            "name": "Asset Name",
                            "accessor": "Entity Name"
                        },
                        {
                            "name": "Mark",
                            "accessor": "properties.Mark.val"
                        },
                        {
                            "name": "Level",
                            "accessor": "properties.Level.val"
                        }
                    ]
                }
            },
            "Space": {
                "component": {
                    "name": "EntityListView",
                    "className": "entity-list-view-default",
                    "multiselect": true,
                    "columns": [
                        {
                            "name": "Space Name",
                            "accessor": "Entity Name"
                        },
                        {
                            "name": "Level",
                            "accessor": "properties.Level.val"
                        },
                        {
                            "name": "Name",
                            "accessor": "properties.Name.val"
                        }
                    ]
                }
            }
        },
        "selectBy": {
            "Model Element": [
                {
                    "id": "revfile",
                    "query": "<<SCRIPTED_SELECTS>>",
                    "display": "Source Files",
                    "script": "getRevitSourceFiles",
                    "altScript": "getModelElementsBySourceFile",
                    "multi": true,
                    "op": "$or"
                },
                {
                    "id": "revfam",
                    "query": "<<SCRIPTED_LINKED_SELECTS>>",
                    "display": "Revit Family",
                    "altScript": "getModelElementsByTypeProps",
                    "selects": [
                        {
                            "display": "Revit Family",
                            "script": "getModelRevitFamilies",
                            "propName": "properties.Revit Family.val"
                        },
                        {
                            "display": "Revit Type",
                            "script": "getModelRevitTypeForFamily",
                            "multi": true,
                            "propName": "properties.Revit Type.val"
                        }
                    ]
                },
                {
                    "id": "revcats",
                    "query": "<<SCRIPTED_LINKED_SELECTS>>",
                    "display": "dtCategory",
                    "altScript": "getModelElementsByCatAndType",
                    "selects": [
                        {
                            "display": "dtCategory",
                            "script": "getModelRevitDtCategories",
                            "propName": "dtCategory"
                        },
                        {
                            "display": "dtType",
                            "script": "getModelRevitDtTypesForDtCategory",
                            "multi": true,
                            "propName": "dtType"
                        }
                    ]
                }
            ],
            "Asset": [
                {
                    "id": "assetsearch",
                    "query": "<<TEXT_SEARCH>>",
                    "display": "Asset Search"
                },
                {
                    "id": "assetadvsrch",
                    "query": "<<ADVANCED_SEARCH>>",
                    "display": "Advanced Search",
                    "searchable": {
                        "Mark": {
                            "type": "text"
                        },
                        "Revit Family": {
                            "type": "text"
                        },
                        "Revit Type": {
                            "type": "text"
                        }
                    }
                },
                {
                    "id": "treesearch",
                    "query": "<<TREE_SEARCH>>",
                    "display": "Tree Search",
                    "treeLevels": [
                        {
                            "property": "dtCategory",
                            "script": "getCategoriesWithCount"
                        },
                        {
                            "property": "dtType",
                            "script": "getDtTypesWithChildrenCount"
                        }
                    ]
                }
            ],
            "Space": [
                {
                    "id": "spacesearch",
                    "query": "<<TEXT_SEARCH>>",
                    "display": "Space Search"
                },
                {
                    "id": "treesearch",
                    "query": "<<TREE_SEARCH>>",
                    "display": "Tree Search",
                    "treeLevels": [
                        {
                            "property": "Level",
                            "script": "getLevelsWithCount"
                        },
                        {
                            "property": "Name",
                            "script": "getNamesWithChildrenCount"
                        }
                    ]
                },
                {
                    "id": "spacefoorty",
                    "query": "<<SCRIPTED_SELECTS>>",
                    "display": "Level or Room Name or Room ID",
                    "script": "getSpacePropSelects",
                    "multi": true,
                    "op": "$or"
                }
            ]
        }
    }
}