import * as FIRENEF from "firenef";

export class OverlayScript extends FIRENEF.Script {
    constructor(name = "Overlay Script") {
        super(name);

        this.overlay = null;
        this.editor = null;
    }

    start() {
        this.overlay = this.parent;
        this.editor = window.firenefEditor;
    }

    update() {
        this.overlay.visible = this.editor.overlay;
        console.log(this.overlay.visible);
        if (this.editor.currentOverlay) {
            for (const child of this.overlay.children) {
                if (child.overlay == this.editor.currentOverlay) {
                    child.visible = true;
                } else {
                    child.visible = false;
                }
            }
        }
    }
}