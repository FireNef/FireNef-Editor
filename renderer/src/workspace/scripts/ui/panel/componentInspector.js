import * as FIRENEF from "firenef";
import { BooleanInspectorScript, NumberInspectorScript, StringInspectorScript, Vector2InspectorScript, Vector3InspectorScript, ColorInspectorScript, DropdownInspectorScript } from "./generalFieldInspectors.js";

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

            const topBar = document.createElement("div");
            topBar.className = "topBar";
            attributeElement.appendChild(topBar);

            const iconElement = document.createElement("div");
            iconElement.className = "attributeIcon";
            iconElement.innerHTML= `<svg width="48" height="48" viewBox="0 0 12.7 12.7" version="1.1" id="svg1" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <sodipodi:namedview id="namedview1" pagecolor="#505050" bordercolor="#eeeeee" borderopacity="1" inkscape:showpageshadow="0" inkscape:pageopacity="0" inkscape:pagecheckerboard="0" inkscape:deskcolor="#505050" inkscape:document-units="mm"> <inkscape:page x="0" y="0" width="12.7" height="12.7" id="page2" margin="0" bleed="0" /> </sodipodi:namedview> <defs id="defs1"> <inkscape:path-effect effect="fillet_chamfer" id="path-effect2" is_visible="true" lpeversion="1" nodesatellites_param="F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,6.9174248,0,1 @ F,0,0,1,0,1.3116814,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,1.7283161,0,1 @ F,0,0,1,0,6.554297,0,1 @ F,0,0,1,0,0,0,1" radius="0" unit="px" method="auto" mode="F" chamfer_steps="1" flexible="false" use_knot_distance="true" apply_no_radius="true" apply_with_radius="true" only_selected="false" hide_knots="false" /> </defs> <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1"> <path d="m 80.078316,92.90544 c -1.098847,1.32e-4 -2.152635,0.436778 -2.929537,1.21388 l -15.231961,15.23196 a 2.8652913,2.8652913 67.499999 0 0 2.026067,4.89136 h 0.247379 a 3.1666787,3.1666787 157.5 0 0 2.23918,-0.9275 l 11.796789,-11.79679 c 1.023045,-1.02296 2.681638,-1.02296 3.704683,0 l 11.501692,11.50216 a 4.1724038,4.1724038 22.500584 0 0 2.950395,1.22213 l 0.19439,0 a 2.7148787,2.7148787 112.5 0 0 1.919709,-4.63459 L 83.00837,94.11932 c -0.777029,-0.777229 -1.831028,-1.213886 -2.930054,-1.21388 z" style="stroke-width:0.264583" id="path1" inkscape:path-effect="#path-effect2" inkscape:original-d="m 80.078316,92.90544 a 4.1431604,4.1431604 0 0 0 -2.929537,1.21388 L 57.02546,114.24264 h 8.476485 l 12.724288,-12.72429 a 2.6197164,2.6197164 0 0 1 3.704683,0 l 12.723771,12.72429 h 8.477003 L 83.00837,94.11932 a 4.1431604,4.1431604 0 0 0 -2.930054,-1.21388 z" transform="matrix(-0.32604917,0,0,-0.32604917,32.494231,40.331234)" /> </g> </svg>`;
            iconElement.style.transform = "rotate(-90deg)";
            topBar.appendChild(iconElement);

            const attributeName = document.createElement("b");
            attributeName.className = "attributeName";
            attributeName.textContent = defaultAttribute.name;
            topBar.appendChild(attributeName);

            const attributeContainer = document.createElement("div");
            attributeContainer.className = "attributeContainer";
            attributeContainer.style.display = "none";
            attributeElement.appendChild(attributeContainer);

            topBar.addEventListener("click", (e) => {
                e.stopPropagation();
                if (attributeContainer.style.display == "none") {
                    attributeContainer.style.display = null
                    iconElement.style.transform = "rotate(0deg)";
                } else {
                    attributeContainer.style.display = "none";
                    iconElement.style.transform = "rotate(-90deg)";
                }
            });

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

        if (defaultField?.inputs?.options) {
            const fieldComponent = this.newUiElement("Option Field", "./src/workspace/ui/html/panel/inspectors/dropdownInspector.html", "./src/workspace/ui/css/panel/inspectors/dropdownInspector.css");

            const script = new DropdownInspectorScript();
            script.setNonAsyncAttributeFieldValue(0, 0, defaultField, "object");
            script.setNonAsyncAttributeFieldValue(0, 1, field, "object");
            script.setNonAsyncAttributeFieldValue(0, 2, isLast, "boolean");

            fieldComponent.appendChild(script);

            return fieldComponent;
        }
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
        if (defaultField.setType == "string" || defaultField.setType == "text" || defaultField.setType == "path" || defaultField.setType == "imagePath" || defaultField.setType == "jsonPath") {
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
        if (defaultField.setType.includes("color")) {
            const fieldComponent = this.newUiElement("Color Field", "./src/workspace/ui/html/panel/inspectors/colorInspector.html", "./src/workspace/ui/css/panel/inspectors/colorInspector.css");
        
            const script = new ColorInspectorScript();
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

                if (inputs.defaultValue) {
                    originalField.value = inputs.defaultValue;
                } else {
                    if (this.editor.isClass(value)) {
                        component.attributes[attriIndex][fieldIndex] = {};
                        continue;
                    }
                    originalField.value = value;
                }

                originalField.type = type;
                if (setType == "three") {
                    originalField.type = "variable";
                    if (!this.editor.isValidVariable(originalField.value)) originalField.type = "string";
                }
                if (setType == "component" || setType == "texture") originalField.type = "reference";
            }
        }
    }
}