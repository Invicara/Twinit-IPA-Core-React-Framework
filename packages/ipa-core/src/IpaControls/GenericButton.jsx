import React from 'react';

export default class GenericButton extends React.Component {
  render() {
    return (
        <button type="button" className="btn btn-outline-primary" style={{width: '100px', ...this.props.styles}} onClick={this.props.onClick} disabled={this.props.disabled}>
            {this.props.text}
        </button>
    )
  }
}
