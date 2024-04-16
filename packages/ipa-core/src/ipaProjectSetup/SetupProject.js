import React from "react";
import { IafProj, IafSession, IafScripts, IafPassSvc } from "@invicara/platform-api";
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
    this.state = {
      createdProject: null,
      project: {
        _description: "",
        _name: "",
        _shortName: "",
        _userAttributes: { nextScriptEngine: true },
        click: false,
      },
      projects: [],
      ProjSetupModule: undefined,
      scripts: undefined,
      open: false,
      isDeleting: false,
      isDoneButtonClicked: false
    };
    this.ref = React.createRef();
  }

  handleInputChange = (e) => {
    const { id, value } = e.target;
    this.setState({ project: { ...this.state.project, [id]: value } });
  };

  async deletePreviousProject() {
    const { projects } = this.props;
    this.setState({ isDeleting: true });
    let user = await IafPassSvc.getCurrentUser();
    try {
      if (projects !== undefined) {
        for (let i = 0; i < projects.length; i++) {
          if (
            projects[i]._metadata._createdById === user._id
          ) {
            console.log("Delete project:", projects[i]);
            await IafProj.delete(projects[i]);
          }
          else {
            console.error("Cannot delete invited project")
          }
        }
      }
    }catch (error){
    console.error("Some items being deleted in the old project do not exist.")
    }
    this.setState({ isDeleting: false });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  async createScripts(projectList, ctx) {
    let project = projectList._list[0];
    let scriptsDescriptors = [
      {
        _name: "Upload Scripts",
        _shortName: "uploadRunnableScripts",
        _description: "Upload all Scripts",
        _userType: "uploadRunnableScripts",
      },
      {
        _name: "User Config Import",
        _shortName: "configUpload",
        _description: "Upload config files",
        _userType: "configUpload",
      },
      {
        _name: "Upload bimpk file",
        _shortName: "uploadBimpk",
        _description: "Upload and extract bimpk files",
        _userType: "uploadBimpk",
      },
      {
        _name: "Create Collections",
        _shortName: "createCollections",
        _description: "Create collections",
        _userType: "createCollections",
      },
      {
        _name: "Import File Attributes",
        _shortName: "fileAttributesImport",
        _description: "Import File Attributes",
        _userType: "fileAttributesImport",
      },
      {
        _name: "Import Api Config",
        _shortName: "apiConfigImport",
        _description: "Import Api Config File",
        _userType: "apiConfigImport",
      },
    ];

    //Fetch Zip
    let myZipFile;
    await fetch(`${endPointConfig.setupZipFileOrigin}`) //fetch zip file using link
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
    let scriptFiles = await UiUtils.IafLocalFile._loadZipFile(zipFileObj); //load all files using scriptFiles

    let scripts = [];
    const scriptNames = [
      "uploadRunnableScripts",
      "configUpload",
      "uploadBimpk",
      "createCollections",
      "fileAttributesImport",
      "apiConfigImport",
    ];
    for (let i = 0; i < scriptNames.length; i++) {
      const scriptName = scriptNames[i];
      const scriptContent = await scriptFiles.files[
        `setupScripts/${scriptName}.js`
      ].async("string");
      scripts.push({ scriptName, scriptContent });
    }

    //* Adding more information like version and namesapce
    let scriptItems = [];
    scripts.forEach((c) => {
      let item = scriptsDescriptors.find(
        (obj) => obj._shortName === c.scriptName
      );
      if (item) {
        //TODO: use javascript stringify, not JSON stringify
        item._version = { _userData: c.scriptContent };
        item._namespaces = project._namespaces;
        scriptItems.push(item);
      }
    });
    console.log("Script items with information.", scriptItems);

    //* Creating script in project
    //TODO: create scripts
    let createScriptRes = await PlatformApi.IafScripts.create(scriptItems, ctx);
    console.log("Scripts are Created", createScriptRes);
  }

  handleProjectSetUp = async (e, restartApp) => {
    console.log("called"); // console to know function is called
    e.preventDefault();
    //check multiple projects are allowed, if not delete previous project
    !this.props.allowMultipleProjects && await this.deletePreviousProject();
    this.setState({ click: true, open: false });
    let project = await IafProj.createProject(this.state.project); //Create Project
    this.setState({ createdProject: project });
    console.log("project", project);
    let ctx = { _namespaces: project._list[0]._namespaces };
    ctx.authToken = IafSession.getAuthToken();
    const div = document.getElementById("msg"); //div selector
    await IafProj.switchProject(project._list[0]._id); //switch project using ID
    // get setupScript.js
    await this.createScripts(project, ctx);
    //Orchestrator
    await runOrchestrator();
    //Orchestrator is wrapped inside function to avoid running parallel with createScripts
    async function runOrchestrator() {
      let orchestratorConfig = await IafScriptEngine.addDatasource({
        _name: "Setup Project",
        _description: "Run all scripts needed for setup",
        _namespaces: ctx._namespaces,
        _userType: "setup_runner",
        _params: {
          tasks: [
            // the ordered list of steps that are a part of the orchestrator
            {
              _sequenceno: 1,
              _name: "Uploading User Scripts:",
              _orchcomp: "default_script_target",
              _actualparams: {
                userType: "uploadRunnableScripts",
                _scriptName: "uploadScripts", // the named script to run in the file above
              },
            },
            {
              _sequenceno: 2,
              _name: "Creating User Configurations:",
              _orchcomp: "default_script_target",
              _actualparams: {
                userType: "configUpload",
                _scriptName: "userConifgImports", // the named script to run in the file above
              },
            },
            {
              _sequenceno: 3,
              _name: "Uploading Model File:",
              _orchcomp: "default_script_target",
              _actualparams: {
                userType: "uploadBimpk",
                _scriptName: "bimpkOperations", // the named script to run in the file above
              },
            },
            {
              _sequenceno: 4,
              _name: "Creating Collections:",
              _orchcomp: "default_script_target",
              _actualparams: {
                userType: "createCollections",
                _scriptName: "createCollections", // the named script to run in the file above
              },
            },
            {
              _sequenceno: 5,
              _name: "Importing File Attributes:",
              _orchcomp: "default_script_target",
              _actualparams: {
                userType: "fileAttributesImport",
                _scriptName: "fileAttributesImport", // the named script to run in the file above
              },
            },
            {
              _sequenceno: 6,
              _name: "Importing OMAPI Configurations:",
              _orchcomp: "default_script_target",
              _actualparams: {
                userType: "apiConfigImport",
                _scriptName: "apiConfigImport", // the named script to run in the file above
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
        (o) => o._userType === "setup_runner"
      );
      console.log(runSetupOrch);

      let datasourceRunRequest = {
        orchestratorId: runSetupOrch.id,
        _actualparams: [
          {
            // an array of the parameters we want to pass to each step when the orchestrator runs
            sequence_type_id: runSetupOrch.orchsteps[0]._compid,

            // in this case we only have one step so its always at index 0
            params: {
              ctx: JSON.stringify(ctx),
              project: project,
              zipLink: endPointConfig.projectZipFileOrigin,
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
        status = status.find((f) => f._usertype == "setup_runner");
        console.log("SetupProject Run Status", status);
        switch (status._status) {
          case "COMPLETED":
            console.log("COMPLETED SetupProject", status);
            clearInterval(map_orch_timer);
            console.log("handleProjectSetUp === done");
            div.style.display = "none";
            document.getElementById("donebtn").style.display = "block";
            break;

          case "RUNNING":
            let endTime = Date.now();
            let diffInSeconds = (endTime - startTime) / 1000;
            console.log(
              `Project setup running since ${(diffInSeconds / 60).toFixed(
                2
              )} minutes.`
            );

            let messageArray = [];
            let sequencedOrchSteps = status.orchrunsteps.sort(
              (a, b) => a._sequenceno - b._sequenceno
            );
            messageArray = sequencedOrchSteps.map((x) => {
              return x._name + "   " + x._status;
            });
            div.style.display = "block";
            div.innerHTML = "";
            messageArray.forEach((x) => {
              const [name, status] = x.split("   ");
              div.innerHTML += `<div style="display:flex; flex-direction:row; justify-content: space-between;"><p style="font-size: 15px; margin:1px; padding-left:5px">${name}</p><p style="font-size: 15px; margin:1px; padding-right:5px">${status}</p></div>`;
            });
            break;

          case "ERROR":
            console.error("Error message", status.orchrunsteps[0]._statusmsg);
            clearInterval(map_orch_timer);
            div.style.display = "block";
            div.innerHTML =
              "Setup did not Complete, An error occured during setup!";
            div.style.color = "red";
            break;

          default:
            div.style.display = "block";
            div.innerHTML = "Setup is in progress, please wait...";
            break;
        }
      }, 10000);
    }
  };

  render() {
    const title = <span>Setup Project</span>;
    return (
      <div>
        <GenericModal
          title={title}
          modalBody={
            <div className="project-picker-modal">
              {!this.state.open && (
                <form style={{ width: "100%" }} onSubmit={!this.props.allowMultipleProjects? this.handleClickOpen : this.handleProjectSetUp}>
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
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {this.state.click ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          margin: "auto",
                          width: "100%",
                        }}
                      >
                        <div
                          id="msg"
                          style={{
                            display: "none",
                            minWidth: "100%",
                            marginTop: "10px",
                            padding: "15px",
                            overflowY: "auto",
                            maxHeight: "95px",
                            backgroundColor: "#EEEEEE",
                          }}
                        ></div>

                        <button
                          id="donebtn"
                          style={{ display: "none", minWidth: "100px" }}
                          onClick={() => {
                            this.setState({isDoneButtonClicked: true});
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
              )}
              {this.state.open && !this.state.isDeleting && !this.state.isDoneButtonClicked && 
                <div style={{ float: "left" }}>
                  By Clicking on Agree button, the previously created projects by you would be deleted and this new project would be created.
                  <div>
                    <button
                      onClick={() => this.props.restartApp()}
                      style={{ float: "left" }}
                    >
                      Disagree
                    </button>
                    <button
                      onClick={this.handleProjectSetUp}
                      style={{ float: "left" }}
                      autoFocus
                    >
                      Agree
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        />
      </div>
    );
  }
}
