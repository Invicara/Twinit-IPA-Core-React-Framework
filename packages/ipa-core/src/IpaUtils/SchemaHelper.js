import jsf from 'json-schema-faker';
import ScriptHelper  from "./ScriptHelper";

jsf.option("useDefaultValue", true)

export const requiresReplacing = (actionName) => {
    return new Promise((resolve, reject) => {
        resolve(actionName.toLowerCase() === "create")
    })
}

export const getHydratedObject = (entityName) => {
    return new Promise(async (resolve, reject) => {
        const fetchPlaceholderSchema = (name) => {
            return new Promise(async (resolve, reject) => {
                const payload = {
                    "entity": name
                };
                console.log("Fetching for: "+JSON.stringify(payload))
                await ScriptHelper.executeScript("fetchSchema", {condition: payload});
                const result = await ScriptHelper.getScriptVar("result");
                if(result.schemaExists) {
                    const schema = result.obj.schema;
                    resolve(schema)
                } else {
                    reject(null);
                }
            })
        }
        var hydratedObject = null;
        try {
            const schema = await fetchPlaceholderSchema(entityName);
            hydratedObject = jsf.generate(schema);
        } catch(e) {
            console.error(e);
            hydratedObject = null;
        }
        resolve(hydratedObject)
    }) 
}

const SchemaHelper = {
    requiresReplacing,
    getHydratedObject
}

export default SchemaHelper