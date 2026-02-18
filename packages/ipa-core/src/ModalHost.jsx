import React from 'react';
import { connect } from 'react-redux';

function ModalHost({ modal }) {
  if (!modal?.open || !modal?.component) return null;
  const Component = modal.component;
  return <Component {...modal.props} />;
}

const mapStateToProps = state => ({ modal: state.modal });

export default connect(mapStateToProps)(ModalHost);
