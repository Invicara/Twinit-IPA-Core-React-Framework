
import {IafFileSvc, IafFile, IafProj} from '@invicara/platform-api';
import _ from 'lodash';

var JSZip = require("jszip");
var FileSaver = require('file-saver');

export async function downloadDocuments(fileItems) {
  console.log('fileItems', fileItems)
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
              resolve({buff, resp});
            });
          })

        }).then(((bufferInfo) => {
          return new Promise((resolve, reject) => {

            let fileUrlObj = _.find(fileUrls, {_url: bufferInfo.resp.url})
            allFileBuffs[fileUrlObj._name] = bufferInfo.buff;;
            resolve(bufferInfo.buff)
          });

        })));
      }

      Promise.all(urlFetchPromises).then(() => {

        let buffs = Object.keys(allFileBuffs);
        let zip = new JSZip();

        buffs.forEach((filebuff) => {

          let fileToZip =  new File([allFileBuffs[filebuff]], filebuff);
          zip.file(filebuff, fileToZip, {binary: true});

        });

        zip.generateAsync({type: 'blob'}).then((zippedContent) => {
          FileSaver.saveAs(zippedContent, 'DownloadedFiles.zip');
        });
      });
    }
  });

}

export const getFileUrlForFilename = async (filename) => {
  
  let project = IafProj.getCurrent()
  return IafFile.getFileItems(project.rootContainer, {name: filename}).then((fileItems) => {
    
    let fileItem = _.find(fileItems._list, {name: filename})
    let fileVersion = _.find(fileItem.versions, {versionNumber: fileItem.tipVersionNumber})
    return IafFileSvc.getFileVersionUrl(fileItem._fileId, fileVersion._fileVersionId).then((result) => {
        return result._url
      })
  })
}

//need to fix this, it defaults to to returning the fist version and not the latest
export const getFileUrl = async (fileId, versionId) => {
  let result = await IafFileSvc.getFileVersionUrl(fileId, versionId ? versionId : await IafFileSvc.getFileVersions(fileId)._list[0]._id)
  return result._url
}

let FileHelpers = {
  downloadDocuments: downloadDocuments,
  getFileUrlForFilename,
  getFileUrl
}

export default FileHelpers;
