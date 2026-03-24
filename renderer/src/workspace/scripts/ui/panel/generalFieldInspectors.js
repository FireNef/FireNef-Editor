import * as FIRENEF from "firenef";

export class BooleanInspectorScript extends FIRENEF.Script {
    constructor(name = "Bolean Inspector Script") {
        super(name);

        const scriptAttribute = new FIRENEF.Attribute("Script");
        scriptAttribute.addField("defaultType", "object", null);
        scriptAttribute.addField("field", "object", null);
        scriptAttribute.addField("is Last", "boolean", false);
        this.attributes.push(scriptAttribute);

        this.element = null;

        this.nameElement = null;
        this.checkboxElement = null;
        this.spacerElement = null;
    }

    static type = "booleanInspectorScript";

    start() {
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.checkboxElement = this.element.querySelector("#checkbox");
        this.spacerElement = this.element.querySelector("#spacer");

        if (this.getAttributeFieldValue(0, 2)) this.spacerElement.style.display = "none";

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name;
        this.checkboxElement.checked = this.getAttributeFieldValue(0, 1).value;

        this.checkboxElement.addEventListener("change", () => {
            this.getAttributeFieldValue(0, 1).value = this.checkboxElement.checked;
        });
    }
}

export class NumberInspectorScript extends FIRENEF.Script {
    constructor(name = "Number Inspector Script") {
        super(name);

        const scriptAttribute = new FIRENEF.Attribute("Script");
        scriptAttribute.addField("defaultType", "object", null);
        scriptAttribute.addField("field", "object", null);
        scriptAttribute.addField("is Last", "boolean", false);
        this.attributes.push(scriptAttribute);

        this.element = null;

        this.nameElement = null;
        this.numberInputElement = null;
        this.rangeInputElement = null;
        this.spacerElement = null;
    }

    static type = "numberInspectorScript";

    start() {
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.numberInputElement = this.element.querySelector("#numberInput");
        this.rangeInputElement = this.element.querySelector("#rangeInput");
        this.spacerElement = this.element.querySelector("#spacer");
        if (!this.rangeInputElement) return;

        if (this.getAttributeFieldValue(0, 2)) this.spacerElement.style.display = "none";

        const inputs = this.getAttributeFieldValue(0, 0).inputs;

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name;

        if ((inputs.min || inputs.min === 0) && (inputs.max || inputs.max === 0) && !inputs.noRange) {
            this.rangeInputElement.style.display = null;
            this.rangeInputElement.addEventListener("change", () => {
                if (this.rangeInputElement.value < inputs.min) this.rangeInputElement.value = inputs.min;
                if (this.rangeInputElement.value > inputs.max) this.rangeInputElement.value = inputs.max;
                if (!this.rangeInputElement.value && this.rangeInputElement.value !== 0) this.rangeInputElement.value = 0;
                this.getAttributeFieldValue(0, 1).value = Number(this.rangeInputElement.value);
                this.numberInputElement.value = this.rangeInputElement.value;
            });
            this.rangeInputElement.min = inputs.min;
            this.rangeInputElement.max = inputs.max;
            if (inputs.step) {
                 this.rangeInputElement.step = inputs.step;
            } else {
                this.rangeInputElement.step = (inputs.max - inputs.min) / 100;
            }

            this.rangeInputElement.value = this.getAttributeFieldValue(0, 1).value;

            const value = (this.rangeInputElement.value - this.rangeInputElement.min) / (this.rangeInputElement.max - this.rangeInputElement.min) * 100;
            this.rangeInputElement.style.setProperty('--track-color', `linear-gradient(to right, var(--current-accent) ${value}%, var(--current-surface1) ${value}%)`);

            this.rangeInputElement.addEventListener("input", () => {
                const value = (this.rangeInputElement.value - this.rangeInputElement.min) / (this.rangeInputElement.max - this.rangeInputElement.min) * 100;
                this.rangeInputElement.style.setProperty('--track-color', `linear-gradient(to right, var(--current-accent) ${value}%, var(--current-surface1) ${value}%)`);
            });
        } else {
            this.rangeInputElement.style.display = "none";
        }

        this.numberInputElement.value = this.getAttributeFieldValue(0, 1).value;
        this.numberInputElement.addEventListener("change", () => {
            if (inputs.min || inputs.min === 0) if (this.numberInputElement.value < inputs.min) this.numberInputElement.value = inputs.min;
            if (inputs.max || inputs.max === 0) if (this.numberInputElement.value > inputs.max) this.numberInputElement.value = inputs.max;
            if (!this.numberInputElement.value && this.numberInputElement.value !== 0) this.numberInputElement.value = 0;
            this.getAttributeFieldValue(0, 1).value = Number(this.numberInputElement.value);
            if (this.rangeInputElement) this.rangeInputElement.value = this.numberInputElement.value;
        });
        if (inputs.min || inputs.min === 0) this.numberInputElement.min = inputs.min;
        if (inputs.max || inputs.max === 0) this.numberInputElement.max = inputs.max;
        if (inputs.step) this.numberInputElement.step = inputs.step;
    }
}

export class StringInspectorScript extends FIRENEF.Script {
    constructor(name = "String Inspector Script") {
        super(name);

        const scriptAttribute = new FIRENEF.Attribute("Script");
        scriptAttribute.addField("defaultType", "object", null);
        scriptAttribute.addField("field", "object", null);
        scriptAttribute.addField("is Last", "boolean", false);
        this.attributes.push(scriptAttribute);

        this.element = null;

        this.nameElement = null;
        this.textInputElement = null;
        this.spacerElement = null;
        this.textareaElement = null;
    }

    static type = "stringInspectorScript";

    start() {
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.textInputElement = this.element.querySelector("#textInput");
        this.textareaElement = this.element.querySelector("#textarea");
        this.spacerElement = this.element.querySelector("#spacer");
        if (!this.textInputElement) return;

        if (this.getAttributeFieldValue(0, 2)) this.spacerElement.style.display = "none";

        const inputs = this.getAttributeFieldValue(0, 0).inputs;

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name;

        if (inputs.textField == "wide") {
            this.textInputElement.style.display = "none";
            this.textareaElement.style.display = null;
            this.textareaElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value = this.textareaElement.value);
            this.textareaElement.value = this.getAttributeFieldValue(0, 1).value;
        } else {
            this.textareaElement.style.display = "none";
            this.textInputElement.style.display = null;
        }

        this.textInputElement.value = this.getAttributeFieldValue(0, 1).value;
        this.textInputElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value = this.textInputElement.value);
    }
}

export class Vector3InspectorScript extends FIRENEF.Script {
    constructor(name = "Vector3 Inspector Script") {
        super(name);

        const scriptAttribute = new FIRENEF.Attribute("Script");
        scriptAttribute.addField("defaultType", "object", null);
        scriptAttribute.addField("field", "object", null);
        scriptAttribute.addField("is Last", "boolean", false);
        this.attributes.push(scriptAttribute);

        this.element = null;

        this.nameElement = null;
        this.spacerElement = null;

        this.vecXInputElement = null;
        this.vecYInputElement = null;
        this.vecZInputElement = null;
    }

    start() {
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.spacerElement = this.element.querySelector("#spacer");

        this.vecXInputElement = this.element.querySelector("#vecXInput");
        this.vecYInputElement = this.element.querySelector("#vecYInput");
        this.vecZInputElement = this.element.querySelector("#vecZInput");

        if (this.getAttributeFieldValue(0, 2)) this.spacerElement.style.display = "none";

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name;
        
        this.vecXInputElement.value = this.getAttributeFieldValue(0, 1).value.x;
        this.vecYInputElement.value = this.getAttributeFieldValue(0, 1).value.y;
        this.vecZInputElement.value = this.getAttributeFieldValue(0, 1).value.z;

        this.vecXInputElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value.x = Number(this.vecXInputElement.value));
        this.vecYInputElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value.y = Number(this.vecYInputElement.value));
        this.vecZInputElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value.z = Number(this.vecZInputElement.value));
    }
}

export class Vector2InspectorScript extends FIRENEF.Script {
    constructor(name = "Vector2 Inspector Script") {
        super(name);

        const scriptAttribute = new FIRENEF.Attribute("Script");
        scriptAttribute.addField("defaultType", "object", null);
        scriptAttribute.addField("field", "object", null);
        scriptAttribute.addField("is Last", "boolean", false);
        this.attributes.push(scriptAttribute);

        this.element = null;

        this.nameElement = null;
        this.spacerElement = null;

        this.vecXInputElement = null;
        this.vecYInputElement = null;
    }
    
    start() {
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.spacerElement = this.element.querySelector("#spacer");

        this.vecXInputElement = this.element.querySelector("#vecXInput");
        this.vecYInputElement = this.element.querySelector("#vecYInput");

        if (this.getAttributeFieldValue(0, 2)) this.spacerElement.style.display = "none";

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name;

        this.vecXInputElement.value = this.getAttributeFieldValue(0, 1).value.x;
        this.vecYInputElement.value = this.getAttributeFieldValue(0, 1).value.y;

        this.vecXInputElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value.x = Number(this.vecXInputElement.value));
        this.vecYInputElement.addEventListener("change", () => this.getAttributeFieldValue(0, 1).value.y = Number(this.vecYInputElement.value));
    }
}