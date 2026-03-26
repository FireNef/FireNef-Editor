import * as FIRENEF from "firenef";

export default class ColorPickerOverlayScript extends FIRENEF.Script {
    constructor(name = "Color Picker Overlay Script") {
        super(name);

        this.element = null;
        this.editor = null;

        this.close = null;
    }

    static type = "colorPickerOverlayScript"

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.close = this.element.querySelector("#close");

        this.close.addEventListener("click", () => this.editor.clearOverlay());
    }
}