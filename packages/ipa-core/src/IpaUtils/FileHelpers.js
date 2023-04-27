
import { IafFileSvc, IafFile, IafProj, IafSession } from '@invicara/platform-api';
import {IafScriptEngine} from '@invicara/iaf-script-engine';
import { file } from 'jszip';
import _ from 'lodash';

var JSZip = require("jszip");
var FileSaver = require('file-saver');

export async function downloadDocuments(fileItems) {
  let fileUrls = [];
  let urlPromises = [];

  for (let i = 0; i < fileItems.length; i++) {

    urlPromises.push(IafFileSvc.getFileUrl(fileItems[i]._fileId).then((urlObj) => {
      fileUrls.push(urlObj);
    }));

  }

  Promise.all(urlPromises).then(async () => {

    if (fileUrls.length === 1)
      window.location.href = fileUrls[0]._url;
    else if (fileUrls.length > 1) {

      let urlFetchPromises = [];
      let allFileBuffs = {};
      for (let i = 0; i < fileUrls.length; i++) {

        urlFetchPromises.push(fetch(fileUrls[i]._url).then((resp) => {

          return new Promise((resolve, reject) => {
            resp.arrayBuffer().then((buff) => {
              resolve({ buff, resp });
            });
          })

        }).then(((bufferInfo) => {
          return new Promise((resolve, reject) => {

            let fileUrlObj = _.find(fileUrls, { _url: bufferInfo.resp.url })
            allFileBuffs[fileUrlObj._name] = bufferInfo.buff;;
            resolve(bufferInfo.buff)
          });

        })));
      }

      Promise.all(urlFetchPromises).then(() => {

        let buffs = Object.keys(allFileBuffs);
        let zip = new JSZip();

        buffs.forEach((filebuff) => {

          let fileToZip = new File([allFileBuffs[filebuff]], filebuff);
          zip.file(filebuff, fileToZip, { binary: true });

        });

        zip.generateAsync({ type: 'blob' }).then((zippedContent) => {
          FileSaver.saveAs(zippedContent, 'DownloadedFiles.zip');
        });
      });
    }
  });

}
export async function downloadDocumentsVersions(fileItems) {
  let fileUrls = [];
  let urlPromises = [];

  for (let i = 0; i < fileItems.length; i++) {
    urlPromises.push(IafFileSvc.getFileVersionUrl(fileItems[i]._fileId, fileItems[i]._fileVersionId).then((urlObj) => {
      urlObj['_name'] = fileItems[i].name
      fileUrls.push(urlObj);

    }));
  }
  Promise.all(urlPromises).then(async () => {

    if (fileUrls.length === 1)
      window.location.href = fileUrls[0]._url;
    else if (fileUrls.length > 1) {

      let urlFetchPromises = [];
      let allFileBuffs = {};
      for (let i = 0; i < fileUrls.length; i++) {

        urlFetchPromises.push(await fetch(fileUrls[i]._url).then((resp) => {

          return new Promise((resolve, reject) => {
            resp.arrayBuffer().then((buff) => {
              resolve({ buff, resp });
            });
          })

        }).then(((bufferInfo) => {
          return new Promise((resolve, reject) => {
            let fileUrlObj = _.find(fileUrls, { _url: bufferInfo.resp.url })
            allFileBuffs[`${fileUrlObj._version}-${fileUrlObj._name}`] = bufferInfo.buff;;
            resolve(bufferInfo.buff)
          });

        })));
      }

      Promise.all(urlFetchPromises).then(() => {

        let buffs = Object.keys(allFileBuffs);
        let zip = new JSZip();

        buffs.forEach((filebuff) => {

          let fileToZip = new File([allFileBuffs[filebuff]], filebuff);
          zip.file(filebuff, fileToZip, { binary: true });

        });

        zip.generateAsync({ type: 'blob' }).then((zippedContent) => {
          FileSaver.saveAs(zippedContent, 'DownloadedFiles.zip');
        });
      });
    }
  });

}
export const getFileUrlForFilename = async (filename) => {

  let project = IafProj.getCurrent()
  return IafFile.getFileItems(project.rootContainer, { name: filename }).then((fileItems) => {

    let fileItem = _.find(fileItems._list, { name: filename })
    let fileVersion = _.find(fileItem.versions, { versionNumber: fileItem.tipVersionNumber })
    return IafFileSvc.getFileVersionUrl(fileItem._fileId, fileVersion._fileVersionId).then((result) => {
      return result._url
    })
  })
}

//need to fix this, it defaults to to returning the fist version and not the latest
export const getFileUrl = async (fileId, versionId) => {
  let result = await IafFileSvc.getFileVersionUrl(fileId, versionId ? versionId : await IafFileSvc.getFileVersions(fileId)._list[0]._id)
  return result
}

export const getDocumentsForAsset = async (input) => {
  const ctx = { _namespaces: IafProj.getCurrent()._namespaces, authToken: IafSession.getAuthToken() }

  let iaf_asset_collection = await IafScriptEngine.getVar('iaf_asset_collection')
  if(!iaf_asset_collection){

    let collections = await IafScriptEngine.getCollections(null, ctx)
    collections = collections._list
    
    iaf_asset_collection = _.find(collections, { _userType: "iaf_ext_asset_coll" })
  }
  let assetDoc_query = {
      query:
      {
          parent: {
              query: { _id: input._id },
              collectionDesc: { _userType: iaf_asset_collection._userType, _userItemId: iaf_asset_collection._userItemId },
              options: { page: { getAllItems: true } }
          },
          related: [
              {
                  relatedDesc: { _relatedUserType: "file_container" },
                  as: "documents",
                  options: { page: { getAllItems: true } }
              }
          ]
      }
  }
  let IAF_assetdoc_res = await IafScriptEngine.findWithRelated(assetDoc_query.query, ctx)
  let documentsForAsset = IAF_assetdoc_res._list[0].documents._list
  return documentsForAsset
}

let FileHelpers = {
  downloadDocuments: downloadDocuments,
  downloadDocumentsVersions: downloadDocumentsVersions,
  getFileUrlForFilename,
  getFileUrl,
  getDocumentsForAsset
}

export default FileHelpers;
