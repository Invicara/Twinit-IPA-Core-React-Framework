import React from 'react';
import _ from 'lodash';
import classnames from "classnames";
import './FlexContent.scss'

class FlexContent extends React.Component {

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


export default FlexContent;