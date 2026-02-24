import * as FIRENEF from "firenef";

export class ComponentTreeItemDragScript extends FIRENEF.Script {
    constructor(name = "Component Tree Item Drag Script") {
        super(name);

        this.editor = null;
        this.element = null;
        
        this.backgroundElement = null;
        this.nameElement = null;
    }

    updateElementContent() {
        const inputs = this.editor.dragInputs;

        this.removeOldIcons();

        this.parent.appendChild(inputs.icon);

        this.nameElement.innerText = inputs.name;
        this.backgroundElement.style.width = `${inputs.width}px`;
        console.log(inputs);
    }

    removeOldIcons() {
        for (const child of this.parent.children) {
            if (!(child instanceof FIRENEF.UiElement)) continue;
            this.parent.removeChild(child);
        }
    }

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.backgroundElement = this.element.querySelector(".background");
        this.nameElement = this.element.querySelector("#name");

        document.addEventListener("mousemove", (e) => {

            let x = e.clientX;
            let y = e.clientY - this.backgroundElement.offsetHeight;

            x = Math.max(0, Math.min(x, window.innerWidth - this.backgroundElement.offsetWidth));
            y = Math.max(32, Math.min(y, window.innerHeight - this.backgroundElement.offsetHeight));

            this.backgroundElement.style.left = `${x}px`;
            this.backgroundElement.style.top = `${y}px`;
        });

        this.updateElementContent();
    }

    visiblityChanged() {
        if (!this.visible) return;
        if (!this.editor) return;

        this.updateElementContent();
    }
}