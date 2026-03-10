import React from "react";
import _ from "lodash";

//TODO Most of this logic (probably all) should be gradually moved to thunks and the reducer in the entities store
const withEntityAvailableGroups = WrappedComponent => {
    const EntityGroupsHOC =  class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                availableDataGroups: _.cloneDeep(this.props.initialAvailableDataGroups)
            };
        }

        onDataGroupAvailable = (entityType, dataGroupName, val) => {
            let availableDataGroups = Object.assign({}, this.state.availableDataGroups)
            availableDataGroups[entityType] = availableDataGroups[entityType] || {}
            availableDataGroups[entityType][dataGroupName] = val
            this.setState({availableDataGroups})
        }

        onDataGroupsLoaded = () => {
            this.setState({loadingAvailableDataGroups: false})
        }

        setAvailableDataGroups = (entity, propertiesOnly, detailedEntity) => {

            //reset all available groups
            this.setState({availableDataGroups: _.cloneDeep(this.props.initialAvailableDataGroups), loadingAvailableDataGroups : true})
            if(entity) {
                this.props.findAvailableDataGroups(detailedEntity ? detailedEntity : entity, propertiesOnly, entity ? this.props.currentEntityType.singular : undefined, this.onDataGroupAvailable, this.onDataGroupsLoaded)
            }
        };


        async componentDidMount() {
            this.selectedEntitiesEffect();
        }

        componentDidUpdate(prevProps, prevState, snapshot) {
            //     Called inside Entity Handler/EntityDetailPanel                Called inside the Navigator/EntityDetailBottomPanelContent
            if((prevProps.selectedEntities !== this.props.selectedEntities) || (prevProps.detailedEntity !== this.props.detailedEntity)) {
                this.selectedEntitiesEffect()
            }
        }

        selectedEntitiesEffect(){
            if (this.props.selectedEntities.length) {
                this.setAvailableDataGroups(this.props.selectedEntities[0], false, this.props.detailedEntity)
            }
        }

        render() {
            const wrappedProps = {...this.props, ...this.state}
            return <WrappedComponent {...wrappedProps} setAvailableDataGroups={this.setAvailableDataGroups}/>
        }
    }

    return EntityGroupsHOC;
};

export default withEntityAvailableGroups;
