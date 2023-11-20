import React from 'react';

class IfefSidePanels extends React.Component {
  render() {
    return (
      <div className="view snap-drawers">
        {this.props.children}
      </div>
    );
  }
}

export default IfefSidePanels;