import React from "react";
import {StackableDrawerContainer, StackableDrawer} from "@invicara/ipa-core/modules/IpaDialogs";
import NavigatorSource from "./NavigatorSource";
import SystemSearchPanel from "./SystemSearchPanel";

const SystemSearchPanels = (props) => {

    return <StackableDrawerContainer anchor="left" className={"systems-drawer"}>
        <StackableDrawer minWidth={200} anchor={'left'} level={1} defaultOpen={false} isDrawerOpen={props.viewerMode===NavigatorSource.SYSTEM && props.isSystemDrawerOpen} tooltip={"Systems"}>
            <div className="modless-search-tab" style={{padding:'0px 15px'}}>
                <div className='fetch-container'>
                {props.rootEntity ? <SystemSearchPanel {...props}/> : <p className="p-h-10">Select Entity First</p>}
                </div>
            </div>
        </StackableDrawer>
    </StackableDrawerContainer>
}

export default SystemSearchPanels;

