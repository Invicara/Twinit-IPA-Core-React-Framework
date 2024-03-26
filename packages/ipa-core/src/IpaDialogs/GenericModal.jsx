import React from 'react';
import {IfefModal} from '@invicara/react-ifef';
import './GenericModal.scss'

class GenericModal extends React.Component {

  componentDidMount(){
    window.scrollTo(0, 0)
  }

  render() {
    const {title, modalBody, modalType, placeHolder, closeButtonHandler, width, height, noPadding, noBackground} = this.props;

    return (
      <IfefModal customTemplate={this.props.customTemplate ? this.props.customTemplate : false}
                 title={title}
                 barClasses={this.props.barClasses ? this.props.barClasses : "bar-dark"}
                 closeButtonHandler={closeButtonHandler}
                 modalType={modalType}
                 placeHolder={placeHolder}
                 width={width}
                 height={height}
                 padding={!noPadding}
                 customClasses={this.props.customClasses ? this.props.customClasses : "ipa-modal"}>
        <div style={{padding: noPadding? '0':'3% 10%', fontSize: '16px', background: noBackground? 'transparent' : 'white', height:'100%'}}>

            {modalBody}

        </div>
      </IfefModal>
    );
  }
}

export default GenericModal;