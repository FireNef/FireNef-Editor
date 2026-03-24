import * as FIRENEF from "firenef";
import { BooleanInspectorScript, NumberInspectorScript, StringInspectorScript, Vector2InspectorScript, Vector3InspectorScript } from "./generalFieldInspectors.js";

export default class ComponentInspoectorScript extends FIRENEF.Script {
    constructor(name = "Component Inspector Script") {
        super(name);

        this.editor = null;
        this.element = null;

        this.selected = null;

        this.backgroundElement = null;
        this.baseTypeTextElement = null;
        this.typeTextElement = null;
        this.nameInputElement = null;

        this.enableControllElement = null;
        this.enableCheckboxElement = null;
        this.visibleCheckboxElement = null;
        this.hiddenCheckboxElement = null;

        this.attributesElement = null;
    }

    static type = "componentInspectorScript";

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.backgroundElement = this.element.querySelector(".background");
        this.baseTypeTextElement = this.element.querySelector("#baseTypeText");
        this.typeTextElement = this.element.querySelector("#typeText");
        this.nameInputElement = this.element.querySelector("#nameInput");

        this.enableControllElement = this.element.querySelector(".enableControll");
        this.enableCheckboxElement = this.element.querySelector("#enableCheckbox");
        this.visibleCheckboxElement = this.element.querySelector("#visibleCheckbox");
        this.hiddenCheckboxElement = this.element.querySelector("#hiddenCheckbox");

        this.nameInputElement.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key == "Enter") e.target.blur();
        });

        this.nameInputElement.addEventListener("change", () => {
            if (!this.selected) return;
            this.selected.component.name = this.nameInputElement.value;
            this.selected.refresh();
        });

        this.enableCheckboxElement.addEventListener("change", () => this.selected.component.enable = this.enableCheckboxElement.checked);
        this.visibleCheckboxElement.addEventListener("change", () => this.selected.component.visible = this.visibleCheckboxElement.checked);
        this.hiddenCheckboxElement.addEventListener("change", () => this.selected.component.hidden = this.hiddenCheckboxElement.checked);

        this.refresh();
    }
            
    refresh() {
        this.removeAllChildren();
        
        const classObject = this.selected?.classObject;
        const component = this.selected?.component;

        if (this.selected) {
            this.backgroundElement.style.display = null;

            this.baseTypeTextElement.textContent = `Base Type: ${classObject.baseType}`;
            this.typeTextElement.textContent = `Type: ${classObject.type}`;

            const iconComponent = new FIRENEF.SvgElement("Component Icon");
            iconComponent.setNonAsyncAttributeFieldValue(0, 0, this.editor.projectComponentIcons[classObject.icon[0]], "text");
            this.parent.appendChild(iconComponent);

            this.nameInputElement.style.display = "block";
            const componentName = component.name || this.editor.getClassName(classObject);
            component.name = componentName;
            this.nameInputElement.value = componentName;
            
            let enable = component.enable;
            if (enable == undefined) enable = true;
            component.enable = enable;

            let visible = component.visible;
            if (visible == undefined) visible = true;
            component.visible = visible;

            let hidden = component.hidden;
            if (hidden == undefined) hidden = false;
            component.hidden = hidden;

            this.enableCheckboxElement.checked = enable;
            this.visibleCheckboxElement.checked = visible;
            this.hiddenCheckboxElement.checked = hidden;

            this.addAttributeInspectors(classObject, component);
        } else {
            this.backgroundElement.style.display = "none";
        }
    }

    removeAllChildren() {
        for (let i = this.parent.children.length - 1; i > 0; i--) {
            this.parent.removeChild(this.parent.children[i]);
        }
    }

    update() {
        if (this.editor.currentSelection != this.selected) {
            this.selected = this.editor.currentSelection;
            if (this.selected) this.selected.inspectorRefresh = this.refresh.bind(this);
            this.refresh();
        }
    }

    addAttributeInspectors(classObject, component) {
        this.resolveEmptyAttributes(classObject, component);

        let childIndex = 2;

        if (this.attributesElement) this.attributesElement.remove();

        this.attributesElement = document.createElement("div");
        this.attributesElement.className = "attributes";
        this.backgroundElement.appendChild(this.attributesElement);

        const defaultAttributes = this.editor.getClassDefaultAttributes(classObject);
        for (const attriIndex in defaultAttributes) {
            const defaultAttribute = defaultAttributes[attriIndex];
            const attribute = component.attributes[attriIndex];

            const attributeElement = document.createElement("div");
            attributeElement.className = "attributeMenu";

            const attributeName = document.createElement("b");
            attributeName.className = "attributeName";
            attributeName.textContent = defaultAttribute.name;
            attributeElement.appendChild(attributeName);

            const attributeContainer = document.createElement("div");
            attributeContainer.className = "attributeContainer";
            attributeElement.appendChild(attributeContainer);

            const spacer = document.createElement("hr");
            attributeElement.appendChild(spacer);

            this.attributesElement.appendChild(attributeElement);

            for (const fieldIndex in defaultAttribute.fields) {

                const defaultField = defaultAttribute.fields[fieldIndex];
                const field = attribute[fieldIndex];

                const fieldComponentSlot = document.createElement("slot");
                fieldComponentSlot.name = `c${childIndex++}`;
                attributeContainer.appendChild(fieldComponentSlot);

                const fieldComponent = this.getFieldComponent(defaultField, field, fieldIndex == defaultAttribute.fields.length - 1);
                this.parent.appendChild(fieldComponent);
            }
        }
    }

    getFieldComponent(defaultField, field, isLast = false) {

        if (defaultField.setType == "boolean") {
            const fieldComponent = this.newUiElement("Boolean Field", "./src/workspace/ui/html/panel/inspectors/booleanInspector.html", "./src/workspace/ui/css/panel/inspectors/booleanInspector.css");

            const script = new BooleanInspectorScript();
            script.setNonAsyncAttributeFieldValue(0, 0, defaultField, "object");
            script.setNonAsyncAttributeFieldValue(0, 1, field, "object");
            script.setNonAsyncAttributeFieldValue(0, 2, isLast, "boolean");

            fieldComponent.appendChild(script);

            return fieldComponent;
        }
        if (defaultField.setType == "number") {
            const fieldComponent = this.newUiElement("Number Field", "./src/workspace/ui/html/panel/inspectors/numberInspector.html", "./src/workspace/ui/css/panel/inspectors/numberInspector.css");

            const script = new NumberInspectorScript();
            script.setNonAsyncAttributeFieldValue(0, 0, defaultField, "object");
            script.setNonAsyncAttributeFieldValue(0, 1, field, "object");
            script.setNonAsyncAttributeFieldValue(0, 2, isLast, "boolean");
            fieldComponent.appendChild(script);

            return fieldComponent;
        }
        if (defaultField.setType == "string" || defaultField.setType == "text") {
            const fieldComponent = this.newUiElement("String Field", "./src/workspace/ui/html/panel/inspectors/stringInspector.html", "./src/workspace/ui/css/panel/inspectors/stringInspector.css");

            const script = new StringInspectorScript();
            script.setNonAsyncAttributeFieldValue(0, 0, defaultField, "object");
            script.setNonAsyncAttributeFieldValue(0, 1, field, "object");
            script.setNonAsyncAttributeFieldValue(0, 2, isLast, "boolean");
            fieldComponent.appendChild(script);

            return fieldComponent;
        }
        if (defaultField.setType == "vec3") {
            const fieldComponent = this.newUiElement("Vec3 Field", "./src/workspace/ui/html/panel/inspectors/vec3Inspector.html", "./src/workspace/ui/css/panel/inspectors/vectorInspector.css");
        
            const script = new Vector3InspectorScript();
            script.setNonAsyncAttributeFieldValue(0, 0, defaultField, "object");
            script.setNonAsyncAttributeFieldValue(0, 1, field, "object");
            script.setNonAsyncAttributeFieldValue(0, 2, isLast, "boolean");
            fieldComponent.appendChild(script);

            return fieldComponent;
        }
        if (defaultField.setType == "vec2") {
            const fieldComponent = this.newUiElement("Vec2 Field", "./src/workspace/ui/html/panel/inspectors/vec2Inspector.html", "./src/workspace/ui/css/panel/inspectors/vectorInspector.css");
        
            const script = new Vector2InspectorScript();
            script.setNonAsyncAttributeFieldValue(0, 0, defaultField, "object");
            script.setNonAsyncAttributeFieldValue(0, 1, field, "object");
            script.setNonAsyncAttributeFieldValue(0, 2, isLast, "boolean");
            fieldComponent.appendChild(script);

            return fieldComponent;
        }
        
        const fieldComponent = new FIRENEF.UiElement("Placeholder");
        return fieldComponent;
    }

    newUiElement(name, htmlPath, cssPath) {
        const uiElement = new FIRENEF.UiElement(name);
        uiElement.setNonAsyncAttributeFieldValue(0, 0, htmlPath, "file", {}, true);
        uiElement.setNonAsyncAttributeFieldValue(0, 1, cssPath, "file", {}, true);
        return uiElement;
    }

    resolveEmptyAttributes(classObject, component) {
        if (!component.attributes) component.attributes = [];
        const defaultAttributes = this.editor.getClassDefaultAttributes(classObject);

        for (const attriIndex in defaultAttributes) {
            const defaultAttribute = defaultAttributes[attriIndex];
            if (!component.attributes[attriIndex]) component.attributes[attriIndex] = [];
            for (const fieldIndex in defaultAttribute.fields) {
                const defaultField = defaultAttribute.fields[fieldIndex];
                if (!component.attributes[attriIndex][fieldIndex]) component.attributes[attriIndex][fieldIndex] = {};

                const originalField = component.attributes[attriIndex][fieldIndex];

                const type = defaultField.type;
                const setType = defaultField.setType;
                const value = defaultField.value;
                const inputs = defaultField.inputs || {};

                if (originalField.type) continue;

                originalField.comment = defaultField.name;

                originalField.type = type;
                if (setType == "three") originalField.type = "variable";
                if (setType == "component" || setType == "texture") originalField.type = "reference";
                
                if (inputs.defaultValue) {
                    originalField.value = inputs.defaultValue;
                } else {
                    if (this.editor.isClass(value)) {
                        component.attributes[attriIndex][fieldIndex] = {};
                        continue;
                    }
                    originalField.value = value;
                }
            }
        }
    }
}