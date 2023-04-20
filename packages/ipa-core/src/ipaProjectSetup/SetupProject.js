import React from "react";
import { IafProj, IafSession, IafScripts } from "@invicara/platform-api";
import * as PlatformApi from "@invicara/platform-api";
import { IafScriptEngine } from "@invicara/iaf-script-engine";
import _ from "lodash";
import GenericModal from "../IpaDialogs/GenericModal";
import "../IpaDialogs/ProjectPickerModal.scss";
import * as UiUtils from "@invicara/ui-utils";
import { mobiscroll } from "@invicara/invicara-lib";
import { IafDataSource } from "@invicara/platform-api";

export default class SetUpProject extends React.Component {
  constructor(props) {
    super(props);
    console.log("endPointConfig",endPointConfig);
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

  handleProjectSetUp = async (e, restartApp) => {
    e.preventDefault();
    console.log("called"); // console to know function is called
    this.setState({ click: true });
    let project = await IafProj.createProject(this.state.project); //Create Project
    console.log("project", project);
    let ctx = { _namespaces: project._list[0]._namespaces };
    ctx.authToken = IafSession.getAuthToken();
    await IafProj.switchProject(project._list[0]._id); //switch project using ID

    //get setupScript.js
    // let scriptFile = await fetch(
    //   `${endPointConfig.setupFileOrigin}`
    // );
    // let scriptContent = [`${await scriptFile.text()}`];
    // console.log("scriptFileTxt", scriptContent);
    // if (_.size(scriptContent) > 0) {
    //   let scriptItem = {
    //     _name: "Project Setup",
    //     _shortName: "iaf_ext_proj_setup",
    //     _description: "Scripts to Setup a Project",
    //     _userType: "iaf_ext_proj_setup",
    //     _namespaces: project._list[0]._namespaces,
    //     _version: {
    //       _userData: scriptContent[0],
    //     },
    //   };
    //   //create or replace script
    //   let results = await IafScripts.updateOrCreateScript(scriptItem, ctx);
    //   console.log("Result of create script", results);
    // }
    let myZipFile;
    await fetch("/scripts.zip") //fetch zip file using link
      .then((response) => response.blob())
      .then((blob) => {
        // Store the binary blob in a variable
        myZipFile = new Blob([blob], { type: "application/zip" });
      })
      .catch((error) => {
        console.error(error);
      });
    let zipFileObj = {
      //object of zip file to passed on _loadZipFile
      fileObj: myZipFile,
    };
    let configFiles = await UiUtils.IafLocalFile._loadZipFile(zipFileObj); //load all files using configFiles
    console.log("ConfigFiles", configFiles);

    let scriptFiles = [];
    var projectSetupData = await configFiles.files["scripts/setup.js"] // get setup.js
      .async("blob") //create blob
      .then(async function (fileData) {
        console.log("fileData", fileData);
        var data = new File([fileData], "setup.js"); //create file from blob
        console.log("data", data);
        var selectFile = data;
        var file = {
          // create file object in which file is stored
          fileObj: selectFile,
          size: selectFile.size,
          name: selectFile.name,
        };
        console.log("file", file);
        scriptFiles[0] = file;
      });
    if (_.size(scriptFiles) < 1) {
      return;
    }

    //Create Script
    let scriptContent = await UiUtils.IafLocalFile.loadFiles(scriptFiles);
    console.log("scriptContent", scriptContent);
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
      console.log("Result of create script", results);
    }

    //Orchestrator
    let orchestratorConfig = await IafScriptEngine.addDatasource({
      _name: "Upload Zip", //name of the orchestrator, can be anything
      _description: "Orchestrator run script.js",
      _namespaces: ctx._namespaces, //the namespace the orchestrator is created in
      _userType: "iaf_ext_proj_setup", // _userType for the orchestrator
      _params: {
        tasks: [
          // the ordered list of steps that are a part of the orchestrator
          {
            _sequenceno: 1, // the order of the task in the orchestrator, in this case first and only
            _name: "Run setup", // a name for the step in the orchestrator
            _orchcomp: "default_script_target", // this indicates that the task will execute a script
            _actualparams: {
              userType: "iaf_ext_proj_setup", // the _userType to use to load this script file
              _scriptName: "setUpProject", // the named script to run in the file above
            },
          },
        ],
      },
    });
    console.log(orchestratorConfig);

    //Fetch created orchestrator
    let projOrchList = await IafDataSource.getOrchestrators({}, ctx);
    console.log(projOrchList);
    let runSetupOrch = projOrchList._list.find(
      (o) => o._userType === "iaf_ext_proj_setup"
    );
    console.log(runSetupOrch);

    let datasourceRunRequest = {
      orchestratorId: runSetupOrch.id, // _id of the orchestrator to run
      _actualparams: [
        {
          // an array of the parameters we want to pass to each step when the orchestrator runs
          sequence_type_id: runSetupOrch.orchsteps[0]._compid, // this is how we identify the step receiving the parameters
          // in this case we only have one step so its always at index 0
          params: {
            ctx: JSON.stringify(ctx),
            project: project,
            zipLink: endPointConfig.zipFileOrigin
          },
        },
      ],
    };

    // run the orchestrator - this returns an orchestrator run item that indicates the orchestrator has been 'QUEUED'
    const orchRun = await IafDataSource.runOrchestrator(
      runSetupOrch.id,
      datasourceRunRequest,
      ctx
    );
    console.log("orchRun", orchRun);

    //Get Orchestrator Status
    const orchReqForRes = { runid: orchRun.id };
    console.log("handleProjectSetUp === orchReqForRes", orchReqForRes);

    //Check status afetr every 10 seconds
    let startTime = Date.now();
    const map_orch_timer = setInterval(async () => {
      let status = await IafScriptEngine.getDatasourceRunStatus(
        orchReqForRes,
        ctx
      );
      status = status.find((f) => f._usertype == "iaf_ext_proj_setup");
      console.log("handleProjectSetUp === SetupProject Run Status", status);
      switch (status._status) {
        case "COMPLETED":
          console.log("COMPLETED SetupProject", status);
          clearInterval(map_orch_timer);
          console.log("handleProjectSetUp === done");
          document.getElementById("donebtn").style.display = "block";
          document.getElementById("msg").innerHTML = "Setup Completed";
          break;
      
        case "ERROR":
          console.error("Error message", status.orchrunsteps[0]._statusmsg);
          var msgElem = document.getElementById("msg");
          msgElem.innerHTML = "Setup did not Complete, An error occured during setup!";
          msgElem.style.color = "red";
          clearInterval(map_orch_timer);
          break;
      
        default:
          let endTime = Date.now();
          let diffInSeconds = (endTime - startTime) / 1000;
          document.getElementById("msg").innerHTML =
            "Setup is in progress, please wait...";
          console.log(`Project setup running since ${diffInSeconds / 60} minutes.`);
          break;
      }
    }, 10000);

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
                  padding: "0 3em",
                }}
              >
                {this.state.click ? (
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p id="msg" style={{ marginRight: "10px",marginTop: "20px" }}>
                      Fetching Script...
                    </p>
                    <button
                      id="donebtn"
                      style={{ display: "none", marginLeft: "40px" }}
                      onClick={() => {
                        this.props.restartApp();
                      }}
                      className="done"
                    >
                      Done
                    </button>
                  </div>
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
