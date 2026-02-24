import * as FIRENEF from "firenef";

export class ComponentTreeItemScript extends FIRENEF.Script {
    constructor(name = "Component Tree Item Script") {
        super(name);

        const componentDataAttribute = new FIRENEF.Attribute("Component Data");
        componentDataAttribute.addField("Component", "object", {});
        componentDataAttribute.addField("Depth", "number", 0);
        componentDataAttribute.addField("Index", "number", 0);
        this.attributes.push(componentDataAttribute);

        this.itemStart = 4;

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
        this.iconElement = null;

        this.storedItemUi = [];

        this.mouseDown = false;
        this.drag = false;
    }

    refreshComponents() {
        if (!this.element) return;

        this.removeAllItemChildren();

        if (!this.getAttributeFieldValue(0, 0)?.children || this.getAttributeFieldValue(0, 0).children.length == 0) {
            this.closedArrow.style.display = "none";
            this.openArrow.style.display = "none";
            return;
        } else if (this.getAttributeFieldValue(0, 0).treeShown) {
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
            item.enable = this.getAttributeFieldValue(0, 0).treeShown;

            const itemScript = new ComponentTreeItemScript();
            itemScript.setNonAsyncAttributeFieldValue(0, 0, component, "object");
            itemScript.setNonAsyncAttributeFieldValue(0, 1, this.getAttributeFieldValue(0, 1) + 1, "number");
            itemScript.setNonAsyncAttributeFieldValue(0, 2, i, "number");
            item.appendChild(itemScript);

            const closedArrow = new FIRENEF.SvgElement("Closed Arrow SVG");
            closedArrow.setNonAsyncAttributeFieldValue(0, 0, this.storedItemUi[2], "text");
            item.appendChild(closedArrow);

            const openArrow = new FIRENEF.SvgElement("Open Arrow SVG");
            openArrow.setNonAsyncAttributeFieldValue(0, 0, this.storedItemUi[3], "text");
            item.appendChild(openArrow);

            const icon = new FIRENEF.SvgElement("Icon SVG");
            icon.setNonAsyncAttributeFieldValue(0, 0, this.editor.projectComponentIcons[this.editor.getClassIcon(component.class)[0]], "text");
            icon.setNonAsyncAttributeFieldValue(0, 1, this.storedItemUi[4], "text");
            item.appendChild(icon);

            this.parent.appendChild(item);
        }
    }

    updateTreeShown(state) {
        this.getAttributeFieldValue(0, 0).treeShown = state;

        if (!this.getAttributeFieldValue(0, 0)?.children || this.getAttributeFieldValue(0, 0).children.length == 0) {
            this.closedArrow.style.display = "none";
            this.openArrow.style.display = "none";
            return;
        } else if (this.getAttributeFieldValue(0, 0).treeShown) {
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
        this.iconElement = this.element.querySelector(".icon");

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
            this.updateTreeShown(!this.getAttributeFieldValue(0, 0).treeShown);
        });

        this.backgroundElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.backgroundElement.style.backgroundColor = "var(--current-surface0)";
            this.editor.setContextMenu("componentTreeItem", {x: e.clientX, y:  e.clientY}, () => this.backgroundElement.style.backgroundColor = null, { cancel: () => this.cancel(), callback: { newComponent: (className) => this.newComponent(className), rename: () => this.rename(), delete: () => this.delete() }});
        });

        const line = document.createElement("div");

        line.style.position = "absolute";
        line.style.height = "4px";
        line.style.width = "50%";
        line.style.top = "-2px";
        line.style.left = "25%";
        line.style.background = "var(--current-overlay2)";
        line.style.pointerEvents = "none";
        line.style.borderRadius = "99px";
        line.style.display = "none";
        line.style.zIndex = 10;

        this.backgroundElement.appendChild(line);

        this.backgroundElement.addEventListener("mousemove", (e) => {
            e.preventDefault();

            if (this.drag) return;

            if (this.editor.drag) {
                this.backgroundElement.style.backgroundColor = "var(--current-mantle)";

                const y = e.clientY - this.backgroundElement.getBoundingClientRect().top;
                const height = this.backgroundElement.offsetHeight;

                const relativeY = y / height;

                line.style.display = "block";
                line.style.top = null;
                line.style.bottom = null;
                line.style.left = null;

                if (!this.getAttributeFieldValue(0, 0).treeShown) {
                    if (relativeY < 0.25) {
                        line.style.top = "-2px";
                        line.style.left = "25%";
                    }
                    if (relativeY > 0.75) {
                        line.style.top = `${height - 2}px`;
                        line.style.left = "25%";
                    }
                    if (relativeY >= 0.25 && relativeY <= 0.75) {
                        line.style.display = "none";
                        this.backgroundElement.style.backgroundColor = "var(--current-surface0)";
                    }
                } else {
                    if (relativeY < 0.5) {
                        line.style.top = "-2px";
                        line.style.left = "25%";
                    }
                    if (relativeY >= 0.5) {
                        line.style.top = `${height - 2}px`;
                        line.style.left = "25%";
                    }
                }
            } else {
                this.backgroundElement.style.backgroundColor = null;
            }
        });

        this.backgroundElement.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();

            this.mouseDown = true;
        });

        this.backgroundElement.addEventListener("mouseup", (e) => {
            e.preventDefault();
            e.stopPropagation();

            this.mouseDown = false;

            if (this.editor.currentDrag != "componentTreeItem") return;

            if (!this.drag) {
                const movedComponent = structuredClone(this.editor.dragInputs.component);
                const deleteFunction = this.editor.dragInputs.deleteFunction;

                const y = e.clientY - this.backgroundElement.getBoundingClientRect().top;
                const height = this.backgroundElement.offsetHeight;

                const relativeY = y / height;

                if (!this.getAttributeFieldValue(0, 0).treeShown) {
                    if (relativeY < 0.25) {
                        this.placeComponentOver(movedComponent, deleteFunction);
                    }
                    if (relativeY > 0.75) {
                        this.placeComponentUnder(movedComponent, deleteFunction);
                    }
                    if (relativeY >= 0.25 && relativeY <= 0.75) {
                        this.placeComponentBottom(movedComponent, deleteFunction);
                    }
                } else {
                    if (relativeY < 0.5) {
                        this.placeComponentOver(movedComponent, deleteFunction);
                    }
                    if (relativeY >= 0.5) {
                        this.placeComponentTop(movedComponent, deleteFunction);
                    }
                }
            
            }

            this.editor.clearDrag();
        });

        this.backgroundElement.addEventListener("mouseleave", () => {
            line.style.display = "none";

            if (!this.mouseDown) return;
            this.mouseDown = false;

            this.hideInsides();
            this.editor.setDrag("componentTreeItem", () => this.showInsides(), { component: this.getAttributeFieldValue(0, 0), name: this.nameElement.textContent, icon: this.parent.children[3].deepClone(), deleteFunction: () => this.delete() });
        });

        document.addEventListener("blur", () => this.mouseDown = false);

        this.insertAfterMultiple(this.getAttributeFieldValue(0, 1), "<hr>", this.backgroundElement.querySelector("#lines"));

        this.nameElement.textContent = this.getAttributeFieldValue(0, 0).name || this.editor.getClassName(this.getAttributeFieldValue(0, 0).class);
        this.classNameElement.textContent = this.getAttributeFieldValue(0, 0).class;

        this.storedItemUi = this.parent.parent.children[0].storedItemUi;

        if (!this.getAttributeFieldValue(0, 0).treeShown) this.getAttributeFieldValue(0, 0).treeShown = false;

        this.refreshComponents();
    }

    placeComponentTop(component, deleteFunction = () => {}) {
        deleteFunction();

        const componentTree = this.getAttributeFieldValue(0, 0);
        if (!componentTree.children) componentTree.children = [];
        componentTree.children.unshift(component);

        this.refreshComponents();
    }

    placeComponentBottom(component, deleteFunction = () => {}) {
        deleteFunction();

        const componentTree = this.getAttributeFieldValue(0, 0);
        if (!componentTree.children) componentTree.children = [];
        componentTree.children.push(component);

        this.getAttributeFieldValue(0, 0).treeShown = true;
        this.refreshComponents();
    }

    placeComponentOver(component, deleteFunction = () => {}) {
        const parentScript = this.parent.parent.children[0];
        deleteFunction();

        parentScript.addComponentAt(component, this.getAttributeFieldValue(0, 2));
        parentScript.refreshComponents();
    }

    placeComponentUnder(component, deleteFunction = () => {}) {
        const parentScript = this.parent.parent.children[0];
        deleteFunction();

        parentScript.addComponentAt(component, this.getAttributeFieldValue(0, 2) + 1);
        parentScript.refreshComponents();
    }

    addComponentAt(component, index) {
        const componentTree = this.getAttributeFieldValue(0, 0);
        componentTree.children.splice(index, 0, component);
    }

    hideInsides() {
        this.iconElement.style.opacity = 0;
        this.textElement.querySelectorAll("*").forEach(e => e.style.opacity = 0);
        this.arrows.querySelectorAll("*").forEach(e => e.style.opacity = 0);
        this.backgroundElement.style.backgroundColor = "var(--current-surface0)";

        this.drag = true;

        this.getAttributeFieldValue(0, 0).treeShown = false;
        this.refreshComponents();
    }

    showInsides() {
        this.iconElement.style.opacity = 1;
        this.textElement.querySelectorAll("*").forEach(e => e.style.opacity = 1);
        this.arrows.querySelectorAll("*").forEach(e => e.style.opacity = 1);
        this.backgroundElement.style.backgroundColor = null;

        this.drag = false;
    }

    cancel() {
        this.textElement.style.display = "flex";
        this.renameElement.style.display = "none";
    }

    newComponent(className) {
        this.editor.clearContextMenu();

        const newComponent = this.editor.createNewComponentJson(className);

        if (!this.getAttributeFieldValue(0, 0).children) this.getAttributeFieldValue(0, 0).children = [];
        this.getAttributeFieldValue(0, 0).children.push(newComponent);
        this.getAttributeFieldValue(0, 0).treeShown = true;
        this.refreshComponents();
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
        this.parent.parent.children[0].refreshComponents();
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