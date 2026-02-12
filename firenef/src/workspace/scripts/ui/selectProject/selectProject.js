import * as FIRENEF from "#firenef";
import { SelectProjectItemScript } from "./selectProjectItem.js";

export class SelectProjectScript extends FIRENEF.Script {
    constructor(name = "Select Project Script") {
        super(name);

        this.editor = null;
        this.element = null;

        this.oldProjectAmount = 0;

        this.refreshButton = null;
    }

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.refreshButton = this.element.querySelector(".refreshButton");
        this.refreshButton.addEventListener("click", () => this.updateProjectList());
    }

    updateProjectList() {
        this.removeAllProjectChildren();
        this.editor.getProjects().then((projects) => {
            for (const project of projects) {
                const projectItem = new FIRENEF.UiElement("Project Item");
                projectItem.setNonAsyncAttributeFieldValue(0, 0, "./src/workspace/ui/html/selectProject/selectProjectItem.html", "file", true);
                projectItem.setNonAsyncAttributeFieldValue(0, 1, "./src/workspace/ui/css/selectProject/selectProjectItem.css", "file", true);
                const projectItemScript = new SelectProjectItemScript("Project Item Script");
                projectItemScript.setNonAsyncAttributeFieldValue(0, 0, project, "string");
                projectItem.appendChild(projectItemScript);
                this.parent.appendChild(projectItem);
            }
        });
    }

    removeAllProjectChildren() {
        for (let i = 2; i < this.parent.children.length; i++) {
            this.parent.removeChild(this.parent.children[i]);
            i--;
        }
    }

    visiblityChanged() {
        if (!this.element) return;
        if (!this.parent.visible) {
            this.removeAllProjectChildren();
        } else {
            this.updateProjectList();
        }
    }

    update() {
        if (this.oldProjectAmount !== this.editor.projectAmount) {
            if (this.parent.visible) this.updateProjectList();
            this.oldProjectAmount = this.editor.projectAmount;
        }
    }
}