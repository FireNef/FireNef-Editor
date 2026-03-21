import * as FIRENEF from "firenef";

export default class ComponentTreeItemContextMenuScript extends FIRENEF.Script {
    constructor(name = "Component Tree Item Context Menu Script") {
        super(name);

        this.editor = null;
        this.element = null;

        this.contextMenuName = null;

        this.newComponentElement = null;
        this.renameElement = null;
        this.deleteElement = null;
        this.backgroundElement = null;
    }

    static type = "componentTreeItemContextMenuScript";

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.contextMenuName = this.parent.contextMenu;

        this.newComponentElement = this.element.querySelector("#newComponent");
        this.renameElement = this.element.querySelector("#rename");
        this.deleteElement = this.element.querySelector("#delete");
        this.backgroundElement = this.element.querySelector(".background");

        this.backgroundElement.addEventListener("click", (e) => e.stopPropagation());

        this.newComponentElement.addEventListener("mouseenter", () => {
            const componentGroups = this.editor.contextMenu["componentGroups"];
            if (componentGroups) {
                componentGroups.inputs.hoverAmount++;
                return;
            }
            const rect = this.newComponentElement.getBoundingClientRect();
            const menuX = rect.left + rect.width;
            const menuY = rect.top;
            this.editor.addContextMenu("componentGroups", { x: menuX, y: menuY }, undefined, { hoverAmount: 1, hoverCooldown: 500, callback: { newComponent: (className, classObject) => this.editor.contextMenu["componentTreeItem"].inputs.callback.newComponent(className, classObject) } });
        });

        this.newComponentElement.addEventListener("mouseleave", () => {
            const componentGroups = this.editor.contextMenu["componentGroups"];
            if (componentGroups) {
                componentGroups.inputs.hoverAmount--;
            }
        });

        this.renameElement.addEventListener("click", () => this.editor.contextMenu[this.contextMenuName].inputs.callback.rename());
        this.deleteElement.addEventListener("click", () => this.editor.contextMenu[this.contextMenuName].inputs.callback.delete());
    }
}