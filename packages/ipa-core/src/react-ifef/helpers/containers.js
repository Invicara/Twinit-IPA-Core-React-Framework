import PropTypes from 'prop-types';
import React from 'react';

class LeftButtonContainer extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.contRef = React.createRef();
  }

  componentDidMount() {
      var node = this.contRef.current;
      var width;
      if (node) {
        width = node.getBoundingClientRect().width;
      } else {
        width = 0;
      }
      this.props.setMarginCompensation(width);
  }

  render() {
    return (
      <span ref={this.contRef}>
        { this.props.children }
      </span>
    )


  }
};

LeftButtonContainer.propTypes = {
  setMarginCompensation: PropTypes.func.isRequired
}

const RightButtonContainer = ({children}) => {
  return (
    <span className={"buttons-right"}>{children}</span>
  )
}

export {LeftButtonContainer, RightButtonContainer};
