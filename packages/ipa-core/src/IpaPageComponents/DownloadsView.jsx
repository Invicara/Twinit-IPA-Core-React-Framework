import React from "react";
import { Button } from '@dtplatform/ipa-ui';

import './DownloadsView.scss';

class DownloadsView extends React.Component {
    constructor(props) {
        super(props);
        this.openTab = this.openTab.bind(this);
    }

    openTab() {
        const tab = window.open(endPointConfig.pluginBaseUrl, '_blank');
        if (tab) tab.focus();
    }

    componentDidMount() {
        this._tabTimer = setTimeout(() => this.openTab(), 1000);
        this.props.onLoadComplete();
    }

    componentWillUnmount() {
        clearTimeout(this._tabTimer);
    }

    render() {
        return (
            <div className="data-container">
                <p className="loading-text">Opening plugin downloads page in a new tab...</p>
                <div className="fallback">
                    <p className="fallback-text">If you are not redirected automatically after a 3 seconds, please click the button below</p>
                    <Button onClick={this.openTab}>Open downloads page</Button>
                </div>
            </div>
        );
    }
}

export default DownloadsView;
