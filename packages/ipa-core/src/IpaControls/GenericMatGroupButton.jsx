import React from 'react';
import Button from '@material-ui/core/Button';

import './GenericMatButton.scss'

export default class GenericMatGroupButton extends React.Component {
  render() {
    
    
    return (
          <Button disableElevation={this.props.disableElevation} variant={this.props.variant || "contained"} size={this.props.size} style={{...this.props.styles}} onClick={this.props.onClick} disabled={this.props.disabled} className={`GenericMatGroupButton ${this.props.customClasses}`}>
              {this.props.children}
          </Button>

    )
  }
}