import * as FIRENEF from "#firenef";
import * as THREE from "#three";
import { fetchLocalJSON } from "./utils.js";

const globalVariables = { FIRENEF, THREE };

export default async function loadModules(engine, config) {
    const sourcePath = config.sourcePath ?? "./src/";
    const mainModulePath = resolvePath(sourcePath, (config.mainModulePath ?? "workspace/modules/project.json"));

    const mainModule = await fetchLocalJSON(mainModulePath);

    if (!mainModule || typeof mainModule !== "object") throw console.error("Main Module missing or incorrect.");

    const components = await importComponents(mainModule.imports, sourcePath);

    for (const child of mainModule.updater ?? []) {
        const component = await manageSingleModule(components, sourcePath, child, engine);
        if (!component) continue;
        component.parent = engine;
        engine.updateList.push(component);
    }
}

async function importComponents(imports, sourcePath) {
    const componentsArray = await Promise.all(
        imports.map(i => {
            const path = new URL(resolvePath(sourcePath, i), document.baseURI).href;
            return import(path);
        })
    );

    return Object.assign({}, ...componentsArray);
}

async function manageSingleModule(components, sourcePath, module, engine) {
    if (module.type === "module") {
        const subModule = await fetchLocalJSON(resolvePath(sourcePath, module.path));
        return await manageSingleModule(components, sourcePath, subModule, engine);
    }
    if (module.type === "component") {
        let component;
        if (components[module.class]) {
            component = await new components[module.class](module.name ?? undefined, ...module.params ?? []);
        } else if (FIRENEF[module.class]) {
            component = await new FIRENEF[module.class](module.name ?? undefined, ...module.params ?? []);
        } else if (THREE[module.class]) {
            component = await new THREE[module.class](...module.params ?? []);
        }

        if (module.visible) component.visible = module.visible;
        if (module.enable) component.enable = module.enable;
        if (module.hidden) component.hidden = module.hidden;

        if (module.attributes) {
            for (const attribute in module.attributes) {
                for (const field in module.attributes[attribute]) {
                    const fieldValue = module.attributes[attribute][field];
                    if (!fieldValue.type) continue;
                    if (fieldValue.type === "component" || fieldValue.type === "module") {
                        await component.setAttributeFieldValue(attribute, field, await manageSingleModule(components, sourcePath, fieldValue), fieldValue.setType, engine);
                    } else if (fieldValue.type === "variable") {
                        await component.setAttributeFieldValue(attribute, field, getVariableValue(fieldValue.value), fieldValue.setType ?? fieldValue.type, engine);
                    } else {
                        await component.setAttributeFieldValue(attribute, field, fieldValue.value, fieldValue.setType ?? fieldValue.type, engine);
                    }
                }
            }
        }

        if (module.children) {
            for (const child of module.children) {
                const childComponent = await manageSingleModule(components, sourcePath, child, engine);
                if (!childComponent) continue;
                component.appendChild(childComponent);
            }
            if (component.updateVisibility && typeof component.updateVisibility === "function") component.updateVisibility();
            if (component.updateEnable && typeof component.updateEnable === "function") component.updateEnable();
        }

        return component;
    }
    return;
}

function getVariableValue(variablePath) {
    const pathParts = variablePath.split(".");
    let current = globalVariables;
    for (const part of pathParts) {
        if (current[part] === undefined) {
            console.warn(`Variable ${variablePath} not found.`);
            return undefined;
        }
        current = current[part];
    }
    return current;
}

function resolvePath(sourcePath, path) {
    if (path.charAt(0) === "/" || path.charAt(0) === ".") {
        return path;
    }
    return sourcePath + path;
}