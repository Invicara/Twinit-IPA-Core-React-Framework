import React from 'react';
import * as PropTypes from 'prop-types';

import * as ReactTouch from '../react-ifef/react-touch/index'


const { Swipeable, defineSwipe, Draggable } = ReactTouch

function SwipeablePanel(props) {
    const swipe = defineSwipe({swipeDistance: 25});
    return (
            <Swipeable
                config={swipe}
                onSwipeLeft={props.onSwipeLeft}
                onSwipeRight={props.onSwipeRight}
                onSwipeUp={props.onSwipeUp}
                onSwipeDown={props.onSwipeDown}
                >
                    {props.children}
            </Swipeable>
        );
}

SwipeablePanel.propTypes = {
    onSwipeRight: PropTypes.func,
    onSwipeLeft: PropTypes.func,
    onSwipeUp: PropTypes.func,
    onSwipeDown: PropTypes.func,
}

class DraggablePanel extends React.Component {
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
            <Draggable
                position={pos}
                onDrag={this.handleDrag}
                onDragEnd={() => console.log('drag ended.')}
            >
                 <div style={{...pos, 'position': 'absolute'}}>
                    { this.props.children }
                 </div>
            </Draggable>
        );

    }
}

export default {
    SwipeablePanel: SwipeablePanel,
    DraggablePanel: DraggablePanel
}