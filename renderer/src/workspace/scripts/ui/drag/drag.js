import * as FIRENEF from "firenef";

export class DragScript extends FIRENEF.Script {
    constructor(name = "Drag Script") {
        super(name);
    }

    start() {
        this.editor = window.firenefEditor;
    }

    update() {
        this.parent.visible = this.editor.drag;
        if (this.editor.currentDrag) {
            for (const child of this.parent.children) {
                if (!(child instanceof FIRENEF.UiElement)) continue;
                if (child.drag == this.editor.currentDrag) {
                    child.enable = true;
                } else {
                    child.enable = false;
                }
            }
        }
    }
}