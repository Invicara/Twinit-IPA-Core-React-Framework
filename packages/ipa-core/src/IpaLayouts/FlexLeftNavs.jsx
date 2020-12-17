import React from 'react';
import classnames from "classnames";
import isTouchDevice from "is-touch-device";
import TouchPanel from "./TouchPanel";
const { SwipeablePanel } = TouchPanel;

class FlexLeftNavs extends React.Component {
    constructor( props ) {
        super( props );

        //TODO: we should remove this props to state copy
        this.state = {
            classes: classnames(this.props.customClasses)
        };
        this.isTouchDevice = isTouchDevice();
        this.handleSwipeRight = this.handleSwipeRight.bind(this);
        this.handleSwipeLeft = this.handleSwipeLeft.bind(this);
    }

    componentDidUpdate(prevProps) {
        //TODO: this will no longer be needed after we remove the props to state copy
        if (this.props.customClasses !== prevProps.customClasses) {
          this.setState({classes: classnames(this.props.customClasses)});
        }
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
            <SwipeablePanel onSwipeRight={ this.handleSwipeRight } onSwipeLeft={ this.handleSwipeLeft }>
                <nav className={classes}>
                        {this.props.children}
                </nav>
            </SwipeablePanel>
        );
    }
}


export default FlexLeftNavs;