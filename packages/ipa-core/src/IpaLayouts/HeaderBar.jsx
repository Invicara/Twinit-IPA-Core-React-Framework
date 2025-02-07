import * as PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { BodyContext } from '../react-ifef/components/bodyProvider';


class HeaderBar extends React.Component {
  constructor(props) {
    super(props);
  }
  static contextType = BodyContext;

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

HeaderBar.propTypes = {
  customClasses: PropTypes.string,
};

HeaderBar.defaultProps = {
  customClasses: ''
};


export default HeaderBar;