import React, {useCallback, useEffect, useMemo, useState} from "react";
import clsx from "clsx";
import { IfefTouchPanel } from '@invicara/react-ifef';
const { IfefDraggablePanel } = IfefTouchPanel;


const NavigatorModeless = ({isFetching, isSelectingEntity = false, searchTab, treeComponent, detailComponent, onModelReset}) => {
    const [open,setOpen] = useState(false);
    const [selectedTabIndex,setSelectedTabIndex] = useState(0);

    const toggle = useCallback(() => setOpen(open => !open), []);

    const openTabHandler = useCallback(tabIndex => () => {
        setSelectedTabIndex(tabIndex);
        if(!open) setOpen(true)
        //if(open && selectedTabIndex === tabIndex) setOpen(false)
    }, [open,selectedTabIndex]);

    const openTab = index => openTabHandler(index)();

    useEffect(() => {
        if(!isFetching && selectedTabIndex === 0) openTab(1)
    },[isFetching]);

    useEffect(() => {
        if(isSelectingEntity) openTab(2)
    },[isSelectingEntity]);

    const tabs  = useMemo(() => [
        {icon: 'fa-search', content: searchTab },
        {icon: 'fa-sitemap', content: treeComponent },
        {icon: 'fa-database', content:  isSelectingEntity? 'Retrieving data...' : (detailComponent || 'No Digital Twin entity associated with the selected object') }],
        [searchTab,treeComponent,detailComponent]
    );

    return(
        <IfefDraggablePanel position={{left: 80, top: 40}}>
            <div className={clsx({'navigator-modless': true, 'navigator-modless-closed': !open})}>
                <div className="top-bar">
                    <div className="navigator-modless-tabs">
                        {tabs.map((tab,i) =>
                            <i key={i} onClick={openTabHandler(i)}
                               className={`fas ${tab.icon} ${i === selectedTabIndex? 'selected': 'unselected'}`}
                            />)
                        }
                    </div>
                    <div className="toggle">
                        <i onClick={onModelReset} title={'Reset Model View'} className={`fas fa-reply reset-icon`}/>
                        <i onClick={toggle} title={'Collapse'} className={`fas fa-window-minimize`}/>
                    </div>
                </div>
                <div className={clsx({'navigator-modless-content': true, 'navigator-modless-content-closed': !open})}>
                    {tabs.map((tab, i) =>
                        <div key={i} style={{display: i===selectedTabIndex? 'block':'none'}}>{tab.content}</div>
                    )}
                </div>
            </div>
        </IfefDraggablePanel>
    )
};

export default React.memo(NavigatorModeless)
