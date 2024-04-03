import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import Snap from '../helpers/snap';
import classnames from "classnames";

class IfefFlexContainer extends React.Component {

  constructor(props) {
    super(props);

  }


  render() {
    let classes = classnames({'flex-container': true},this.props.customClasses);
    return (
        <div className={classes} id="IfefSidePanelContent" data-snap-ignore={false}>
            {this.props.children}
        </div>
    );
  }
}


export default IfefFlexContainer;