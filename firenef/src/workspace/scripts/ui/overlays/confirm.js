import * as FIRENEF from "#firenef";

export class ConfirmOverlayScript extends FIRENEF.Script {
    constructor(name = "Confirm Overlay Script") {
        super(name);

        this.element = null;
        this.editor = null;

        this.close = null;
        this.message = null;
        this.confirm = null;
        this.cancel = null;
    }

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.close = this.element.querySelector("#close");
        this.message = this.element.querySelector("#message");
        this.confirm = this.element.querySelector("#confirm");
        this.cancel = this.element.querySelector("#cancel");

        this.confirm.addEventListener("click", () => {
            this.editor.overlayInputs.onConfirm();
            this.editor.clearOverlay();
        });

        this.cancel.addEventListener("click", () => this.editor.clearOverlay());
        this.close.addEventListener("click", () => this.editor.clearOverlay());
    }

    visiblityChanged() {
        if (!this.element) return;
        if (!this.parent.visible) {
            this.message.textContent = "";
        } else {
            this.message.textContent = this.editor.overlayInputs.message;
        }
    }
}