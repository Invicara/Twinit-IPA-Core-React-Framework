import React from "react";
import _ from 'lodash';
import moment from 'moment';

import {getPlatformPath} from '../IpaPaths'
import IfefLoading from "../react-ifef/components/ifefLoading";

import './DownloadsView.scss';

class DownloadsView extends React.Component {
    constructor(props) {
        super(props);

       this.state = {
           isPageLoading: true,
           manifests: [],
           error: null
       }
       this._loadAsyncData = this._loadAsyncData.bind(this);
       this.toggleDetails = this.toggleDetails.bind(this);
    }

    async _loadAsyncData() {
        
        await fetch(getPlatformPath('DOWNLOADS')).then(async (resp) => {
          let downs = await resp.json();

          let manifests = [];
          downs.manifests.forEach((mani) => {
              if (this.props.handler.systems.includes(mani.system))
                  manifests.push(mani);
          });

          for (let i = 0; i < manifests.length; i++) {
             let mani = manifests[i];
             for (let v = 0; v < mani.versions.length; v++) {
                  let ver = mani.versions[v];

                  ver.showDetails = false;
                  let resp = await fetch(getPlatformPath('PLUGIN_BASE', ver.manifest)).catch((err) => {
                      console.error(err);
                  });
                  ver.details = await resp.json();
             };

          };

          this.setState({manifests: manifests});
        }).catch((err) => {
            console.error('-->', err);
            this.setState({isPageLoading: false, error: err.toString()});
        });
    }

    toggleDetails(manifest, version) {

        let {manifests} = this.state;

        for (let i = 0; i < manifests.length; i++) {

            if (manifests[i].system === manifest.system) {
                let mani = manifests[i];

                for (let v = 0; v < mani.versions.length; v++) {
                    let ver = mani.versions[v];

                    if (ver.version === version.version) {

                        ver.showDetails = !ver.showDetails;
                        break;
                    }
                }
                break;
            }
        }

        this.setState({manifests: manifests});

    }


    async componentDidMount() {
        //When the page mounts load the asyn data (script and other)
        //and then create the column info for the upload table
        this.setState({isPageLoading: true});

        await this._loadAsyncData();

        this.setState({isPageLoading: false}, this.props.onLoadComplete);
    }

    render() {
        return (
                <div>
                {!this.state.isPageLoading && !!this.state.error && <div>{this.state.error}</div>}
                {!this.state.isPageLoading && !this.state.error  ? <div className="data-container">
                    <div className="plugin-container">

                        {this.state.manifests.map((mani) => {

                            return  <div key={mani.system}>
                                        <h3>{mani.system}</h3>
                                        <div className="manifest-container">

                                            {mani.versions.map((ver) => {

                                                return <div key={ver.manifest} className="version-container">
                                                    <h4 className="version-name">{ver.details.resources.en.name}</h4>
                                                    <i title='Info' className='version-icon version-info ion-ios-information-outline' onClick={(e) => this.toggleDetails(mani, ver)}></i>
                                                    <a href={getPlatformPath('PLUGIN_BASE', ver.details.filename)}>
                                                        <i title='Download' className='version-icon icon ion-ios-cloud-download'></i>
                                                    </a>
                                                    {ver.showDetails && <div className="version-details-container">
                                                            <table >
                                                            <tbody>
                                                                <tr>
                                                                    <th className="details-header">Filename</th>
                                                                    <td className="details-cell">{ver.details.filename.split('/')[1]}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th className="details-header">File Size</th>
                                                                    <td className="details-cell">{(Math.round((ver.details.filesize/1000000) * 100) / 100) + ' MB'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th className="details-header">Language</th>
                                                                    <td className="details-cell">{ver.details.resources.en.displaylanguage}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th className="details-header">Supported Operating Systems</th>
                                                                    <td className="details-cell">{ver.details.resources.en.ossupport}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th className="details-header">Updated</th>
                                                                    <td className="details-cell">{moment(parseInt(ver.details.posteddate)).format('dddd, MMMM Do YYYY')}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th className="details-header">Version</th>
                                                                    <td className="details-cell">{ver.details.version}</td>
                                                                </tr>
                                                            </tbody>
                                                            </table>
                                                        </div>}
                                                    <hr/>
                                                </div>
                                            })}

                                        </div>
                                    </div>



                        })}
                    </div>

                </div> : <IfefLoading show={this.state.isPageLoading}/>}
                </div>)
    }
}

export default DownloadsView;
