import * as FIRENEF from "firenef";

export class NewProjectOverlayScript extends FIRENEF.Script {
    constructor(name = "New Project Overlay Script") {
        super(name);

        this.element = null;
        this.editor = null;

        this.close = null;
        this.create = null;
        this.input = null;
        this.error = null;
        this.loadingbar = null;
    }

    async tryCreateProject(name) {
        const returnValue = await window.firenefEditor.createProject(name, () => {
            this.loadingbar.style.display = "block";
            this.create.style.display = "none";
            this.error.textContent = "";
            this.input.disabled = true;
        });

        if (returnValue?.error) {
            this.error.textContent = returnValue.error;
            this.input.disabled = false;
            this.loadingbar.style.display = "none";
            this.create.style.display = "block";
        } else {
            this.editor.clearOverlay();
            this.editor.openProject(name);
        }
    }

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.close = this.element.querySelector("#close");
        this.create = this.element.querySelector("#create");
        this.input = this.element.querySelector("input");
        this.error = this.element.querySelector("#error");
        this.loadingbar = this.element.querySelector(".loader-container");

        this.close.addEventListener("click", () => this.editor.clearOverlay());

        this.create.addEventListener("click", async () => await this.tryCreateProject(this.input.value));
        this.input.addEventListener("keydown", async (e) => {
            if (e.key == "Enter") await this.tryCreateProject(this.input.value);
        });
    }

    visiblityChanged() {
        if (!this.element) return;
        if (!this.parent.visible) {
            this.input.value = "";
            this.input.disabled = false;
            this.error.textContent = "";
            this.loadingbar.style.display = "none";
            this.create.style.display = "block";
        }
    }
}