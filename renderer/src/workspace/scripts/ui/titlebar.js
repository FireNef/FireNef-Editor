import * as FIRENEF from "firenef";

export default class TitlebarScript extends FIRENEF.Script {
    constructor(name = "Titlebar Script") {
        super(name);

        this.element = null;
        this.host = null;
        this.editor = null;

        this.titlebar = null;
        this.fileButton = null;
        this.fileMenu = null;

        this.runButton = null;
        this.runMenu = null;

        this.editButton = null;
        this.editMenu = null;

        this.minimize = null;
        this.maximize = null;
        this.close = null;

        this.newProject = null;
        this.openProject = null;
        this.saveProject = null;
        this.saveProjectLine = null;
        this.preferences = null;
        this.exit = null;

        this.runProject = null;
        this.restartProject = null;
        this.stopProject = null;
    }

    static type = "titlebarScript";

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

        this.runProject = this.titlebar.querySelector("#runProject");
        this.restartProject = this.titlebar.querySelector("#restartProject");
        this.stopProject = this.titlebar.querySelector("#stopProject");

        this.fileButton = this.parent?.element.querySelector("#fileBtn");
        this.fileMenu = this.parent?.element.querySelector("#fileMenu");

        this.runButton = this.parent?.element.querySelector("#runBtn");
        this.runMenu = this.parent?.element.querySelector("#runMenu");

        this.editButton = this.parent?.element.querySelector("#editBtn");
        this.editMenu = this.parent?.element.querySelector("#editMenu");

        this.fileMenu.hidden = true;
        this.runMenu.hidden = true;
        this.editMenu.hidden = true;

        this.fileButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.fileMenu.hidden = !this.fileMenu.hidden;
            this.runMenu.hidden = true;
            this.editMenu.hidden = true;
        });

        this.runButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.runMenu.hidden = !this.runMenu.hidden;
            this.fileMenu.hidden = true;
            this.editMenu.hidden = true;
        });

        this.editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.editMenu.hidden = !this.editMenu.hidden;
            this.fileMenu.hidden = true;
            this.runMenu.hidden = true;
        });

        document.addEventListener("click", () => {
            this.fileMenu.hidden = true;
            this.runMenu.hidden = true;
            this.editMenu.hidden = true;
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

        this.runProject.addEventListener("click", async () => { 
            if (!await this.editor.isProjectRunning()) await this.editor.runProject();
        });
        this.restartProject.addEventListener("click", async () => {
            if (await this.editor.isProjectRunning()) this.editor.restartProject();
        });
        this.stopProject.addEventListener("click", async () => {
            if (await this.editor.isProjectRunning()) this.editor.stopProject();
        });
    }

    update() {
        if (this.editor.currentProject) {
            this.saveProjectLine.style.display = null;
            this.saveProject.style.display = null;
            this.runButton.style.display = null;
            this.editButton.style.display = null;
        } else {
            this.saveProjectLine.style.display = "none";
            this.saveProject.style.display = "none";
            this.runButton.style.display = "none";
            this.editButton.style.display = "none";
        }
        (async () => {
            if (await this.editor.isProjectRunning()) {
                this.runProject.style.color = "var(--current-overlay0)";
                this.restartProject.style.color = "var(--current-text)";
                this.stopProject.style.color = "var(--current-text)";
            } else {
                this.runProject.style.color = "var(--current-text)";
                this.restartProject.style.color = "var(--current-overlay0)";
                this.stopProject.style.color = "var(--current-overlay0)";
            }
        })();
    }
}