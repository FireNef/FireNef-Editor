import * as FIRENEF from "#firenef";

export class TitlebarScript extends FIRENEF.Script {
    constructor(name = "Titlebar Script") {
        super(name);

        this.titlebar = null;
        this.host = null;
    }

    start() {
        this.titlebar = this.parent?.element.querySelector("#titlebar");
        this.host = this.parent?.host;

        const fileBtn = this.parent?.element.querySelector("#fileBtn");
        const fileMenu = this.parent?.element.querySelector("#fileMenu");

        fileMenu.hidden = true;

        fileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            fileMenu.hidden = !fileMenu.hidden;
        });

        document.addEventListener("click", () => {
            fileMenu.hidden = true;
        });

        window.addEventListener("focus", () => {
            this.host.toggleAttribute("window-unfocused", false);
        });

        window.addEventListener("blur", () => {
            this.host.toggleAttribute("window-unfocused", true);
        });

        this.titlebar.querySelector("#minimize").addEventListener("click", () => window.windowControls.minimize());
        this.titlebar.querySelector("#maximize").addEventListener("click", () => window.windowControls.maximize());
        this.titlebar.querySelector("#close").addEventListener("click", () => window.windowControls.close());

        this.titlebar.querySelector("#newProject").addEventListener("click", () => window.firenefEditor.setOverlay("newProject"));
        this.titlebar.querySelector("#openProject").addEventListener("click", () => window.firenefEditor.setOverlay("openProject"));
        this.titlebar.querySelector("#exit").addEventListener("click", () => window.windowControls.close());
    }
}