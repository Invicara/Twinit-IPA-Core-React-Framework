import React from 'react';
import _ from "lodash";
import Select from 'react-select';
import * as PropTypes from "prop-types";


import GenericMatButton from '../../IpaControls/GenericMatButton';

import GenericModal from '../../IpaDialogs/GenericModal'
import ScriptHelper from '../../IpaUtils/ScriptHelper'
import '../../lib/mobiscroll.scss'
import './EntityRelationsModal.scss'


export default class EntityRelationsModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            working: false,
            error: null,
            modalOpen: false,
            currentType: null,
            currentRelatedEntities: []
          }
    }
    
    asSelectOption = option => ({value: option, label: option, key: option})

    asSelectOptions = options => options.map(this.asSelectOption)

    async componentDidMount() {
      
      if (!this.props.action.component.types.length)
        console.error("EntityRelationsModal configuration missing entities types!")
      if (!this.props.action.script || !this.props.action.component.scripts || !this.props.action.component.scripts.getRelatedEntities)
        console.error("EntityRelationsModal configuration missing scripts!")
    }

    async componentDidUpdate(prevProps, prevState) {

      if (this.state.modalOpen !== this.context.ifefModalOpen) {
        this.setState({modalOpen: this.context.ifefModalOpen});

        if (this.context.ifefModalOpen) {
          this.setState({
            working: true,
            currentType: this.asSelectOption(this.props.action.component.types[0]),
            currentRelatedEntities: [],
            error: null
          },
          this.getEntitiesForCollection)
        }
      }
    }
    
    onTypeChange = (option) => {
      this.setState({currentType: option, error: null}, this.getEntitiesForCollection)
    }
    
    getEntitiesForCollection = async () => {
      
      this.setState({error: null})
      let scriptPayload = {entityType: this.state.currentType.value, collection: this.props.entity}
      
      ScriptHelper.executeScript(this.props.action.component.scripts.getRelatedEntities, scriptPayload).then((entities) => {
        this.setState({working: false, currentRelatedEntities: entities})
      });
      
    }
    
    removeRelation = (relatedEntity) => {
      
      ScriptHelper.executeScript(this.props.action.script, {removeEntities: [relatedEntity], removeFrom: [this.props.entity], entityType: this.state.currentType.value}).then((result) => {
        
        if (result?.success) {
          this.getEntitiesForCollection()
        } else {
          this.setState({error: "An error occured removing relations!"})
        }
        
      })
      
    }

    onCancel = async () => {
      if (this.props.action.onSuccess) this.props.action.onSuccess(this.props.action.type, this.props.entity, this.props.entity);
      this.context.ifefShowModal(false);
    }

    render() {
 
      let title = <span><i style={{fontSize: '1.5em'}} className="icofont-link"></i> {this.props.action.component.title ? this.props.action.component.title : "Manage Relations"}</span>
      let body = <div className="entity-relations-modal-body">
        <Select
          options={this.asSelectOptions(this.props.action.component.types)}
          value={this.state.currentType}
          isDisabled={this.state.working || this.props.action.component.types.length === 1}
          onChange={this.onTypeChange}
        />
        <hr/>
        <div className="relations">
          {!this.state.currentRelatedEntities?.length && <div>No data</div>}
          {!!this.state.currentRelatedEntities?.length && this.state.currentRelatedEntities?.map(re => <div key={re._id} className="selected-relations-display-row">
              <span className="remove-from-collection" onClick={() => this.removeRelation(re)}><i className="fas fa-times"></i></span>      
              <span className="selected-relations-name-combo">{re['Entity Name']}</span>
            </div>
          )}
        </div>
      </div>
        
      let modalBody = <div className='mbsc-grid'>
              {body}
              <hr/>
              {this.state.error}
              <div style={{width: '100%', display: 'inline-flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                <GenericMatButton onClick={this.onCancel} disabled={this.state.working} styles={{marginRight: '15px'}}>Close</GenericMatButton>
              </div>
          </div>;

      return <GenericModal
              title={title}
              customClasses={'ipa-modal ipa-modal-no-x-close ipa-modal-small'}
              modalBody={modalBody} />
    }
}

EntityRelationsModal.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefSnapper: PropTypes.object,
  ifefNavDirection: PropTypes.string,
  ifefShowPopover: PropTypes.func,
  ifefUpdatePopover: PropTypes.func,
  ifefUpdatePopup: PropTypes.func,
  ifefShowModal: PropTypes.func,
  ifefModalOpen: PropTypes.bool
};

export const EntityRelationsModalFactory = {
  create: ({type, action, entity, context}) => {
    let modal = <EntityRelationsModal action={action} entity={entity} type={type} />
    context.ifefShowModal(modal);
    return modal
  }
}
