import React from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber"

//import ENTITY_DATA_COMPONENTS from "./EntityDataComponents"
import {getEntityDataComponent} from '../../redux/slices/entityUI'
import clsx from "clsx";
import _ from 'lodash'

class EntityDataContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fetching: true,
            data: null,
            collapsed: props.config.hasOwnProperty('isProperties') ? !props.config.isProperties : true,
            myInterval: null
        }
    }

    async componentDidMount() {

        const {dataGroupName, config, entity, getData} = this.props
        let data = config.isProperties ? entity.properties : !this.props.collapsable ? await getData(dataGroupName, entity) : []
        this.setState({data, fetching: false})
       
        if (config.refreshInterval) {
          
          if (config.refreshInterval < config.scriptExpiration)
            console.warn("Refresh Interval is less than Script Expiration which will cause cached data to be used instead fetching new data!")
          
          let myInterval = setInterval(() => {
            console.log('Refreshing data')
            this.getContainerData()
          }, config.refreshInterval*60000)
          this.setState({myInterval})
        }
    }
    
    componentDidUpdate(prevProps) {
        if (!_.isEmpty(this.props.entity)) {
            if (!_.isEmpty(prevProps.entity)) {
                let dataNeedsUpdate =
                    (this.props.entity._id !== prevProps.entity._id) // different entity
                    || (this.props.entity.lastUpdate && !prevProps.entity.lastUpdate) // first update
                    || (this.props.entity.lastUpdate > prevProps.entity.lastUpdate) // subsequent updates
        
                if (dataNeedsUpdate) {
                    this.getContainerData()
                }
            } else this.getContainerData()
        }
    }
    
    componentWillUnmount() {
      if (this.state.myInterval) clearInterval(this.state.myInterval)
    }
    
    getContainerData = async () => {
      const {dataGroupName, config, entity, getData} = this.props
      let data = config.isProperties ? entity.properties : await getData(dataGroupName, entity)
      this.setState({data})
    }

    toggleCollapsed = async () => {

        const {dataGroupName, config, entity, getData} = this.props

        if (this.state.collapsed) {
            let data = config.isProperties ? entity.properties : await getData(dataGroupName, entity)
            // console.log("new data", data)
            this.setState({data})
        } else
            this.setState({data: null})

        this.setState({collapsed: !this.state.collapsed})
    }

    getEntityDataComponent = () => {
        if (this.state.fetching)
            return <SimpleTextThrobber throbberText="Retrieving data"/>
        else if (this.state.data == null || (Array.isArray(this.state.data) && this.state.data.length == 0))
            return <div>No data</div>

        const {config, entity} = this.props
        //let factory = ENTITY_DATA_COMPONENTS[config.component.name]
        let factory = this.props.getEntityDataComponent(config.component.name)
        if (!factory) {
            console.error("No factory for " + config.component.name)
            return null
        }
        // console.log("last update = ", this.props.lastUpdate)
        // console.log("calling factory create with data=", this.state.data)        
        return factory.create({config: config.component, data: this.getEntityData(config)})
    }

    getEntityData = (config) => {        
        return config.component.hidden ? 
        Array.isArray(this.state.data) ? this.getArrayWithoutHiddenData(config) : this.getObjectWithoutHiddenData(config) : this.state.data;
    }

    getArrayWithoutHiddenData(config){
        const hidden = config.component.hidden || [];
        const indexesToHide = hidden.map(e => _.findIndex(this.state.data[0], (o) => o == e));
        return  this.state.data.map(e =>  
            Array.isArray(e) ? 
             e.filter((o, index) => 
                 !indexesToHide.includes(index)
                ): e
        );
    }

    getObjectWithoutHiddenData(config){
        return _.omit(this.state.data, ...(config.component.hidden || []));
    }

    render() {
        return (
            <div className="entity-data-container">
                <h1 className="entity-data-stack-title">
                    {this.props.dataGroupName}
                    {
                        this.props.collapsable &&
                        <div className={clsx({
                            'entity-data-toggle': true,
                            'entity-data-toggle-collapsed': this.state.collapsed
                        })}>
                            <i onClick={this.toggleCollapsed} className="fa fa-angle-down"/>
                        </div>
                    }
                </h1>
                {(!this.props.collapsable || (this.props.collapsable && !this.state.collapsed)) &&
                <div className={clsx({'entity-data-content': false, 'entity-data-content-collapsed': false})}>
                    {this.getEntityDataComponent()}
                </div>}
            </div>
        )
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
    getEntityDataComponent
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(EntityDataContainer)
