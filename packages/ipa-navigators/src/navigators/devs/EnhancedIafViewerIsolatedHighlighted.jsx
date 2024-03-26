import {IafViewerDBM} from "@invicara/iaf-viewer";
import _ from 'lodash';
import React, {useCallback, useMemo} from 'react';
import {bindLifecycle, KeepAlive} from "react-keep-alive";
import {listIncludes} from "@invicara/ipa-core/modules/IpaUtils";

class ViewerWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previouslyClickedModelIds: []
        };
        this.iafViewerDBMRef = React.createRef();
    }

    highlightedElementIds = _.memoize((_selectedEntities) => (_selectedEntities||[]).reduce((acc,e) => acc.concat(e.modelViewerIds),[]).filter(id => id !== undefined));
    isolatedElementIds = _.memoize((_isolatedRemainingEntities) => (_isolatedRemainingEntities||[]).reduce((acc,e) => acc.concat(e.modelViewerIds),[]).filter(id => id !== undefined));
    sliceElementIds = _.memoize((_isolatedRemainingEntities) => (_isolatedRemainingEntities||[]).reduce((acc,e) => acc.concat(e.modelViewerIds),[]).filter(id => id !== undefined));
    spaceElementIds = _.memoize((_isolatedSpaces) => (_isolatedSpaces||[]).reduce((acc,e) => acc.concat(e.modelViewerIds),[]).filter(id => id !== undefined));
    //focusedElementIds = _.memoize((_focusedEntity) => (_focusedEntity ? [_focusedEntity] : []).reduce((acc,e) => acc.concat(e.modelViewerIds),[]).filter(id => id !== undefined));
    hiddenElementIds = _.memoize((_hiddenEntities) => (_hiddenEntities||[]).reduce((acc,e) => acc.concat(e.modelViewerIds),[]).filter(id => id !== undefined));


    resetGlassMode = async () => {
        let commands = _.get(this.iafViewerDBMRef, "current.iafviewerRef.current.commands");
        if (commands && commands.setDrawMode) {
            //reset glass mode
            await commands.setDrawMode(false /*glassMode*/, false /*glassModeFromToolbar*/, undefined /*newDrawMode*/);
        }
        if (commands && commands.resetAll) {
            //reset glass mode
            //await commands.resetAll(); not desired
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.isolatedEntities !== prevProps.isolatedEntities && _.isEmpty(this.props.isolatedEntities)){
            this.resetGlassMode();
        }
        /* leaving it here, might be useful for debugging later on
        Object.keys(prevProps)
            .filter(key => {
                return prevProps[key] !== this.props[key];
            }).map(key => {
                console.log('changed property:',key,'from',this.props[key],'to',prevProps[key]);
            });
         */
    }

    getModelEntities = async () => {
        let commands = _.get(this.iafViewerDBMRef, "current.iafviewerRef.current.commands");
        if (commands && commands.getSelectedEntities) {
            let pkgIds = await commands.getSelectedEntities();
            if (pkgIds && pkgIds.length > 0) {
                let result = [];
                for (const pkgId of pkgIds) {
                    if (isNaN(pkgId)) {
                        result.push({id: pkgId})
                    } else {
                        result.push({id: parseInt(pkgId)})
                    }
                }
                return result;
            } else {
                return [];
            }
        }
    };


    selectEntities = async () => {
        const modelSelectedEntities = await this.getModelEntities();
        const modelSelectedEntitiesIds = !modelSelectedEntities ? [] : modelSelectedEntities.map(({id}) => id);

        if(modelSelectedEntities && modelSelectedEntities.length > 0){
            //sync UI => take the model as single source of truth, and sync UI
            const highlightedElementIdsOutOfSync = !listIncludes(
                _.sortBy(this.highlightedElementIds(this.props.selectedEntities)),
                _.sortBy(modelSelectedEntitiesIds)
            );
            const previouslyClickedModelIdsOutOfSync = !listIncludes(
                _.sortBy(this.state.previouslyClickedModelIds),
                _.sortBy(modelSelectedEntitiesIds)
            );
            if(previouslyClickedModelIdsOutOfSync || highlightedElementIdsOutOfSync){
                this.props.onSelect(modelSelectedEntities);
                this.setState({previouslyClickedModelIds: modelSelectedEntitiesIds})
            }
        } else {
            //clear UI => if we are in assets view
            if(this.sliceElementIds(this.props.isolatedRemainingEntities).length>0 && this.state.previouslyClickedModelIds && this.state.previouslyClickedModelIds.length>0){
                this.props.onSelect(modelSelectedEntities);
                this.setState({previouslyClickedModelIds: modelSelectedEntitiesIds})
            }
        }
    }

    render() {
        //remove keepalive container details from passed props to avoid re-render
        const props = {...this.props, _container : undefined}

        //const isolatedElementIds = this.isolatedElementIds(this.props.isolatedEntities);
        //const isolatedElementIdsWithoutSpace = this.isolatedElementIds(this.props.isolatedRemainingEntities);

        return (<div onClick={this.selectEntities}>
                <IafViewerDBM ref={this.iafViewerDBMRef} {...props}
                    hiddenElementIds={this.hiddenElementIds(this.props.hiddenEntities)}
                    sliceElementIds={this.sliceElementIds(this.props.isolatedEntities)}
                    //isolatedElementIds={this.isolatedElementIds(this.props.isolatedRemainingEntities)}
                    isolatedElementIds={this.isolatedElementIds(this.props.isolatedEntities)}
                    //isolatedElementIds={isolatedElementIds.length==1 ? isolatedElementIds : isolatedElementIdsWithoutSpace}
                    spaceElementIds={this.spaceElementIds(this.props.isolatedSpaces)}
                    highlightedElementIds={this.highlightedElementIds(this.props.isolatedEntities)}
                    selection={this.highlightedElementIds(this.props.selectedEntities)}
                />
            </div>
        );
    }
}

const Viewer = bindLifecycle(ViewerWrapper)

//TODO Remove repetition with SystemsViewer, try to make KeepAplive's 'name' work or else at least extract shared logic to a HOC
export const EnhancedIafViewer = ({
                                      model,
                                      isolatedEntities,
                                      selectedEntities,
                                      viewerResizeCanvas,
                                      onSelect,
                                      hiddenEntities,
                                      colorGroups,
                                      isolatedSpaces,
                                      isolatedRemainingEntities,
                                      focusedEntity
                                  }) => {
    
    const saveSettingsCallback = useCallback((settings) => {localStorage.iafviewer_settings = JSON.stringify(settings)},[]);
    const emptyArray = useMemo(()=>[],[]);
    const viewerSettings = useMemo(()=>localStorage.iafviewer_settings  ? JSON.parse(localStorage.iafviewer_settings ) : undefined ,[localStorage.iafviewer_settings ]);


    return (
        <KeepAlive name={"Navigator"} extra={{
            model: model,
            serverUri: endPointConfig.graphicsServiceOrigin,
            hiddenEntities: hiddenEntities,
            viewerResizeCanvas: viewerResizeCanvas,
            settings: viewerSettings,
            saveSettings: saveSettingsCallback,
            colorGroups:colorGroups,
            onSelect: onSelect,
            isolatedEntities,
            selectedEntities : _.isEmpty(selectedEntities) ? emptyArray : selectedEntities, //trying to avoid re-render here
            isolatedSpaces: isolatedSpaces,
            isolatedRemainingEntities: isolatedRemainingEntities,
            focusedEntity: focusedEntity
        }}>
            <Viewer/>
        </KeepAlive>
    );
};
