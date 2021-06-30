import React from 'react';

export default class LinkedIcon extends React.Component {
  render() {    
    return (
        <div className={this.props.customClass}>
            <a href="#" onClick={this.props.clickHandler}>
                {this.props.icon ?
                    <i className={this.props.icon}/> :
                    <img className={this.props.iconClasses} src={this.props.iconImg}/>
                }
                <span>{this.props.linkText}</span>
            </a>
        </div>
    )
  }
}