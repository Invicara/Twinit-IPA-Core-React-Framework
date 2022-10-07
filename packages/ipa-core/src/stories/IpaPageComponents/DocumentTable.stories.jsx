import React from 'react';
import { Provider } from 'react-redux'
import { useArgs } from '@storybook/client-api';
import store from "../../redux/store";
import DocumentTable from "../../IpaPageComponents/files/DocumentTable";

export default {
  title: 'Components/DocumentTable',
  component: DocumentTable,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (<Provider store={store}><Story /></Provider>)
  ]
};

const Template = (args) => {
  const props = { ...args };
  return <DocumentTable {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  "documents": [
    {
      "documentData": {
        "fileAttributes": {
          "dtCategory": "AC Units",
          "contributor": "Invicara",
          "documentType": "3D model file",
          "dtType": "Condensor",
          "levelsAndLocations": "01-FIRST FLOOR",
          "fileDiscipline": "Civil Engineering",
          "originator": "",
          "building": "Kingspan Group Office",
          "fileType": "Image",
          "manufacturer": "",
          "revision": ""
        },
        "versions": [
          {
            "fileSize": 56196,
            "versionNumber": 1,
            "_fileVersionId": "16e110f9-70c3-4395-8e3e-51ff85678d3f"
          },
          {
            "fileSize": 56196,
            "versionNumber": 2,
            "_fileVersionId": "55d1f60c-9216-4530-be00-a719c5f1a261"
          }
        ],
        "name": "istockphoto-1180542165-612x612.jpeg",
        "tipVersionNumber": 2,
        "_id": "62275fb83c44ab1996c214e8",
        "containerPath": "/",
        "nextVersionNumber": 3,
        "_metadata": {
          "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_createdAt": 1646747576432,
          "_createdById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_updatedAt": 1646905415022
        },
        "_fileId": "f500331f-2375-4e8f-9c53-971ea64c720c",
        "Entity Name": "istockphoto-1180542165-612x612.jpeg",
        "properties": {
          "Building": {
            "dName": "Building",
            "val": "Kingspan Group Office",
            "type": "text"
          },
          "Contributor": {
            "dName": "Contributor",
            "val": "Invicara",
            "type": "text"
          },
          "Document Type": {
            "dName": "Document Type",
            "val": "3D model file",
            "type": "text"
          },
          "dtCategory": {
            "dName": "dtCategory",
            "val": "AC Units",
            "type": "<<HIERARCHY>>"
          },
          "dtType": {
            "dName": "dtType",
            "val": "Condensor",
            "type": "<<HIERARCHY>>"
          },
          "File Discipline": {
            "dName": "File Discipline",
            "val": "Civil Engineering",
            "type": "text"
          },
          "File Type": {
            "dName": "File Type",
            "val": "Image",
            "type": "text"
          },
          "Levels and Locations": {
            "dName": "Levels and Locations",
            "val": "01-FIRST FLOOR",
            "type": "text"
          },
          "Manufacturer": {
            "dName": "Manufacturer",
            "type": "text"
          },
          "Originator": {
            "dName": "Originator",
            "type": "text"
          },
          "Revision": {
            "dName": "Revision",
            "type": "text"
          },
          "Stage Description": {
            "dName": "Stage Description",
            "val": null,
            "type": "text"
          }
        }
      },
      "currentVersion": "55d1f60c-9216-4530-be00-a719c5f1a261",
      "setCurrentVersion": "ƒ setCurrentVersion() {}",
      "disableVersions": false
    },
    {
      "documentData": {
        "fileAttributes": {
          "dtCategory": "AC Units",
          "contributor": "Invicara",
          "documentType": "Database",
          "dtType": "Condensor",
          "levelsAndLocations": "01-FIRST FLOOR",
          "stageDescription": null,
          "fileDiscipline": "Civil Engineering",
          "originator": "",
          "building": "Kingspan Group Office",
          "fileType": "Image",
          "manufacturer": "",
          "revision": ""
        },
        "versions": [
          {
            "fileSize": 1407923,
            "versionNumber": 1,
            "_fileVersionId": "5ae5075f-c7c6-47bf-9c47-8f49dd0d8fd6"
          }
        ],
        "name": "Landscape-Color.jpeg",
        "tipVersionNumber": 1,
        "_id": "62287e0d3c44ab1996c2bc3c",
        "containerPath": "/",
        "nextVersionNumber": 2,
        "_metadata": {
          "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_createdAt": 1646820877606,
          "_createdById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_updatedAt": 1646905412327
        },
        "_fileId": "e6fe3ce9-8b7a-4d28-a303-c5dc2bb62b18",
        "Entity Name": "Landscape-Color.jpeg",
        "properties": {
          "Building": {
            "dName": "Building",
            "val": "Kingspan Group Office",
            "type": "text"
          },
          "Contributor": {
            "dName": "Contributor",
            "val": "Invicara",
            "type": "text"
          },
          "Document Type": {
            "dName": "Document Type",
            "val": "Database",
            "type": "text"
          },
          "dtCategory": {
            "dName": "dtCategory",
            "val": "AC Units",
            "type": "<<HIERARCHY>>"
          },
          "dtType": {
            "dName": "dtType",
            "val": "Condensor",
            "type": "<<HIERARCHY>>"
          },
          "File Discipline": {
            "dName": "File Discipline",
            "val": "Civil Engineering",
            "type": "text"
          },
          "File Type": {
            "dName": "File Type",
            "val": "Image",
            "type": "text"
          },
          "Levels and Locations": {
            "dName": "Levels and Locations",
            "val": "01-FIRST FLOOR",
            "type": "text"
          },
          "Manufacturer": {
            "dName": "Manufacturer",
            "type": "text"
          },
          "Originator": {
            "dName": "Originator",
            "type": "text"
          },
          "Revision": {
            "dName": "Revision",
            "type": "text"
          },
          "Stage Description": {
            "dName": "Stage Description",
            "type": "text"
          }
        }
      },
      "currentVersion": "5ae5075f-c7c6-47bf-9c47-8f49dd0d8fd6",
      "setCurrentVersion": "ƒ setCurrentVersion() {}",
      "disableVersions": false
    },
    {
      "documentData": {
        "fileAttributes": {
          "dtCategory": "AC Units",
          "contributor": "Invicara",
          "documentType": "2D model file",
          "dtType": "Condensor",
          "levelsAndLocations": "01-FIRST FLOOR",
          "fileDiscipline": "Building Survey",
          "originator": "",
          "building": "Kingspan Group Office",
          "fileType": "Image",
          "manufacturer": "",
          "revision": ""
        },
        "versions": [
          {
            "fileSize": 161805,
            "versionNumber": 1,
            "_fileVersionId": "97396360-8be4-42dd-8b0b-3b15d90ff8f1"
          }
        ],
        "name": "asphalt-highway.jpg",
        "tipVersionNumber": 1,
        "_id": "622883963c44ab1996c2bc3d",
        "containerPath": "/",
        "nextVersionNumber": 2,
        "_metadata": {
          "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_createdAt": 1646822294645,
          "_createdById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_updatedAt": 1646905413684
        },
        "_fileId": "e9fd4601-6139-4e73-a8b2-70765a50a427",
        "Entity Name": "asphalt-highway.jpg",
        "properties": {
          "Building": {
            "dName": "Building",
            "val": "Kingspan Group Office",
            "type": "text"
          },
          "Contributor": {
            "dName": "Contributor",
            "val": "Invicara",
            "type": "text"
          },
          "Document Type": {
            "dName": "Document Type",
            "val": "2D model file",
            "type": "text"
          },
          "dtCategory": {
            "dName": "dtCategory",
            "val": "AC Units",
            "type": "<<HIERARCHY>>"
          },
          "dtType": {
            "dName": "dtType",
            "val": "Condensor",
            "type": "<<HIERARCHY>>"
          },
          "File Discipline": {
            "dName": "File Discipline",
            "val": "Building Survey",
            "type": "text"
          },
          "File Type": {
            "dName": "File Type",
            "val": "Image",
            "type": "text"
          },
          "Levels and Locations": {
            "dName": "Levels and Locations",
            "val": "01-FIRST FLOOR",
            "type": "text"
          },
          "Manufacturer": {
            "dName": "Manufacturer",
            "type": "text"
          },
          "Originator": {
            "dName": "Originator",
            "type": "text"
          },
          "Revision": {
            "dName": "Revision",
            "type": "text"
          },
          "Stage Description": {
            "dName": "Stage Description",
            "val": null,
            "type": "text"
          }
        }
      },
      "currentVersion": "97396360-8be4-42dd-8b0b-3b15d90ff8f1",
      "setCurrentVersion": "ƒ setCurrentVersion() {}",
      "disableVersions": false
    },
  ],
  "actions": [
    {
      "key": "DOWNLOAD",
      "name": "Download",
      "icon": "icofont-upload-alt",
      "onClick": "ƒ onClick() {}",
      "bulk": {
        "disabled": false
      },
      "single": {
        "disabled": false
      }
    },
    {
      "key": "VIEW",
      "name": "View",
      "icon": "fas fa-file-export",
      "onClick": "ƒ onClick() {}",
      "bulk": {
        "disabled": false
      },
      "single": {
        "disabled": false
      }
    }
  ],
  "tableConfig": {
    "columns": [
      "Contributor",
      "Building",
      "File Type"
    ],
    "sort": {
      "onSort": "ƒ bound dispatchAction() {}",
      "isDescending": true
    }
  }
}
export const Version1 = Template.bind({});
Version1.args = {
  "documents": [
    {
      "documentData": {
        "fileAttributes": {
          "dtCategory": "AC Units",
          "contributor": "Invicara",
          "documentType": "3D model file",
          "dtType": "Condensor",
          "levelsAndLocations": "01-FIRST FLOOR",
          "fileDiscipline": "Civil Engineering",
          "originator": "",
          "building": "Kingspan Group Office",
          "fileType": "Pdf",
          "manufacturer": "",
          "revision": ""
        },
        "versions": [
          {
            "fileSize": 56196,
            "versionNumber": 1,
            "_fileVersionId": "16e110f9-70c3-4395-8e3e-51ff85678d3f"
          },
          {
            "fileSize": 56196,
            "versionNumber": 2,
            "_fileVersionId": "55d1f60c-9216-4530-be00-a719c5f1a261"
          }
        ],
        "name": "istockphoto-1180542165-612x612.jpeg",
        "tipVersionNumber": 2,
        "_id": "62275fb83c44ab1996c214e8",
        "containerPath": "/",
        "nextVersionNumber": 3,
        "_metadata": {
          "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_createdAt": 1646747576432,
          "_createdById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_updatedAt": 1646905415022
        },
        "_fileId": "f500331f-2375-4e8f-9c53-971ea64c720c",
        "Entity Name": "istockphoto-1180542165-612x612.jpeg",
        "properties": {
          "Building": {
            "dName": "Building",
            "val": "Kingspan Group Office",
            "type": "text"
          },
          "Contributor": {
            "dName": "Contributor",
            "val": "Invicara",
            "type": "text"
          },
          "Document Type": {
            "dName": "Document Type",
            "val": "3D model file",
            "type": "text"
          },
          "dtCategory": {
            "dName": "dtCategory",
            "val": "AC Units",
            "type": "<<HIERARCHY>>"
          },
          "dtType": {
            "dName": "dtType",
            "val": "Condensor",
            "type": "<<HIERARCHY>>"
          },
          "File Discipline": {
            "dName": "File Discipline",
            "val": "Civil Engineering",
            "type": "text"
          },
          "File Type": {
            "dName": "File Type",
            "val": "Image",
            "type": "text"
          },
          "Levels and Locations": {
            "dName": "Levels and Locations",
            "val": "01-FIRST FLOOR",
            "type": "text"
          },
          "Manufacturer": {
            "dName": "Manufacturer",
            "type": "text"
          },
          "Originator": {
            "dName": "Originator",
            "type": "text"
          },
          "Revision": {
            "dName": "Revision",
            "type": "text"
          },
          "Stage Description": {
            "dName": "Stage Description",
            "val": null,
            "type": "text"
          }
        }
      },
      "currentVersion": "55d1f60c-9216-4530-be00-a719c5f1a261",
      "setCurrentVersion": "ƒ setCurrentVersion() {}",
      "disableVersions": false
    },
    {
      "documentData": {
        "fileAttributes": {
          "dtCategory": "AC Units",
          "contributor": "Invicara",
          "documentType": "Database",
          "dtType": "Condensor",
          "levelsAndLocations": "01-FIRST FLOOR",
          "stageDescription": null,
          "fileDiscipline": "Civil Engineering",
          "originator": "",
          "building": "Kingspan Group Office",
          "fileType": "Image",
          "manufacturer": "",
          "revision": ""
        },
        "versions": [
          {
            "fileSize": 1407923,
            "versionNumber": 1,
            "_fileVersionId": "5ae5075f-c7c6-47bf-9c47-8f49dd0d8fd6"
          }
        ],
        "name": "Landscape-Color.jpeg",
        "tipVersionNumber": 1,
        "_id": "62287e0d3c44ab1996c2bc3c",
        "containerPath": "/",
        "nextVersionNumber": 2,
        "_metadata": {
          "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_createdAt": 1646820877606,
          "_createdById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_updatedAt": 1646905412327
        },
        "_fileId": "e6fe3ce9-8b7a-4d28-a303-c5dc2bb62b18",
        "Entity Name": "Landscape-Color.jpeg",
        "properties": {
          "Building": {
            "dName": "Building",
            "val": "Kingspan Group Office",
            "type": "text"
          },
          "Contributor": {
            "dName": "Contributor",
            "val": "Invicara",
            "type": "text"
          },
          "Document Type": {
            "dName": "Document Type",
            "val": "Database",
            "type": "text"
          },
          "dtCategory": {
            "dName": "dtCategory",
            "val": "AC Units",
            "type": "<<HIERARCHY>>"
          },
          "dtType": {
            "dName": "dtType",
            "val": "Condensor",
            "type": "<<HIERARCHY>>"
          },
          "File Discipline": {
            "dName": "File Discipline",
            "val": "Civil Engineering",
            "type": "text"
          },
          "File Type": {
            "dName": "File Type",
            "val": "Image",
            "type": "text"
          },
          "Levels and Locations": {
            "dName": "Levels and Locations",
            "val": "01-FIRST FLOOR",
            "type": "text"
          },
          "Manufacturer": {
            "dName": "Manufacturer",
            "type": "text"
          },
          "Originator": {
            "dName": "Originator",
            "type": "text"
          },
          "Revision": {
            "dName": "Revision",
            "type": "text"
          },
          "Stage Description": {
            "dName": "Stage Description",
            "type": "text"
          }
        }
      },
      "currentVersion": "5ae5075f-c7c6-47bf-9c47-8f49dd0d8fd6",
      "setCurrentVersion": "ƒ setCurrentVersion() {}",
      "disableVersions": false
    },
    {
      "documentData": {
        "fileAttributes": {
          "dtCategory": "AC Units",
          "contributor": "Invicara",
          "documentType": "2D model file",
          "dtType": "Condensor",
          "levelsAndLocations": "01-FIRST FLOOR",
          "fileDiscipline": "Building Survey",
          "originator": "",
          "building": "Kingspan Group Office",
          "fileType": "Image",
          "manufacturer": "",
          "revision": ""
        },
        "versions": [
          {
            "fileSize": 161805,
            "versionNumber": 1,
            "_fileVersionId": "97396360-8be4-42dd-8b0b-3b15d90ff8f1"
          }
        ],
        "name": "asphalt-highway.jpg",
        "tipVersionNumber": 1,
        "_id": "622883963c44ab1996c2bc3d",
        "containerPath": "/",
        "nextVersionNumber": 2,
        "_metadata": {
          "_updatedById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_createdAt": 1646822294645,
          "_createdById": "75a550d8-df2e-4fc6-9093-fae59a3da504",
          "_updatedAt": 1646905413684
        },
        "_fileId": "e9fd4601-6139-4e73-a8b2-70765a50a427",
        "Entity Name": "asphalt-highway.jpg",
        "properties": {
          "Building": {
            "dName": "Building",
            "val": "Kingspan Group Office",
            "type": "text"
          },
          "Contributor": {
            "dName": "Contributor",
            "val": "Invicara",
            "type": "text"
          },
          "Document Type": {
            "dName": "Document Type",
            "val": "2D model file",
            "type": "text"
          },
          "dtCategory": {
            "dName": "dtCategory",
            "val": "AC Units",
            "type": "<<HIERARCHY>>"
          },
          "dtType": {
            "dName": "dtType",
            "val": "Condensor",
            "type": "<<HIERARCHY>>"
          },
          "File Discipline": {
            "dName": "File Discipline",
            "val": "Building Survey",
            "type": "text"
          },
          "File Type": {
            "dName": "File Type",
            "val": "Image",
            "type": "text"
          },
          "Levels and Locations": {
            "dName": "Levels and Locations",
            "val": "01-FIRST FLOOR",
            "type": "text"
          },
          "Manufacturer": {
            "dName": "Manufacturer",
            "type": "text"
          },
          "Originator": {
            "dName": "Originator",
            "type": "text"
          },
          "Revision": {
            "dName": "Revision",
            "type": "text"
          },
          "Stage Description": {
            "dName": "Stage Description",
            "val": null,
            "type": "text"
          }
        }
      },
      "currentVersion": "97396360-8be4-42dd-8b0b-3b15d90ff8f1",
      "setCurrentVersion": "ƒ setCurrentVersion() {}",
      "disableVersions": true
    },
  ],
  "actions": [
    {
      "key": "DOWNLOAD",
      "name": "Download",
      "icon": "icofont-upload-alt",
      "onClick": "ƒ onClick() {}",
      "bulk": {
        "disabled": true
      },
      "single": {
        "disabled": false
      }
    },
    {
      "key": "VIEW",
      "name": "View",
      "icon": "fas fa-file-export",
      "onClick": "ƒ onClick() {}",
      "bulk": {
        "disabled": false
      },
      "single": {
        "disabled": true
      }
    }
  ],
  "tableConfig": {
    "columns": [
      "Contributor",
      "Building",
      "File Type"
    ],
    "sort": {
      "onSort": "ƒ bound dispatchAction() {}",
      "isDescending": true
    }
  }
}