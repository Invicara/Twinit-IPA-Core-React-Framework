import React from "react";
import _ from "lodash";
import ScriptCache from "../../IpaUtils/script-cache";

const withEntityConfig = WrappedComponent => {
    const EntityConfigHOC =  class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                initialAvailableDataGroups: this.initAvailableDataGroups()
            }
        }

        //Checks if this handler/page supports multiple entity types (like assets and spaces)
        _allowsMultipleEntityTypes = _.memoize((currentConfig) => Array.isArray( currentConfig.type));

        _getAllowedEntityTypes = _.memoize((currentConfig)  => this._allowsMultipleEntityTypes(currentConfig) ?
            currentConfig.type.map(entityType => entityType.singular) :
            [currentConfig.singular]);

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

        initAvailableDataGroups = () => {
            let availableDataGroups = {}
            Object.entries(this._getExtendedDataConfig(this.props.handler.config)).forEach(([entityType, config]) => {
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

        getWrappedComponent = (wrappedProps) => <WrappedComponent
            {...wrappedProps}/>

        render() {

            const config = this.props.handler.config;

            const wrappedProps = {...this.props, ...this.state,
                perEntityConfig : this._getPerEntityConfig(config),
                extendedDataConfig: this._getExtendedDataConfig(config),
                allowsMultipleEntityTypes: this._getAllowedEntityTypes(config),
                allowedEntityTypes: this._getAllowedEntityTypes(config),
                findAvailableDataGroups : this.findAvailableDataGroups(this._getPerEntityConfig(config)),
                getEntityExtendedDataFetcher: this.getEntityExtendedDataFetcher,
                getPerEntityConfig: this.getPerEntityConfig(config)
            }
            return this.getWrappedComponent(wrappedProps)
        }
    }

    return EntityConfigHOC
};



export default withEntityConfig
