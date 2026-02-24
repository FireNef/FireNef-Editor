export class Field {
    constructor (name, type = "string") {
        this.name = name;
        this.type = type;
        this.value = null;
        this.rawValue = null;
        this.setType = null;
    }

    async setValue(value, type) {
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
        this.value = value;
    }

    deepClone() {
        const cloned = new Field(this.name, this.type);
        cloned.value = structuredClone(this.value);
        cloned.rawValue = structuredClone(this.rawValue);
        cloned.setType = this.setType;
        return cloned;
    }
}

export class Attribute {
    constructor (name = "attribute", fields) {
        this.name = name;
        this.fields = fields ?? [];
        this.enable = true;
    }

    addField(name, type = "string", value) {
        const field = new Field(name, type);
        if (value !== undefined) {
            field.value = value;
            if (type) field.setType = type;
        }
        this.fields.push(field);
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