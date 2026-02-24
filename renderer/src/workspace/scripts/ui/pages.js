import * as FIRENEF from "firenef";

export class PagesScript extends FIRENEF.Script {
    constructor(name = "Pages Script") {
        super(name);

        this.editor = null;
        this.pages = null;
    }

    start() {
        this.editor = window.firenefEditor;
        this.pages = this.parent;
    }

    update() {
        for (const page of this.pages.children) {
            if (!(page instanceof FIRENEF.UiElement)) continue;
            if (page.page == this.editor.page) {
                page.enable = true;
            } else {
                page.enable = false;
            }
        }
    }
}