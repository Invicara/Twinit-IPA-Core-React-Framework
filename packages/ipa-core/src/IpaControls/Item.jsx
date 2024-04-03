import * as PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

class Item extends React.Component {


  render() {
    var classes = classnames(
      {'item':  this.props.item,
       'item-text-wrap': this.props.wrap,
       'item-divider': this.props.divider,
       'item-icon-left': this.props.iconLeft,
       'item-icon-right': this.props.iconRight,
       'item-avatar': this.props.avatar,
       'item-image': this.props.image,
       'item-body': this.props.body,
       'item-input': this.props.input,
       'item-button-right': this.props.buttonRight,
       'item-button-left': this.props.buttonLeft,
       'item-thumbnail-left': this.props.thumbnailLeft,
       'item-thumbnail-right': this.props.thumbnailRight,
       'item-checkbox': this.props.checkboxLeft || this.props.checkboxRight,
       'item-checkbox-right': this.props.checkboxRight,
      },
      this.props.customClasses
    );
    var item;
    //TODO: replace by a more declarative option
    if (this.props.link) {
      item = (
         <Link className={classes} to={this.props.link} onClick={this.props.onClick}>
           {this.props.children}
         </Link>
      );
    } else if (this.props.href) {
      item = (
        <a className={classes} href={this.props.href} target={this.props.target} onClick={this.props.onClick}>
          {this.props.children}
        </a>
      );
    } else {
      // This is now a pass through for extra props to support generic eventing.
      // Decided to use item_id as our universal identifier.  jl 11/17/2019
      // And a universal (Script) "action" packet.
      item = (
        <div className={classes} onClick={this.props.onClick} item_id={this.props.item_id} action={this.props.action}>
          {this.props.children}
        </div>
      );
    }
    return item;
  }
}

Item.propTypes = {
  'item': PropTypes.bool,
  'link': PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  href: PropTypes.string,
  target: PropTypes.string,
  'wrap': PropTypes.bool,
  'divider': PropTypes.bool,
  'iconLeft': PropTypes.bool,
  'iconRight': PropTypes.bool,
  'avatar': PropTypes.bool,
  'image': PropTypes.bool,
  'body': PropTypes.bool,
  'input': PropTypes.bool,
  'buttonRight': PropTypes.bool,
  'buttonLeft': PropTypes.bool,
  'thumbnailLeft': PropTypes.bool,
  'thumbnailRight': PropTypes.bool,
  'checkboxLeft': PropTypes.bool,
  'checkboxRight': PropTypes.bool,
  'customClasses': PropTypes.string,
  'onClick': PropTypes.func
};

Item.defaultProps = {
  'item': true,
  'link': null,
  href: null,
  target: null,
  'wrap': false,
  'divider': false,
  'iconLeft': false,
  'iconRight': false,
  'avatar': false,
  'image': false,
  'body': false,
  'input': false,
  'buttonRight': false,
  'buttonLeft': false,
  'thumbnailLeft': false,
  'thumbnailRight': false,
  'checkboxLeft': false,
  'checkboxRight': false,
  'customClasses': '',
  'onClick': null,
};

export default Item;