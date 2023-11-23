import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';


class IfefHeaderBar extends React.Component {
  constructor(props) {
    super(props);
  }


  componentDidMount() {
    this.context.ifefUpdateHasX && this.context.ifefUpdateHasX('ifefHasHeader', true);
  }

  componentWillUnmount() {
    this.context.ifefUpdateHasX && this.context.ifefUpdateHasX('ifefHasHeader', false);
  }

  render() {
    let classes = classnames(this.props.customClasses);
    return (
      <header className={ classes }>
        {this.props.children}
      </header>
    );
  }
}

IfefHeaderBar.propTypes = {
  customClasses: PropTypes.string,
};

IfefHeaderBar.defaultProps = {
  customClasses: ''
};

IfefHeaderBar.contextTypes = {
  ifefUpdateHasX: PropTypes.func,
  ifefPlatform: PropTypes.object
};

export default IfefHeaderBar;