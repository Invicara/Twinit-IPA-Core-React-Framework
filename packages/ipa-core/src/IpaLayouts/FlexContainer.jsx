import React from 'react';
import _ from 'lodash';
import classnames from "classnames";

import './FlexContainer.scss'

class FlexContainer extends React.Component {

  constructor(props) {
    super(props);

  }


  render() {
    let classes = classnames({'flex-container': true},this.props.customClasses);
    return (
        <div className={classes} id="SidePanelContent" data-snap-ignore={false}>
            {this.props.children}
        </div>
    );
  }
}


export default FlexContainer;