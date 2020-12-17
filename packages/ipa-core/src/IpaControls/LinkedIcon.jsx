import React from 'react';

export default class LinkedIcon extends React.Component {
  render() {    
    return (
        <div className={this.props.customClass}>
            <a href="#" onClick={this.props.clickHandler}>
                <i className={this.props.icon}></i>
                <span>{this.props.linkText}</span>
            </a>
        </div>
    )
  }
}