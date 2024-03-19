import React, {useMemo,useCallback} from "react";
import {Button} from "@material-ui/core";
import {EnhancedFetchControl} from "@invicara/ipa-core/modules/IpaControls";
import _ from 'lodash'
import clsx from "clsx";

const SearchModelessTab = ({config, fetch, currentTab, handleTabChange, queryParamsPerEntityType, reloadToken}) => {

    const fetchingFunctionsMap = useMemo(()=>{
        const functions = new Map();
        _.values(config).forEach(cfg => {
            functions.set(cfg.singular,fetch(cfg.script, undefined, {ignoreCachedScriptResult: true}));
        })
        return functions;
    },[fetch,config]);

    const selectorsMap = useMemo(()=>{
        const _selectorsMap = new Map();
        _.values(config).forEach(cfg => {
            const queryParams = queryParamsPerEntityType[cfg.singular];
            let selectors = cfg.selectors?.map((selector, index) => {
                if(queryParams && queryParams.entityType === cfg.singular && index === queryParams?.query?.id) {
                    return {...selector, currentValue: queryParams?.query?.value, currentState : queryParams?.selector?.currentState}
                } else return selector
            })
            _selectorsMap.set(cfg.singular,selectors);
        })
        return _selectorsMap;
    },[config,queryParamsPerEntityType]);

    const tabContents = useMemo(()=>{
        const contents = new Map();
        _.values(config).forEach(cfg => {
            const queryParams = queryParamsPerEntityType[cfg.singular];
            contents.set(cfg.singular, <EnhancedFetchControl initialValue={queryParams && queryParams.entityType === cfg.singular ? queryParams.query : null}
                                                             selectors={selectorsMap.get(cfg.singular)}
                                                             doFetch={fetchingFunctionsMap.get(cfg.singular)}
                                                             reloadToken={reloadToken}
            />);
        });
        return contents;
    },[config, queryParamsPerEntityType, fetch, reloadToken]);

    const onClickTab = useCallback((e)=>{
        return handleTabChange(e,e.target.textContent)
    },[]);

    return <div className='modless-search-tab'>
        <div className={'general-title'}>Search For</div>
        <div className="entity-tab-group">
            {_.values(config).map(c =>
                <Button key={c.singular}
                        label={c.plural}
                        value={c.singular}
                        onClick={onClickTab}
                        className={clsx({"entity-tab-button": true, "active-entity": currentTab==c.singular})}
                >{c.singular}</Button>
            )}
        </div>
        <div className='fetch-container'>
            {tabContents.get(currentTab)}
        </div>
    </div>
};

export default SearchModelessTab;
