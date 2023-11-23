import React from 'react';

class IfefSidePanelContent extends React.Component {
  render() {
    return (
      <div className="asf-panel-content snap-content pane" id="IfefSidePanelContent">
        {this.props.children}
      </div>
    );
  }
}

export default IfefSidePanelContent;
