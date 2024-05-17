import React, { useState } from 'react';
import PropTypes from 'prop-types';

import * as ReactTouch from "../react-touch/index"

function IfefSwipeablePanel(props) {
    const swipe = ReactTouch.defineSwipe({swipeDistance: 25});
    return (
            <ReactTouch.Swipeable
                config={swipe}
                onSwipeLeft={props.onSwipeLeft}
                onSwipeRight={props.onSwipeRight}
                onSwipeUp={props.onSwipeUp}
                onSwipeDown={props.onSwipeDown}
                >
                    {props.children}
            </ReactTouch.Swipeable>
        );
}

IfefSwipeablePanel.propTypes = {
    onSwipeRight: PropTypes.func,
    onSwipeLeft: PropTypes.func,
    onSwipeUp: PropTypes.func,
    onSwipeDown: PropTypes.func,
}

class IfefDraggablePanel extends React.Component {
    constructor( props ) {
        super( props  );

        const position = props.position || {};
        this.state = {
            pos: {
                left: position.left || 100,
                top: position.top || 100
            }
        }

        this.handleDrag = this.handleDrag.bind(this);
    }

    handleDrag(newPos) {
        this.setState({pos: {left: newPos.left, top: newPos.top}});
    }

    render() {
        const { pos } = this.state;
        return (
            <ReactTouch.Draggable
                position={pos}
                onDrag={this.handleDrag}
                onDragEnd={() => console.log('drag ended.')}
            >
                 <div style={{...pos, 'position': 'absolute'}}>
                    { this.props.children }
                 </div>
            </ReactTouch.Draggable>
        );

    }
}

export default {
    IfefSwipeablePanel: IfefSwipeablePanel,
    IfefDraggablePanel: IfefDraggablePanel
}