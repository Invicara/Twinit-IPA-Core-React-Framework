import React from 'react';
import classnames from "classnames";
import isTouchDevice from "is-touch-device";
import IfefTouchPanel from "./ifefTouchPanel";
const { IfefSwipeablePanel } = IfefTouchPanel;

class IfefFlexLeftNavs extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            classes: classnames(this.props.customClasses)
        };
        this.isTouchDevice = isTouchDevice();
        this.handleSwipeRight = this.handleSwipeRight.bind(this);
        this.handleSwipeLeft = this.handleSwipeLeft.bind(this);
    }

    handleSwipeRight() {
        if(!this.isTouchDevice)
            return;
        const classes = classnames(this.props.customClasses, 'navExpanded');
        this.setState({classes});
    }

    handleSwipeLeft() {
        if(!this.isTouchDevice)
            return;
        const classes = classnames(this.props.customClasses, 'navCollapsed');
        this.setState({classes});
    }

    render() {
        const { classes } = this.state;
        return (
            <IfefSwipeablePanel onSwipeRight={ this.handleSwipeRight } onSwipeLeft={ this.handleSwipeLeft }>
                <nav className={classes}>
                        {this.props.children}
                </nav>
            </IfefSwipeablePanel>
        );
    }
}


export default IfefFlexLeftNavs;