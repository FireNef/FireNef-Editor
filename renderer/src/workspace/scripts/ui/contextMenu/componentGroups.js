import * as FIRENEF from "firenef";

export class ComponentGroupScript extends FIRENEF.Script {
    constructor(name = "Component Group Script") {
        super(name);

        this.editor = null;
        this.element = null;

        this.backgroundElement = null;

        this.oldProjectGroups = {};
    }

    updateContents() {
        this.backgroundElement.replaceChildren();

        for (const group of this.getSortedKeys(this.editor.projectGroups)) {
            const groupElement = document.createElement("button");
            groupElement.className = "menu-item";
            groupElement.id = "group";
            const groupNameElement = document.createElement("p");
            groupNameElement.textContent = group;
            groupElement.appendChild(groupNameElement);
            groupElement.appendChild(this.arrowSvgAsElement.cloneNode(true));

            groupElement.addEventListener("mouseenter", () => {
                const componentList = this.editor.contextMenu["componentList"];
                if (componentList) {
                    componentList.inputs.hoverAmount++;
                }
                const rect = groupElement.getBoundingClientRect();
                const menuX = rect.left + rect.width;
                const menuY = rect.top;
                this.editor.addContextMenu("componentList", { x: menuX, y: menuY }, undefined, { groupName: group, hoverAmount: 1, hoverCooldown: 500, callback: { newComponent: (className) => this.editor.contextMenu["componentGroups"].inputs.callback.newComponent(className) } });
            });

            groupElement.addEventListener("mouseleave", () => {
                const componentList = this.editor.contextMenu["componentList"];
                if (componentList) {
                    componentList.inputs.hoverAmount--;
                }
            });

            this.backgroundElement.appendChild(groupElement);
        }
    }

    getSortedKeys(obj) {
        return Object.keys(obj).sort((a, b) => a.localeCompare(b));
    }

    get arrowSvgAsElement() {
        const svgString = `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2 L7.5 6 L3.5 10" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const template = document.createElement("template");
        template.innerHTML = svgString.trim();
        return template.content.firstElementChild;
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
        });

        this.backgroundElement.addEventListener("mouseleave", () => {
            const componentGroups = this.editor.contextMenu["componentGroups"];
            if (componentGroups) {
                componentGroups.inputs.hoverAmount--;
            }
        });
    }

    update() {
        const componentGroups = this.editor.contextMenu["componentGroups"];
        if (!componentGroups || !componentGroups?.inputs) return;

        if (this.editor.projectGroups !== this.oldProjectGroups) {
            this.updateContents();
            this.oldProjectGroups = this.editor.projectGroups;
        }
        if (componentGroups.inputs.hoverAmount <= 0) {
            componentGroups.inputs.hoverCooldown -= 16.6666666667;
            if (componentGroups.inputs.hoverCooldown <= 0) {
                this.editor.removeContextMenu("componentGroups");
            }
        } else {
            componentGroups.inputs.hoverCooldown = 500;
        }
    }
}