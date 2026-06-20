import { INCLUDE_CONFIG } from "../config/includeConfig";

export function buildIncludes(model: any, includes: any[] = []) {

    // console.log(model, includes);


    const associations = model.associations || {};

    // console.log("associations");
    // console.log(associations);
    const modelName = model.name;
    // console.log("includes associations", associations);

    return includes.map(item => {
            const alias = item.alias || item;
            // console.log(alias)

            if (!associations[alias]) {
                return null;
            }

        const config = INCLUDE_CONFIG?.[modelName]?.[alias] || {};
        const attributes = Array.isArray(item.attributes) && item.attributes.length
                ? item.attributes
                : config?.attributes;



        // console.log(attributes);

            return {
                association: alias,
                ...(attributes ? { attributes } : {}),
                include: [],
            };
        })
        .filter(Boolean);
}