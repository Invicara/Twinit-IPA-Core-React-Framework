import React from "react";
import _ from "lodash";
import ScriptCache from "../../IpaUtils/script-cache";
import {AppContext} from "../../appContext";
import {withAppContext} from "../../appContext";
import {GenericPageContext} from "../genericPageContext";

const withEntityConfig = WrappedComponent => {
    const EntityConfigHOC =  class extends React.Component {
        constructor(props) {
            super(props);
        }

        //Checks if this handler/page supports multiple entity types (like assets and spaces)
        _allowsMultipleEntityTypes = _.memoize((currentConfig) => Array.isArray( currentConfig.type));

        _getAllowedEntityTypes = _.memoize((currentConfig)  => {
            const allowsMultipleEntityTypes = this._allowsMultipleEntityTypes(currentConfig)
            if(allowsMultipleEntityTypes) {
                return currentConfig.type.map(entityType => entityType.singular)
            }

            //In some instances, the entityType is an object in a type property
            if(currentConfig.type?.singular) {
                return [currentConfig.type?.singular]
            }

            //Otherwise we assume the entityType is in directly in the config as the singular property.
            return  [currentConfig.singular]
        });

        //keeping this method name to avoid too much refactoring :)
        getPerEntityConfig =  _.memoize((currentConfig) => () => this._getPerEntityConfig(currentConfig) );
        _getPerEntityConfig =  _.memoize((currentConfig) => {
            const {entityData, entitySelectionPanel, type, selectBy = {/*make sure merge always run*/}, data, tableView, actions} = currentConfig;
            if (this._allowsMultipleEntityTypes(currentConfig)) {
                const consolidatedConfig = _.mergeWith({...entityData}, {...selectBy}, (entityData, selectors, key) => ({
                    ...currentConfig,
                    script: entityData.script,
                    entityFromModelScript: entityData.getEntityFromModel,
                    spaceMode: entityData.spaceMode,
                    selectors,
                    entitySelectionPanel: entitySelectionPanel?.[key],
                    data: data?.[key],
                    tableView: tableView?.[key],
                    actions: actions?.[key]
                }));
                let result = _.mapValues(consolidatedConfig, (entityConfig, entityName) =>
                    ({...entityConfig, ...type.find(t => t.singular === entityName)})
                );
                return result;
            } else {
                return {
                    [type.singular]: {
                        ...currentConfig,
                        script: entityData[type.singular].script,
                        entityFromModelScript: entityData[type.singular].getEntityFromModel,
                        spaceMode: entityData[type.singular].spaceMode,
                        selectors: selectBy,
                        data,
                        actions,
                        tableView,
                        singular: type.singular,
                        plural: type.plural
                    }
                }
            }
        });


        getEntityExtendedDataFetcher = (extendedDataConfig) => {
            if (!extendedDataConfig) {
                console.error("Unconfigured extended data");
                return () => undefined;
            }
            return async (dataType, entityInfo) => {
                let scriptName = extendedDataConfig[dataType].script;
                let scriptExpiration = extendedDataConfig[dataType].scriptExpiration;
                let result = await ScriptCache.runScript(scriptName, {entityInfo: entityInfo}, {scriptExpiration: scriptExpiration});
                return result;
            }
        };

        //kept for the compatibility
        getExtendedDataConfig = _.memoize((currentConfig) => () => this._getExtendedDataConfig(currentConfig));
        _getExtendedDataConfig = _.memoize((currentConfig)=> {
            let extendedData = {};
            //check for extended data on entities
            if (currentConfig.data) {
                let dataTypes = Object.keys(currentConfig.data);
                if (!!dataTypes.length) {
                    //gets an object of all the extended datatypes
                    let consolidatedExtendedData = _.values(currentConfig.data).reduce((acc, current) => ({...acc, ...current}));
                    extendedData = currentConfig.type ? consolidatedExtendedData : currentConfig.data;
                }
            }
            return extendedData;

        });

        initAvailableDataGroups = (currentConfig) => {
            let availableDataGroups = {}
            Object.entries(this._getPerEntityConfig(currentConfig)).forEach(([entityType, config]) => {
                if(config.data){
                    Object.entries(config.data).forEach(([dataGroupName, dataGroup]) => {
                        if (dataGroup.isProperties) {
                            availableDataGroups[entityType] = availableDataGroups[entityType] || {}
                            availableDataGroups[entityType][dataGroupName] = true
                        }
                    })
                }
            })
            return availableDataGroups;
        }



        findAvailableDataGroups = (currentConfig) => (entity, propertiesOnly, entitySingular, onDataGroup, onFinishLoading) => {

            if (!propertiesOnly) {
                // Second pass through run the scripts for each extended data and see if they have data

                let scriptPromises = []
                Object.entries(currentConfig).forEach(([entityType, config]) => {
                    if(entitySingular && entitySingular!=entityType){
                        return;
                    }
                    Object.entries(config.data).forEach(([dataGroupName, dataGroup]) => {
                        if (dataGroup.script && entity) {
                            scriptPromises.push(this.getDataGroupFetcher(entityType, entity, dataGroup, dataGroupName, onDataGroup))
                        }
                    })
                })
                Promise.all(scriptPromises).finally(() => {
                    onFinishLoading && onFinishLoading()
                })
            } else {
                onFinishLoading && onFinishLoading()
            }
        };

        getDataGroupFetcher = (entityType, entity, dataGroup, dataGroupName, onDataGroupLoaded) => {
            return ScriptCache.runScript(dataGroup.script, {entityInfo: entity}, {scriptExpiration: dataGroup.scriptExpiration})
                .then(extendedData => {
                    let isAvailable
                    if (!extendedData)
                        isAvailable = false
                    else if (Array.isArray(extendedData) && extendedData.length > 0)
                        isAvailable = true
                    else if (Object.keys(extendedData).length > 0)
                        isAvailable = true
                    else
                        isAvailable = false
                    onDataGroupLoaded(entityType, dataGroupName, isAvailable)
                })
                .catch(error => {
                    onDataGroupLoaded(entityType, dataGroupName, false)
                })
        }

        getWrappedComponent = (handler) => {
            const config = handler.config;

            const wrappedProps = {...this.props, ...this.state,
                initialAvailableDataGroups: this.initAvailableDataGroups(config),
                perEntityConfig : this._getPerEntityConfig(config),
                //TODO: why extendedDataConfig merges keys from all entities? surely this one day will overwrite something right?
                extendedDataConfig: this._getExtendedDataConfig(config),
                allowsMultipleEntityTypes: this._getAllowedEntityTypes(config),
                allowedEntityTypes: this._getAllowedEntityTypes(config),
                findAvailableDataGroups : this.findAvailableDataGroups(this._getPerEntityConfig(config)),
                getEntityExtendedDataFetcher: this.getEntityExtendedDataFetcher,
                //the below prop is kept to be compliant with old code, please use "perEntityConfig" instead
                getPerEntityConfig: this.getPerEntityConfig(config)
            }
            return <WrappedComponent {...wrappedProps}/>}

        render() {
            return <GenericPageContext.Consumer>
                {genericPageContext => this.getWrappedComponent(genericPageContext.handler)}
            </GenericPageContext.Consumer>;
        }
    }

    return withAppContext(EntityConfigHOC)
};



export default withEntityConfig
