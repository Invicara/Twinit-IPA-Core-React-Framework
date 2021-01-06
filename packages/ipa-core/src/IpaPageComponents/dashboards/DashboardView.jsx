/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React from "react"

import {produce} from "immer"
import _ from 'lodash'
import FileHelpers from "../../IpaUtils/FileHelpers"
import GenericMatButton from "../../IpaControls/GenericMatButton";

import ScriptHelper  from "../../IpaUtils/ScriptHelper"
import {getDashboardComponent} from '../../redux/slices/dashboardUI'
import {compose} from "redux";
import {connect} from "react-redux";

import './DashboardView.scss'

class DashboardView extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
          reactorInfo: {},
          isPageLoading: true,
          panels: [],
          preloadImageUrls: []
        }
    }

    async componentDidMount() {
        this.setState({isPageLoading: false}, this.props.onLoadComplete)
        this.validateConfig()
        this.generatePanels()
        console.log('props', this.props)
        console.log('state', this.state)
        
        if (this.props.handler.config.preloadImages) {
          let images = this.props.handler.config.preloadImages
          let urls = []
          
          for (let i = 0; i < images.length; i++) {
            urls.push(await FileHelpers.getFileUrlForFilename(images[i]))
          }
          
          this.setState({preloadImageUrls: urls})
          
        }
    }
    
    async componentDidUpdate(prevProps, prevState) {
      
      console.log(prevState, this.state)
      
      if (!_.isEqual(prevState.reactorInfo, this.state.reactorInfo)) {
        this.generatePanels()
      } else console.log('no update')
      
    }
    
    generatePanels = async () => {
      
      let config = this.props.handler.config
        let panels = []
        
        if (config.layout === 'fullpage')
          panels = await this.getComponent(config)
        else if (config.layout === 'grid') {
          
          let panelEntries = Object.entries(config.panels)
        
          panels = await Promise.all(panelEntries.map(async ([name, panelConfig]) => {
            let component = await this.getComponent(panelConfig)
            return this.getPanel(name, panelConfig, component)
          }))
        }
        
        this.setState({panels})
    }

    validateConfig = () => {
        const testFor = (c, x) => {
            
            if (Array.isArray(x)) {
              let hasAny = false
              for (let i = 0; i < x.length; i++) {
                if (!!c[x[i]]) {
                  hasAny = true
                  break
                }
              }
              
              if (!hasAny) throw ('Dashboard Config missing ' + x.join(' or '))
            }
            else if (!c[x]) throw (`Dashboard Config missing ${x}`)
        }
        
        let config = this.props.handler.config
        testFor(config, "layout")
        switch (config.layout) {
            case 'fullpage':
                testFor(config, ["component", "componentScript"])
                break;
            case 'grid':
                testFor(config, "rows")
                testFor(config, "columns")
                testFor(config, "panels")
                Object.keys(config.panels).forEach(p => {
                    testFor(config.panels[p], ["component", "componentScript"])
                })
                break;
            default:
                throw("Dashboard Config unrecognized layout value")
        }
    }

    getComponent = async (config) => {
        let Component = null
        let componentInfo = null
        //if (config.component) Component = DASHBOARD_COMPONENTS[config.component]
        if (config.component) Component = this.props.getDashboardComponent(config.component)
        else if (config.componentScript) {
          componentInfo = await ScriptHelper.executeScript(config.componentScript, {reactorInfo: this.state.reactorInfo})
          if (componentInfo && componentInfo.component) Component = this.props.getDashboardComponent(componentInfo.component)
        }
        
        if (!Component) {
            return (
                <div
                    style={{
                        backgroundColor: "lightgray",
                        borderRadius: "10px",
                        border: "dashed black 5px",
                        margin: "5px",
                        padding: "10px",
                        fontWeight: "bold",
                        height: "98%",
                        fontSize: "150%"
                    }}
                >
                    Unknown component: {config.component}
                </div>
            ) 
        }
        
        let reactiveOptions = {
          onClick: config.reactor ? this.onClick : null,
          reactorInfo: config.reactee ? this.state.reactorInfo : null
        }

        return <Component {...config} {...reactiveOptions} {...componentInfo} dashboard={this}/>
    }

    doAction = (action) => {
        if (!action || action.type != "navigate") {
            console.error("This dashboard only knows how to navigate...")
            return
        }
        this.props.onNavigate(action.navigateTo, action.query)
    }

    getPanel = (key, config, component) => {
        const layout = (el) => {
            if (!el) return
            if (config.position) {
                el.style.gridColumn = `${config.position.left} / ${config.position.right}`
                el.style.gridRow = `${config.position.top} / ${config.position.bottom}`
            }
        }
        return (
            <div className="db-panel" ref={layout} key={key}>
                {component}
            </div>
        )
    }

    onClick = (reactorInfo) => {
      let nextState = produce(this.state.reactorInfo, draftState => {
        
        if (!reactorInfo || !Object.keys(reactorInfo).length) {
          let keys = Object.keys(draftState)
          keys.forEach((key) => {
            delete draftState[key]
          })
        }
        else
          draftState = Object.assign(draftState, reactorInfo)
      })
      this.setState({reactorInfo: nextState})
    }

    render() {
        let config = this.props.handler.config;
        let cn = this.props.handler.config.className || ""
        switch (config.layout) {
            case 'fullpage':
                cn += " dashboard"
                break
            case 'grid':
                cn += " dashboard db-grid"
                break
        }

        let style = {}
        if (config.layout == "grid") {
            style.gridTemplateColumns = `repeat(${config.columns}, ${100 / config.columns}%)`
            style.gridTemplateRows = `repeat(${config.rows}, ${100 / config.rows}%)`
        }

        return (
            <div>
              {!!this.state.preloadImageUrls.length && <div id="hiddenimages" style={{display: "none"}}>
                {this.state.preloadImageUrls.map(imageurl => <img src={imageurl} key={imageurl}/>)}
              </div>}
              {config.headerInfo && <div className="dashboard-header">
                {config.headerInfo.title && <div className="title">{config.headerInfo.title}</div>}
                {config.headerInfo.navButton && <div className="nav-button">
                  <GenericMatButton customClasses="main-button" onClick={e => this.doAction(config.headerInfo.navButton.action)}>{config.headerInfo.navButton.title}</GenericMatButton>
                </div>}
              </div>}
              <div className={cn} style={style}>
                {this.state.panels}
              </div>
            </div>
            
        )
    }
}

//export default withAppContext(withGenericPage(DashboardView))
const mapStateToProps = state => ({});

const mapDispatchToProps = {
    getDashboardComponent
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(DashboardView)