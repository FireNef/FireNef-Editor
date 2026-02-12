import * as FIRENEF from "#firenef";
import { ComponentTreeItemScript } from "./componentTreeItem.js";

export class ComponentTreeScript extends FIRENEF.Script {

    static componentIconMapping = {
        component: "./assets/svgs/componentIcons/component.svg",
        controller: "./assets/svgs/componentIcons/controller.svg",
        componentController: "./assets/svgs/componentIcons/componentController.svg",
        uiElement: "./assets/svgs/componentIcons/uiElement.svg",
        uiController: "./assets/svgs/componentIcons/uiController.svg",
        script: "./assets/svgs/componentIcons/script.svg",
        svgElement: "./assets/svgs/componentIcons/svg.svg"
    };
    
    constructor(name = "Component Tree Script") {
        super(name);

        this.startModule = "project";

        this.editor = null;
        this.element = null;

        this.nameElement = null;
        this.backgroundElement = null;

        this.storedItemUi = ["", ""];
        this.icons = {};
    }

    getFileNameNoExt(path) {
        return path
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, "");
    }

    refeshComponents() {
        if (!this.editor.currentProject) return;
        if (!this.editor.projectModules) return;

        this.nameElement.innerText = this.getFileNameNoExt(this.startModule);

        this.removeAllItemChildren();

        let components = this.editor.projectModules?.[this.startModule]?.children;

        if (this.startModule == "project") {
            components = this.editor.projectModules?.["project"]?.updater;
        }

        for (let i in components) {
            let component = components[i];

            if (component.type === "module") {
                component = this.editor.projectModules[component.path];
            }

            const item = new FIRENEF.UiElement("Component Tree Item");
            item.setNonAsyncAttributeFieldValue(0, 0, this.storedItemUi[0], "text");
            item.setNonAsyncAttributeFieldValue(0, 1, this.storedItemUi[1], "text");

            const itemScript = new ComponentTreeItemScript();
            itemScript.setNonAsyncAttributeFieldValue(0, 0, component, "object");
            itemScript.setNonAsyncAttributeFieldValue(0, 1, 0, "number");
            itemScript.setNonAsyncAttributeFieldValue(0, 2, i, "object");
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

    removeAllItemChildren() {
        for (let i = 1; i < this.parent.children.length; i++) {
            this.parent.removeChild(this.parent.children[i]);
            i--;
        }
    }

    removeComponent(childIndex) {

        let components = this.editor.projectModules?.[this.startModule]?.children;

        if (this.startModule == "project") {
            components = this.editor.projectModules?.["project"]?.updater;
        }

        components.splice(childIndex, 1);
    }

    newComponent(className) {
        
    }

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.backgroundElement = this.element.querySelector(".background");

        this.backgroundElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.editor.addContextMenu("componentTree", { x: e.clientX, y:  e.clientY }, undefined, { callback: { newComponent: (className) => this.newComponent(className) } });
        });

        this.editor.fetchNonAsyncFilesAsText(
            [
                "./src/workspace/ui/html/menus/componentTreeItem.html",
                "./src/workspace/ui/css/menus/componentTreeItem.css",
                "./assets/svgs/arrowClosed.svg",
                "./assets/svgs/arrowOpen.svg",
                "./src/workspace/ui/css/menus/componentIcon.css"
            ],
            (data) => {
                this.editor.fetchNonAsyncFilesAsText(Object.values(ComponentTreeScript.componentIconMapping), (icons) => {
                    this.icons = Object.keys(ComponentTreeScript.componentIconMapping).reduce((acc, key, index) => {
                        acc[key] = icons[index];
                        return acc;
                    }, {});

                    this.storedItemUi = data;
                    this.refeshComponents();
                });
            }
        );
    }
}