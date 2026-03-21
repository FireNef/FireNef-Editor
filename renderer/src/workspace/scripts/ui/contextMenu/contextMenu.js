import * as FIRENEF from "firenef";

export default class ContextMenuScript extends FIRENEF.Script {
    constructor(name = "Context Menu Script") {
        super(name);

        this.overlay = null;
        this.editor = null;
    }

    static type = "contextMenuScript";

    start() {
        this.editor = window.firenefEditor;
        this.overlay = this.parent.element.querySelector(".overlay");

        this.overlay.addEventListener("click", () => this.doCancel());
        this.overlay.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.doCancel();
        });

        window.addEventListener("blur", () => {
            this.editor.clearContextMenu();
        });
    }

    doCancel() {
        for (const menu in this.editor.contextMenu) {
            const menuValues = this.editor.contextMenu[menu];
            if (menuValues?.inputs?.cancel && typeof menuValues.inputs.cancel == "function") menuValues.inputs.cancel();
        }

        this.editor.clearContextMenu();
    }

    update() {
        this.parent.visible = Object.keys(this.editor.contextMenu).length > 0;

        if (Object.keys(this.editor.contextMenu).length > 0) {
            for (const child of this.parent.children) {
                if (!(child instanceof FIRENEF.UiElement)) continue;
                if (this.editor.contextMenu[child.contextMenu]) {
                    const contextMenu = this.editor.contextMenu[child.contextMenu];
                    child.enable = true;
                    const height = child.host.offsetHeight;
                    if (contextMenu.position.y + height > window.innerHeight) {
                        child.host.style.top = window.innerHeight - height + "px";
                    } else {
                        child.host.style.top = contextMenu.position.y + "px";
                    }
                    child.host.style.left = contextMenu.position.x + "px";
                } else {
                    child.enable = false;
                }
            }
        }
    }
}