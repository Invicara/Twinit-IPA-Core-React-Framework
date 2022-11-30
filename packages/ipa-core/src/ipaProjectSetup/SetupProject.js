import React from "react";
import { IafProj, IafSession, IafScripts } from "@invicara/platform-api";
import * as PlatformApi from "@invicara/platform-api";
import _ from "lodash";
import GenericModal from "../IpaDialogs/GenericModal";
import "../IpaDialogs/ProjectPickerModal.scss";
import * as UiUtils from "@invicara/ui-utils";
import { mobiscroll } from "@invicara/invicara-lib";

export default class SetUpProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: {
        _description: "",
        _name: "",
        _shortName: "",
        _userAttributes: { nextScriptEngine: true },
        click: false,
      },
      ProjSetupModule: undefined,
      scripts: undefined,
    };
    this.ref = React.createRef();
  }

  handleInputChange = (e) => {
    const { id, value } = e.target;
    this.setState({ project: { ...this.state.project, [id]: value } });
  };

  handleProjectSetUp = async (e,  restartApp) => {
    e.preventDefault();
    this.setState({ click: true });
    let project = await IafProj.createProject(this.state.project);
    console.log(project);
    await IafProj.switchProject(project._list[0]._id);
    let scriptFile = await UiUtils.IafLocalFile.selectFiles({ accept: ".zip" });
    let x = scriptFile;
    let y = x[0];
    document.getElementById("msg").innerHTML =
      "Please wait, Setup is in progress";
    console.log("y", y);
    let configFiles = await UiUtils.IafLocalFile._loadZipFile(y);

    let scriptFiles = [];
    var projectSetupData = await configFiles.files["scripts/setup.js"]
      .async("blob")
      .then(async function (fileData) {
        var data = new File([fileData], "setup.js");
        var selectFile = data;
        var file = {
          fileObj: selectFile,
          size: selectFile.size,
          name: selectFile.name,
        };
        scriptFiles[0] = file;
      });
    if (_.size(scriptFiles) < 1) {
      return;
    }

    let scriptContent = await UiUtils.IafLocalFile.loadFiles(scriptFiles);
    if (_.size(scriptContent) > 0) {
      let scriptItem = {
        _name: "Project Setup",
        _shortName: "iaf_ext_proj_setup",
        _description: "Scripts to Setup a Project",
        _userType: "iaf_ext_proj_setup",
        _namespaces: project._list[0]._namespaces,
        _version: {
          _userData: scriptContent[0],
        },
      };
      let ctx = { _namespaces: project._list[0]._namespaces };
      //create or replace
      let results = await IafScripts.updateOrCreateScript(scriptItem, ctx);
      console.log("Result of create script" + results);
    }

    // Get Project Module
    let ctx = { _namespaces: project._list[0]._namespaces };
    ctx.authToken = IafSession.getAuthToken();
    let module = await PlatformApi.IafScriptEngine.dynamicImport(
      { query: { _userType: "iaf_ext_proj_setup" } },
      ctx
    );
    this.setState({ ProjSetupModule: module.default }, () => {});
    let scripts = undefined;
    scripts = module.default.getRunnableScripts();
    let pApi = PlatformApi;
    let uiUtils = UiUtils;
    let IafApi = PlatformApi.IafScriptEngine;
    let ProjectSetupCallBack = this.props.restartApp;
    console.log("PlatformApi", pApi);
    console.log("UIUtils", uiUtils);
    console.log("IafApi", IafApi);
    console.log("ProjSetupModule", ProjSetupModule);
    let ProjSetupModule = module.default;

    console.log("scriptFile ", scriptFile);
    let scriptToRun =
      "ProjSetupModule." +
      scripts[0].script +
      "(pApi, uiUtils, IafApi, scriptFile, ProjectSetupCallBack, " +
      JSON.stringify(ctx) +
      ")";
    console.log(scriptToRun);
    let promise = eval(scriptToRun);
    console.log();
  };

  render() {
    const title = <span>Setup Project</span>;
    return (
      <GenericModal
        title={title}
        modalBody={
          <div className="project-picker-modal">
            <form style={{ width: "100%" }} onSubmit={this.handleProjectSetUp}>
              <div style={{ margin: "9px 0" }}>
                <label>Name</label>
                <mobiscroll.Input
                  style={{ width: "100%" }}
                  id="_name"
                  type="text"
                  placeholder="Name"
                  name="_name"
                  required={true}
                  value={this.state.project._name}
                  onChange={this.handleInputChange}
                ></mobiscroll.Input>
              </div>
              <div style={{ margin: "9px 0" }}>
                <label>Short Name</label>

                <mobiscroll.Input
                  style={{ width: "100%" }}
                  id="_shortName"
                  type="text"
                  placeholder="Short Name"
                  name="_shortName"
                  required={true}
                  value={this.state.project._shortName}
                  onChange={this.handleInputChange}
                ></mobiscroll.Input>
              </div>
              <div style={{ margin: "9px 0" }}>
                <label>Description</label>

                <mobiscroll.Input
                  style={{ width: "100%" }}
                  id="_description"
                  type="text"
                  placeholder="Name"
                  name="_description"
                  required={true}
                  value={this.state.project._description}
                  onChange={this.handleInputChange}
                ></mobiscroll.Input>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "0 2em",
                }}
              >
                {this.state.click ? (
                  <>
                    <p id="msg">Please upload zip file</p>
                    <p id="msg2"></p>
                    <button
                      id="donebtn"
                      style={{ display: "none" }}
                      onClick={() => {
                        this.props.restartApp();
                        document.getElementById("mybtn").click();
                      }}
                      classname="load"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => this.props.restartApp()}
                      className="load"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="load">
                      Set up
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        }
      />
    );
  }
}
