import React from 'react';
import CSSModules from 'react-css-modules';
import './BottomPanel.css'

// There is only one BottomPanel, which we make work like the Right/Left drawers
// We provide an id so apps can find it to load app-specific content in it.
// This may not be needed as we could look up by class.  ToDo: review.  jl 05/07/2019
class BottomPanel extends React.Component {
  constructor(props) {
    super(props);

    this.clientHeight = document.documentElement.clientHeight;
  }
  onDrag(evt) {
    let pageY = evt.pageY;
    if(pageY !== 0) {
      this.bottomPanelStyle.height=this.clientHeight-pageY;
      this.sidePanelStyle.height=pageY;
    }
  }

  componentDidMount() {
    this.sidePanelStyle = document.getElementById('SidePanelContent').style;
    this.bottomPanelStyle = document.getElementById('BottomPanel').style;
  }

  render() {
    let display = this.props.hideOnLoad?'none':'block';
    return (
      <div className='asf-panel snap-drawer-bottom' styleName='asf-panel-bottom' id="BottomPanel"
          style={{'height': this.props.height,'display':display}}>
        {this.props.children}
      </div>
    );
  }
}

export default BottomPanel;