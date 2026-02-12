import * as FIRENEF from "#firenef";

export class OpenProjectOverlayScript extends FIRENEF.Script {
    constructor(name = "Open Project Overlay Script") {
        super(name);

        this.element = null;
        this.editor = null;

        this.close = null;
    }

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.close = this.element.querySelector("#close");

        this.close.addEventListener("click", () => this.editor.clearOverlay());
    }
}