import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import Snap from '../lib/snap-invicara';

class IfefSidePanelContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      elementBottomDimension: _.get(props, 'settings.elementBottomDimension')
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextElementBottomDimension = _.get(nextProps, 'settings.elementBottomDimension');
    let curElementBottomDimension = prevState.elementBottomDimension;
    if (nextElementBottomDimension && nextElementBottomDimension !== curElementBottomDimension) {
      return {elementBottomDimension: nextElementBottomDimension}
    } else {
      return null;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let prevElementBottomDimension = _.get(prevProps, 'settings.elementBottomDimension');
    let curElementBottomDimension = _.get(this, 'props.settings.elementBottomDimension');
    if(curElementBottomDimension !== prevElementBottomDimension) {
      let snapper = this.context.ifefSnapper;
      snapper.settings({elementBottomDimension: curElementBottomDimension});
      snapper.open();
      document.getElementById('SidePanelContent').style.bottom = curElementBottomDimension;
    }
  }

  componentDidMount() {
    var sideMenuContent = document.getElementById('SidePanelContent');
    var bottomPanel = document.getElementById('BottomPanel');
    let snapper = new Snap({
      element: sideMenuContent,
      bottomElement: bottomPanel,
      ...this.props.settings,
    });
    if (typeof snapper.toggle === 'undefined') {
      // add a toggle method if it doesn't exist yet (in some future version)
      snapper.toggle = function(direction) {
        // Now needs to support bottom as a (somewhat) special case
        if (direction === "bottom") {
          if (this.state().state.includes("bottom")) {
            this.closeBottom();
          } else {
            this.open("bottom");
          }
        } else if( this.state().state.includes(direction)){
          this.close();
        } else {
          this.open(direction);
        }
      };
    }
    this.context.ifefSetSnapper(snapper);
  }

  componentWillUnmount() {
    this.context.ifefSetSnapper(null);
  }

  render() {
    return (
      <div>
        { this.props.children }
      </div>
    );
  }
}

IfefSidePanelContainer.contextTypes = {
  ifefSnapper: PropTypes.object,
  ifefSetSnapper: PropTypes.func
};

IfefSidePanelContainer.propTypes = {
  settings: PropTypes.object,
};

IfefSidePanelContainer.defaultProps = {
  settings: {},
};

export default IfefSidePanelContainer;