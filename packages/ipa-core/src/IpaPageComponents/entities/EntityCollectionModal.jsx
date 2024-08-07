import React from 'react';
import _ from "lodash";
import * as PropTypes from "prop-types";


import GenericMatButton from '../../IpaControls/GenericMatButton';
import {CreatableScriptedSelects} from "../../IpaControls/CreatableScriptedSelects";

import GenericModal from '../../IpaDialogs/GenericModal'

import '../../lib/mobiscroll.scss'
import './EntityCollectionModal.scss'



export default class EntityCollectionModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            working: false,
            error: null,
            showBody: true,
            modalOpen: false,
            selectedType: null,
            selectedCollections: [],
            reloadTrigger: true
          }
    }

    async componentDidMount() {
      
      if (!this.props.action.script || !this.props.action.component.scripts || !this.props.action.component.scripts.getCollectionTypes || !this.props.action.component.scripts.getCollectionNames){
        console.error('Collection Modal is missing required configured scripts!')
      }
      
    }

    async componentDidUpdate(prevProps, prevState) {

      if (this.state.modalOpen !== this.context.ifefModalOpen) {
        this.setState({modalOpen: this.context.ifefModalOpen});

        if (this.context.ifefModalOpen) {
          this.setState({showBody: false});
          
          let isSingleEntity = this.props.entity && typeof this.props.entity === 'object' && !Array.isArray(this.props.entity)
          let isArrayOfEntites = Array.isArray(this.props.entity) && !!this.props.entity.length
          if (isSingleEntity || isArrayOfEntites)
            this.setState({error: null, selectedType: null, selectedCollections: [], showBody: true, reloadTrigger: !this.state.reloadTrigger});
        }
      }
    }

    getSelectedVal = (valContainer) => {

      let keys = valContainer ? Object.keys(valContainer) : []
      
      if (keys.length) {
        let typeKey = keys[0]

        return valContainer[typeKey][0]
      } else
        return null 

    }
    
    getFilterInfo = () => {
      
      let value = this.getSelectedVal(this.state.selectedType)
      
      if (value)
        return {query: {'properties.Type.val': value}}
      else
        return {query: null}
    }
    
    isValidCollection = (collection) => {
      return !!collection.type && !collection.type !== "" && !!collection.name && !collection.name !== ""
    }

    onChange = async (att, value) => {

      if (att === 'type') {
        
        if (this.getSelectedVal(value))
          this.setState({selectedType: value})
        else
          this.setState({selectedType: null})
      } else {
        let newCollToAdd = {
          type: this.getSelectedVal(this.state.selectedType).trim(),
          name: this.getSelectedVal(value).trim()
        }
        
        //check it is valid and not already added
        if (this.isValidCollection(newCollToAdd) && !_.find(this.state.selectedCollections, newCollToAdd)) {
          let tempColls = [...this.state.selectedCollections]
          tempColls.unshift(newCollToAdd)
          this.setState({selectedCollections: tempColls})
        }
      }
    }
    
    removeCollection = (coll) => {

      this.setState({selectedCollections: _.without(this.state.selectedCollections, coll)})
    }

    onCancel = async () => {
      if (this.props.action.onCancel) this.props.action.onCancel();
      this.context.ifefShowModal(false);
    }

    onSave = async () => {
      this.setState({working: true, error: null});
      
      if (this.props.action.doEntityAction && !!this.state.selectedCollections.length) {
        
        let entityAndCollInfo = {
          collections: this.state.selectedCollections,
          entities: Array.isArray(this.props.entity) ? this.props.entity : [this.props.entity]
        }
        
        let result = await this.props.action.doEntityAction(this.props.action.name, entityAndCollInfo)
        
        if (result?.success) {
          this.context.ifefShowModal(false);
          if (!!this.props.action.onSuccess) this.props.action.onSuccess(this.props.action.type, result.entity ? result.entity : this.props.entity, result);
        } else {
          console.error(result.message)
          let error = (<div className="entity-modal-error">
            {result.message}
          </div>);

          this.setState({working: false, error: error});
          if(!!this.props.action.onError) this.props.action.onError(this.props.action.type, result, this.props.entity);
        }
      }
      
      this.setState({working: false, error: null});
    }

    render() {
 
      let title = <span><i style={{fontSize: '1.5em'}} className={this.props.action.component.icon || "icofont-cubes"}></i> Add to Collection</span>;
      let body = this.state.showBody ? <div className="entity-collection-modal-body">
          <CreatableScriptedSelects
            currentValue={this.state.selectedType}
            script={this.props.action.component.scripts.getCollectionTypes}
            reloadTrigger={this.state.reloadTrigger}
            onChange={(val) => this.onChange('type', val)}
            multi={false}
            disabled={this.state.working}
          />
          <CreatableScriptedSelects
            script={this.props.action.component.scripts.getCollectionNames}
            filterInfo={this.getFilterInfo()}
            onChange={(val) => this.onChange('name', val)}
            multi={false}
            disabled={this.state.working || !this.state.selectedType}
          />
          <div className="selected-collections">
            <span className="selected-collections-title">Adding to:</span>
            <div className="selected-collections-display">
              {this.state.selectedCollections.map(coll => <div className="selected-collections-display-row" key={coll.type+":"+coll.name}>
                <span className="selected-collection-name-combo">{coll.type + ": " + coll.name}</span>
                <span className="clear-selected-collection" onClick={() => this.removeCollection(coll)}><i className="fas fa-times"></i></span>
              </div>)}
            </div>
          </div>
          </div> : <div>
            Nothing selected to add to Collections. Please close the dialog and select some items to add to Collections.
          </div>
        
        
      let modalBody = <div className='mbsc-grid'>
              {body}
              <hr/>
              {this.state.error}
              <div style={{width: '100%', display: 'inline-flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                <GenericMatButton onClick={this.onCancel} disabled={this.state.working} styles={{marginRight: '15px'}}>Cancel</GenericMatButton>
                <GenericMatButton onClick={this.onSave} customClasses="attention" disabled={this.state.working || !this.state.selectedCollections.length}>{this.props.action.component.okButtonText ? this.props.action.component.okButtonText : 'OK'}</GenericMatButton>
              </div>
          </div>;

      return <GenericModal
              title={title}
              customClasses={'ipa-modal ipa-modal-no-x-close ipa-modal-small'}
              modalBody={modalBody} />
    }
}

EntityCollectionModal.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefSnapper: PropTypes.object,
  ifefNavDirection: PropTypes.string,
  ifefShowPopover: PropTypes.func,
  ifefUpdatePopover: PropTypes.func,
  ifefUpdatePopup: PropTypes.func,
  ifefShowModal: PropTypes.func,
  ifefModalOpen: PropTypes.bool
};


  export const EntityCollectionModalFactory = {
    create: ({type, action, entity, context, reduxStore, showModal}) => {
      let modal = <EntityCollectionModal action={action} entity={entity} type={type} />
      if(context.ifefShowModal) {
        context.ifefShowModal(modal);
      } else {
        showModal(modal)
      }
      return modal
    }
}
