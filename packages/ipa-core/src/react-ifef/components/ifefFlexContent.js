import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import Snap from '../helpers/snap';
import classnames from "classnames";

class IfefFlexContent extends React.Component {

  constructor(props) {
    super(props);

  }


  render() {
    let classes = classnames({'flex-content': true}, {'scroll-overflowY': true},this.props.customClasses);
    return (
        <div className={classes}>
                {this.props.children}
        </div>
    );
  }
}


export default IfefFlexContent;