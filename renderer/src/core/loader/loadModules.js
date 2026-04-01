import * as FIRENEF from "firenef";
import * as THREE from "three";
import { fetchLocalJSON } from "./utils.js";

const globalVariables = { FIRENEF, THREE };

export default async function loadModules(engine, config) {
    const sourcePath = config.sourcePath ?? "./src/";
    const mainModulePath = resolvePath(sourcePath, (config.mainModulePath ?? "workspace/modules/project.json"));

    const mainModule = await fetchLocalJSON(mainModulePath);

    if (!mainModule || typeof mainModule !== "object") throw console.error("Main Module missing or incorrect.");

    const components = await loadFullModule(mainModule.updater ?? [], sourcePath);
    components.forEach(component => component.parent = engine );
    engine.updateList.push(...components);
}

async function loadFullModule(modules, sourcePath) {
    const components = await loadModuleSkeleton(modules, sourcePath);
    await initializeComponents(components, modules, sourcePath);
    return components;
}

async function initializeComponents(components, modules, sourcePath) {
    for (let i = 0; i < components.length; i++) {
        if (modules[i].type === "module") {
            modules[i] = await fetchLocalJSON(resolvePath(sourcePath, modules[i].path));
        }

        const module = modules[i];
        const component = components[i];

        if (module.variables) {
            for (const variable in module.variables) {
                component[variable] = module.variables[variable];
            }
        }

        if (module.id && module.id != "") component.setID(module.id);

        if (module.visible === false) component.visible = false;
        if (module.enable === false) component.enable = false;
        if (module.hidden === true) component.hidden = true;

        if (module.attributes) {
            for (const attribute in module.attributes) {
                for (const field in module.attributes[attribute]) {
                    const fieldValue = module.attributes[attribute][field];
                    if (!fieldValue.type) continue;
                    const [ attributeName, fieldName ] = component.getAttributeName(attribute, field);
                    if (fieldValue.type === "component" || fieldValue.type === "module") {
                        const newComponent = await loadFullModule([fieldValue], sourcePath);
                        await component.setAttributeFieldValue(attributeName, fieldName, newComponent[0], fieldValue.setType);
                    } else if (fieldValue.type === "variable") {
                        await component.setAttributeFieldValue(attributeName, fieldName, getVariableValue(fieldValue.value), fieldValue.setType ?? fieldValue.type);
                    } else {
                        await component.setAttributeFieldValue(attributeName, fieldName, fieldValue.value, fieldValue.setType ?? fieldValue.type);
                    }
                }
            }
        }

        if (module.children) {
            await initializeComponents(component.children, module.children, sourcePath);
        }
    }
}

async function loadModuleSkeleton(modules, sourcePath) {
    const components = [];

    for (let module of modules) {
        if (!module) continue;

        if (module.type === "module") {
            module = await fetchLocalJSON(resolvePath(sourcePath, module.path));
        }

        if (module.type === "component") {
            let component;
            if (module.path) {
                const importClass = await importComponent(module.path, sourcePath);
                component = await new importClass.default(module.name ?? undefined, ...module.params ?? []);
            } else if (module.class) {
                if (FIRENEF[module.class]) {
                    component = await new FIRENEF[module.class](module.name ?? undefined, ...module.params ?? []);
                } else if (THREE[module.class]) {
                    component = await new THREE[module.class](...module.params ?? []);
                }
            }

            if (!component) throw new Error(`Failed to load component: ${module.class ?? module.path}`);

            if (module.children) {
                const children = await loadModuleSkeleton(module.children, sourcePath);
                for (const child of children) {
                    component.appendChild(child);
                }
            }

            components.push(component);

        } else {
            throw new Error(`Unknown module type: ${module.type}`);
        }
    }

    return components;
}

async function importComponent(importPath, sourcePath) {
    const path = new URL(resolvePath(sourcePath, importPath), document.baseURI).href;
    return import(path);
}

function getVariableValue(variablePath) {
    if (variablePath == null) return null;
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