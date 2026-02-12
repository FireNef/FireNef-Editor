import * as FIRENEF from "#firenef";

export class ComponentTreeItemScript extends FIRENEF.Script {
    constructor(name = "Component Tree Item Script") {
        super(name);

        const componentDataAttribute = new FIRENEF.Attribute("Component Data");
        componentDataAttribute.addField("Component", "object", {});
        componentDataAttribute.addField("Depth", "number", 0);
        componentDataAttribute.addField("Index", "number", 0);
        this.attributes.push(componentDataAttribute);

        this.itemStart = 4;
        this.treeShown = false;

        this.element = null;
        this.editor = null;

        this.backgroundElement = null;
        this.nameElement = null;
        this.classNameElement = null;
        this.closedArrow = null;
        this.openArrow = null;
        this.arrows = null;
        this.textElement = null;
        this.renameElement = null;

        this.storedItemUi = ["", ""];
        this.icons = {};
    }

    refeshComponent() {
        if (!this.element) return;

        this.removeAllItemChildren();

        if (!this.getAttributeFieldValue(0, 0)?.children || this.getAttributeFieldValue(0, 0).children.length == 0) {
            this.closedArrow.style.display = "none";
            this.openArrow.style.display = "none";
            return;
        } else if (this.treeShown) {
            this.closedArrow.style.display = "none";
            this.openArrow.style.display = "block";
        } else {
            this.closedArrow.style.display = "block";
            this.openArrow.style.display = "none";
        }

        for (let i in this.getAttributeFieldValue(0, 0).children) {
            let component = this.getAttributeFieldValue(0, 0).children[i];
            if (component.type === "module") {
                component = this.editor.projectModules[component.path];
            }

            const item = new FIRENEF.UiElement("Component Tree Item");
            item.setNonAsyncAttributeFieldValue(0, 0, this.storedItemUi[0], "text");
            item.setNonAsyncAttributeFieldValue(0, 1, this.storedItemUi[1], "text");
            item.enable = this.treeShown;

            const itemScript = new ComponentTreeItemScript();
            itemScript.setNonAsyncAttributeFieldValue(0, 0, component, "object");
            itemScript.setNonAsyncAttributeFieldValue(0, 1, this.getAttributeFieldValue(0, 1) + 1, "number");
            itemScript.setNonAsyncAttributeFieldValue(0, 2, i, "number");
            item.appendChild(itemScript);

            const closedArrow = new FIRENEF.UiElement("Closed Arrow SVG");
            closedArrow.setNonAsyncAttributeFieldValue(0, 0, this.storedItemUi[2], "text");
            item.appendChild(closedArrow);

            const openArrow = new FIRENEF.UiElement("Open Arrow SVG");
            openArrow.setNonAsyncAttributeFieldValue(0, 0, this.storedItemUi[3], "text");
            item.appendChild(openArrow);

            const icon = new FIRENEF.UiElement("Icon SVG");
            icon.setNonAsyncAttributeFieldValue(0, 0, this.icons[this.editor.getClassIcon(component.class)[0]], "text");
            icon.setNonAsyncAttributeFieldValue(0, 1, this.storedItemUi[4], "text");
            item.appendChild(icon);

            this.parent.appendChild(item);
        }
    }

    updateTreeShown(state) {
        this.treeShown = state;

        if (!this.getAttributeFieldValue(0, 0)?.children || this.getAttributeFieldValue(0, 0).children.length == 0) {
            this.closedArrow.style.display = "none";
            this.openArrow.style.display = "none";
            return;
        } else if (this.treeShown) {
            this.closedArrow.style.display = "none";
            this.openArrow.style.display = "block";
        } else {
            this.closedArrow.style.display = "block";
            this.openArrow.style.display = "none";
        }

        for (let i = this.itemStart; i < this.parent.children.length; i++) {
            this.parent.children[i].enable = state;
        }
    }

    removeAllItemChildren() {
        for (let i = this.itemStart; i < this.parent.children.length; i++) {
            this.parent.removeChild(this.parent.children[i]);
            i--;
        }
    }

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.backgroundElement = this.element.querySelector(".background");
        this.nameElement = this.element.querySelector("#name");
        this.classNameElement = this.element.querySelector("#className");
        this.closedArrow = this.element.querySelector("#closedArrow");
        this.openArrow = this.element.querySelector("#openArrow");
        this.arrows = this.element.querySelector(".arrows");
        this.textElement = this.element.querySelector("#text");
        this.renameElement = this.element.querySelector("#rename");

        this.textElement.style.display = "flex";
        this.renameElement.style.display = "none";

        this.renameElement.addEventListener("blur", () => {
            this.renameElement.style.display = "none";
            this.textElement.style.display = "flex";
        });

        this.renameElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.nameElement.textContent = this.renameElement.value;
                this.getAttributeFieldValue(0, 0).name = this.renameElement.value;
                this.renameElement.value = "";
                this.renameElement.blur();
                this.renameElement.style.display = "none";
                this.textElement.style.display = "flex";
            }
            if (e.key === "Escape") {
                this.renameElement.style.display = "none";
                this.textElement.style.display = "flex";
            }
        });

        this.arrows.addEventListener("click", () => {
            this.updateTreeShown(!this.treeShown);
        });

        this.backgroundElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.backgroundElement.style.backgroundColor = "var(--current-surface0)";
            this.editor.setContextMenu("componentTreeItem", {x: e.clientX, y:  e.clientY}, () => this.backgroundElement.style.backgroundColor = null, { cancel: () => this.cancel(), callback: { newComponent: (className) => this.newComponent(className), rename: () => this.rename(), delete: () => this.delete() }});
        });

        this.insertAfterMultiple(this.getAttributeFieldValue(0, 1), "<hr>", this.backgroundElement.querySelector("#lines"));

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name || this.editor.getClassName(this.getAttributeFieldValue(0, 0).class);
        this.classNameElement.textContent = this.getAttributeFieldValue(0, 0).class;

        this.storedItemUi = this.parent.parent.children[0].storedItemUi;
        this.icons = this.parent.parent.children[0].icons;

        this.refeshComponent();
    }

    cancel() {
        this.textElement.style.display = "flex";
        this.renameElement.style.display = "none";
    }

    newComponent(className) {
        this.editor.clearContextMenu();
        const newComponent = {};
        newComponent.class = className.name;
        newComponent.type = "component";
        newComponent.name = this.editor.getClassNameFromClass(className);

        const defaultAttributes = this.editor.getClassDefaultAttributes(className);
        const formatedAttributes = [];
        for (const attribute of defaultAttributes) {
            const defaultFields = attribute.fields;
            const formatedFields = [];
            for (const field of defaultFields) {
                let value = field.value;
                let type = field.type;

                if (this.isClass(value)) {
                    value = `${this.editor.getGlobalVariableFromClass(value)}.${value.name}`;
                    type = "variable";
                    formatedFields.push({}); // current placeholder will be replaced with the actual variable when context is added at default value.
                    continue;
                }

                formatedFields.push({
                    comment: field.name,
                    type,
                    value
                });
            }
            formatedAttributes.push(formatedFields);
        }

        newComponent.attributes = formatedAttributes;

        if (!this.getAttributeFieldValue(0, 0).children) this.getAttributeFieldValue(0, 0).children = [];
        this.getAttributeFieldValue(0, 0).children.push(newComponent);
        this.refeshComponent();
    }

    isClass(v) {
        return v instanceof Object && v.constructor && v.constructor.name !== "Object";
    }

    rename() {
        this.renameElement.value = this.nameElement.textContent;
        this.renameElement.focus();
        setTimeout(() => {
            this.renameElement.focus();
        }, 100)
        this.textElement.style.display = "none";
        this.renameElement.style.display = "flex";
        this.editor.clearContextMenu();
    }

    delete() {
        this.editor.clearContextMenu();
        this.parent.parent.children[0].removeComponent(this.getAttributeFieldValue(0, 2));
        this.parent.removeParent();
    }

    removeComponent(childIndex) {
        this.getAttributeFieldValue(0, 0).children.splice(childIndex, 1);
    }

    insertAfterMultiple(count, html, target) {
        let out = "";

        for (let i = 0; i < count; i++) {
            out += html;
        }

        target.insertAdjacentHTML("afterend", out);
    }
}