import * as FIRENEF from "#firenef";

export class ComponentListContextMenuScript extends FIRENEF.Script {
    constructor(name = "Component List Context Menu Script") {
        super(name);

        this.editor = null;
        this.element = null;
        
        this.backgroundElement = null;

        this.oldProjectGroups = {};
        this.oldGroupName = null;
    }

    updateContents() {
        const groupName = this.editor.contextMenu["componentList"].inputs.groupName;
        const components = this.editor.projectGroups[groupName] || [];

        this.backgroundElement.replaceChildren();

        for (const component of components) {
            const componentElement = document.createElement("button");
            componentElement.className = "menu-item";
            componentElement.id = "component";

            componentElement.addEventListener("click", () => this.editor.contextMenu["componentList"].inputs.callback.newComponent(component));

            const template = document.createElement("template");
            template.innerHTML = this.editor.projectComponentIcons[component.icon[0]] || "";
            componentElement.appendChild(template.content.firstElementChild);

            const componentNameElement = document.createElement("p");
            componentNameElement.textContent = component.name;
            componentElement.appendChild(componentNameElement);

            this.backgroundElement.appendChild(componentElement);
        }
    }

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.backgroundElement = this.element.querySelector(".background");

        this.backgroundElement.addEventListener("click", (e) => e.stopPropagation());

        this.backgroundElement.addEventListener("mouseenter", () => {
            const componentGroups = this.editor.contextMenu["componentGroups"];
            if (componentGroups) {
                componentGroups.inputs.hoverAmount++;
            }

            const componentList = this.editor.contextMenu["componentList"];
            if (componentList) {
                componentList.inputs.hoverAmount++;
            }
        });

        this.backgroundElement.addEventListener("mouseleave", () => {
            const componentGroups = this.editor.contextMenu["componentGroups"];
            if (componentGroups) {
                componentGroups.inputs.hoverAmount--;
            }

            const componentList = this.editor.contextMenu["componentList"];
            if (componentList) {
                componentList.inputs.hoverAmount--;
            }
        });
    }

    update() {
        const componentList = this.editor.contextMenu["componentList"];
        if (!componentList || !componentList?.inputs) return;

        if (this.editor.projectGroups !== this.oldProjectGroups || componentList.inputs.groupName !== this.oldGroupName) {
            this.updateContents();
            this.oldProjectGroups = this.editor.projectGroups;
            this.oldGroupName = componentList.inputs.groupName;
        }
        
        if (componentList.inputs.hoverAmount <= 0) {
            componentList.inputs.hoverCooldown -= 16.6666666667;
            if (componentList.inputs.hoverCooldown <= 0) {
                this.editor.removeContextMenu("componentList");
            }
        } else {
            componentList.inputs.hoverCooldown = 500;
        }
    }
}