import * as FIRENEF from "firenef";

export default class OverlayScript extends FIRENEF.Script {
    constructor(name = "Overlay Script") {
        super(name);

        this.overlay = null;
        this.editor = null;
    }

    static type = "overlayScript";

    start() {
        this.overlay = this.parent;
        this.editor = window.firenefEditor;
    }

    update() {
        this.overlay.visible = this.editor.overlay;
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