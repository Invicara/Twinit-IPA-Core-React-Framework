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
    console.log("endPointConfig", endPointConfig);
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
    if(projects !== undefined){
    for (let index = 0; index < projects.length; index++) {
      await IafProj.delete(projects[index]);
    }
  }
    this.setState({ isDeleting: false });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleProjectSetUp = async (e, restartApp) => {
    console.log("called"); // console to know function is called
    e.preventDefault();
    await this.deletePreviousProject();
    this.setState({ click: true, open: false });
    let project = await IafProj.createProject(this.state.project); //Create Project
    this.setState({ createdProject: project });
    console.log("project", project);
    let ctx = { _namespaces: project._list[0]._namespaces };
    ctx.authToken = IafSession.getAuthToken();
    await IafProj.switchProject(project._list[0]._id); //switch project using ID

    // get setupScript.js
    let scriptFile = await fetch(`${endPointConfig.setupFileOrigin}`);
    let scriptContent = [`${await scriptFile.text()}`];
    console.log("scriptFileTxt", scriptContent);
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
      //create or replace script
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
            zipLink: endPointConfig.zipFileOrigin,
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
          document.getElementById("msg").textContent = "Setup Completed";
          break;

        case "ERROR":
          console.error("Error message", status.orchrunsteps[0]._statusmsg);
          var msgElem = document.getElementById("msg");
          clearInterval(map_orch_timer);
          msgElem.textContent =
            "Setup did not Complete, An error occured during setup!";
          msgElem.style.color = "red";
          break;

        default:
          let endTime = Date.now();
          let diffInSeconds = (endTime - startTime) / 1000;
          document.getElementById("msg").textContent =
            "Setup is in progress, please wait...";
          console.log(
            `Project setup running since ${diffInSeconds / 60} minutes.`
          );
          break;
      }
    }, 10000);
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
                <form style={{ width: "100%" }} onSubmit={this.handleClickOpen}>
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
                  padding: "0 3em",
                }}
              >
                {this.state.click ? (
                <div style={{ display: "flex", alignItems: "center", marginLeft: "-3em" }}>
                  <button
                    id="donebtn"
                    style={{ display: "none", marginRight: "40px" }}
                    onClick={() => this.props.restartApp()}
                    className="done"
                  >
                    Done
                  </button>
                  <p id="msg" style={{ marginLeft: "10px",width:"300px",marginTop:"20px" }}>
                    Fetching Script...
                  </p>
                </div>
                ):(
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
           {this.state.open && !this.state.isDeleting ? (
             <div style={{ float: "left" }}>
               By Clicking on Agree button you are confirming that, All
               previously created projects and invited projects will get
               deleted from your account.
               <div>
               <button onClick={() => this.props.restartApp()} style={{ float: "left" }}>
                 Disagree
               </button>
               <button onClick={this.handleProjectSetUp} style={{ float: "left" }} autoFocus>
                 Agree
               </button>
               </div>
             </div>
           ) : (
             <div></div>
           )}
         </div>
       }
     />
   </div>
 );
}
}