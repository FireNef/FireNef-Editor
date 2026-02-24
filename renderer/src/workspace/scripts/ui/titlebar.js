import * as FIRENEF from "firenef";

export class TitlebarScript extends FIRENEF.Script {
    constructor(name = "Titlebar Script") {
        super(name);

        this.element = null;
        this.host = null;
        this.editor = null;

        this.titlebar = null;
        this.fileButton = null;
        this.fileMenu = null;

        this.minimize = null;
        this.maximize = null;
        this.close = null;

        this.newProject = null;
        this.openProject = null;
        this.saveProject = null;
        this.saveProjectLine = null;
        this.preferences = null;
        this.exit = null;
    }

    start() {
        this.element = this.parent?.element;
        this.host = this.parent?.host;
        this.editor = window.firenefEditor;

        this.titlebar = this.element.querySelector("#titlebar");

        this.minimize = this.titlebar.querySelector("#minimize");
        this.maximize = this.titlebar.querySelector("#maximize");
        this.close = this.titlebar.querySelector("#close");

        this.newProject = this.titlebar.querySelector("#newProject");
        this.openProject = this.titlebar.querySelector("#openProject");
        this.saveProject = this.titlebar.querySelector("#saveProject");
        this.saveProjectLine = this.titlebar.querySelector("#saveProjectLine");
        this.preferences = this.titlebar.querySelector("#preferences");
        this.exit = this.titlebar.querySelector("#exit");

        this.fileButton = this.parent?.element.querySelector("#fileBtn");
        this.fileMenu = this.parent?.element.querySelector("#fileMenu");

        this.fileMenu.hidden = true;

        this.fileButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.fileMenu.hidden = !this.fileMenu.hidden;
        });

        document.addEventListener("click", () => {
            this.fileMenu.hidden = true;
        });

        window.addEventListener("focus", () => {
            this.host.toggleAttribute("window-unfocused", false);
        });

        window.addEventListener("blur", () => {
            this.host.toggleAttribute("window-unfocused", true);
        });

        this.minimize.addEventListener("click", () => window.windowControls.minimize());
        this.maximize.addEventListener("click", () => window.windowControls.maximize());
        this.close.addEventListener("click", () => window.windowControls.close());

        this.newProject.addEventListener("click", () => this.editor.setOverlay("newProject"));
        this.openProject.addEventListener("click", () => this.editor.setOverlay("openProject"));
        this.saveProject.addEventListener("click", () => this.editor.saveProject());
        this.exit.addEventListener("click", () => window.windowControls.close());
    }

    update() {
        if (this.editor.currentProject) {
            this.saveProjectLine.style.display = null;
            this.saveProject.style.display = null;
        } else {
            this.saveProjectLine.style.display = "none";
            this.saveProject.style.display = "none";
        }
    }
}