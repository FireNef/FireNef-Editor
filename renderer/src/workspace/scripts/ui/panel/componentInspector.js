import * as FIRENEF from "firenef";

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
}