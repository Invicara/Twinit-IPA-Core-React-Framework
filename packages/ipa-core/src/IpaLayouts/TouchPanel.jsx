import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSwipeable } from 'react-swipeable';

function SwipeablePanel(props) {
    const handlers = useSwipeable({
        onSwipedLeft: props.onSwipeLeft,
        onSwipedRight: props.onSwipeRight,
        onSwipedUp: props.onSwipeUp,
        onSwipedDown: props.onSwipeDown,
    });

    return (
        <div {...handlers}>
            {props.children}
        </div>
    );
}

SwipeablePanel.propTypes = {
    onSwipeRight: PropTypes.func,
    onSwipeLeft: PropTypes.func,
    onSwipeUp: PropTypes.func,
    onSwipeDown: PropTypes.func,
};

class DraggablePanel extends React.Component {
    constructor(props) {
        super(props);

        const position = props.position || {};
        this.state = {
            pos: {
                left: position.left || 100,
                top: position.top || 100,
            },
        };

        this.handleDrag = this.handleDrag.bind(this);
    }

    handleDrag(newPos) {
        this.setState({ pos: { left: newPos.left, top: newPos.top } });
    }

    render() {
        const { pos } = this.state;
        return (
            <div
                style={{ ...pos, position: 'absolute' }}
                draggable="true"
                onDrag={(e) => {
                    e.preventDefault();
                    this.handleDrag({ left: e.clientX, top: e.clientY });
                }}
                onDragEnd={() => console.log('drag ended.')}
            >
                {this.props.children}
            </div>
        );
    }
}

export default {
    SwipeablePanel: SwipeablePanel,
    DraggablePanel: DraggablePanel,
};
