import { ComponentController } from "./component.js";

export class Field {
    constructor (name, type = "string", inputs = {}) {
        this.name = name;
        this.type = type;
        this.value = null;
        this.rawValue = null;
        this.setType = null;
        this.inputs = inputs;
    }

    async setValue(value, type, inputs = {}) {
        if (type) this.setType = type;
        this.rawValue = value;
        if (type === "file") {
            this.value = await getExternalFile(value);
            return;
        }
        if (type === "jsonFile") {
            this.value = JSON.parse(await getExternalFile(value));
            return;
        }
        if (type === "reference" && value != null) {
            const decodedPath = this.decodeComponentPath(value);
            const component = this.getComponentFromPath(decodedPath, inputs.component);
            this.value = component;
            return;
        }
        this.value = value;
    }

    decodeComponentPath(path) {
        const decodedPath = [];
        const pathArray = path.split("/");
        pathArray.forEach(p => {
            if (p.includes(":")) {
                const [key, value] = p.split(":");
                decodedPath.push({ type: key, value });
            } else {
                decodedPath.push({ type: "index", value: p })
            }

        });
        return decodedPath;
    }

    getComponentFromPath(decodedPath, component) {
        if (!component) return null;

        const componentController = component.getFirstParentOfType(ComponentController);
        let curComponent = componentController;
        for (const pathPart of decodedPath) {
            if (curComponent === null) return null;

            if (pathPart.type === "index") {
                curComponent = curComponent.children[pathPart.value];
            } else if (pathPart.type === "type") {
                curComponent = curComponent.child[pathPart.value][0];
            } else if (pathPart.type === "name") {
                curComponent = curComponent.namedChild(pathPart.value);
            }
        }

        return curComponent;
    }

    deepClone() {
        const cloned = new Field(this.name, this.type);
        cloned.value = structuredClone(this.value);
        cloned.rawValue = structuredClone(this.rawValue);
        cloned.setType = this.setType;
        cloned.inputs = structuredClone(this.inputs);
        return cloned;
    }
}

export class Attribute {
    constructor (name = "attribute", fields) {
        this.name = name;
        this.fields = fields ?? [];
        this.enable = true;
    }

    addField(name, type = "string", value, inputs = {}) {
        const field = new Field(name, type, inputs);
        if (value !== undefined) {
            field.value = value;
            if (type) field.setType = type;
        }
        this.fields.push(field);
    }

    field(name) {
        return this.fields.find(f => f.name.toLowerCase() === name.toLowerCase());
    }

    deepClone() {
        const cloned = new Attribute(this.name);
        cloned.enable = this.enable;
        cloned.fields = this.fields.map(f => f.deepClone());
        return cloned;
    }
}

async function getExternalFile(path) {
    return await fetchLocal(path);
}

async function fetchLocal(path) {
    const response = await fetch(path);
    const text = await response.text();
    return text;
}