import * as FIRENEF from "firenef";

export default class LeftPanelScript extends FIRENEF.Script {
    constructor(name = "Left Panel Script") {
        super(name);

        this.element = null;

        this.resizerElement = null;
        this.backgroundElement = null;
    }

    static type = "LeftPanelScript";

    start() {
        this.element = this.parent.element;
        this.backgroundElement = this.element.querySelector(".background");
        this.resizerElement = this.backgroundElement.querySelector(".resizer");

        this.startResize = this.startResize.bind(this);
        this.resize = this.resize.bind(this);
        this.stopResize = this.stopResize.bind(this);


        this.resizerElement.addEventListener("mousedown", this.startResize);
    }

    startResize() {
        this.resizerElement.style.backgroundColor = "var(--current-accent)";
        document.addEventListener("mousemove", this.resize);
        document.addEventListener("mouseup", this.stopResize);
    }

    stopResize() {
        this.resizerElement.style.backgroundColor = null;
        document.removeEventListener("mousemove", this.resize);
        document.removeEventListener("mouseup", this.stopResize);
    }

    resize(e) {
        this.backgroundElement.style.width = `${e.clientX}px`;
    }
}