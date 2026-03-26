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
            this.rangeInputElement.addEventListener("input", () => {
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

export class ColorInspectorScript extends FIRENEF.Script {
    constructor(name = "Color Inspector Script") {
        super(name);

        const scriptAttribute = new FIRENEF.Attribute("Script");
        scriptAttribute.addField("defaultType", "object", null);
        scriptAttribute.addField("field", "object", null);
        scriptAttribute.addField("is Last", "boolean", false);
        this.attributes.push(scriptAttribute);

        this.element = null;
        this.editor = null;

        this.nameElement = null;
        this.spacerElement = null;

        this.colorPickerElement = null;
        this.textInputElement = null;
    }

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.nameElement = this.element.querySelector("#name");
        this.spacerElement = this.element.querySelector("#spacer");

        this.colorPickerElement = this.element.querySelector("#colorPicker");
        this.textInputElement = this.element.querySelector("#textInput");

        if (this.getAttributeFieldValue(0, 2)) this.spacerElement.style.display = "none";

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name;

        this.colorPickerElement.style.backgroundColor = this.getAttributeFieldValue(0, 1).value;
        this.textInputElement.value = this.getAttributeFieldValue(0, 1).value;

        this.textInputElement.addEventListener("change", () => {
            this.textInputElement.value = this.colorToHex(this.textInputElement.value);
            this.colorPickerElement.style.backgroundColor = this.textInputElement.value;
            this.getAttributeFieldValue(0, 1).value = this.textInputElement.value;
        });

        this.colorPickerElement.addEventListener("click", () => {
            this.editor.setOverlay("colorPicker", { color: this.getAttributeFieldValue(0, 1).value, colorSet: (hex) => {
                this.textInputElement.value = hex;
                this.colorPickerElement.style.backgroundColor = hex;
                this.getAttributeFieldValue(0, 1).value = hex;
            }});
        });
    }

    colorToHex(input) {
        input = input.trim().toLowerCase();

        if (input.startsWith("#")) {
            return this.normalizeHex(input);
        }

        if (input.startsWith("rgb")) {
            const values = input.match(/\d+/g).map(Number);
            return this.rgbToHex(values[0], values[1], values[2]);
        }

        if (input.startsWith("hsl")) {
            const values = input.match(/\d+/g).map(Number);
            const [r, g, b] = this.hslToRgb(values[0], values[1], values[2]);
            return this.rgbToHex(r, g, b);
        }

        return "#000000";
    }

    normalizeHex(hex) {
        hex = hex.replace("#", "");

        if (hex.length === 3) {
            return "#" + hex.split("").map(c => c + c).join("");
        }

        if (hex.length === 6) {
            return "#" + hex;
        }

        return "#000000";
    }

    rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
            .map(x => x.toString(16).padStart(2, "0"))
            .join("")
        );
    }

    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);

        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return [
            Math.round(255 * f(0)),
            Math.round(255 * f(8)),
            Math.round(255 * f(4))
        ];
    }
}