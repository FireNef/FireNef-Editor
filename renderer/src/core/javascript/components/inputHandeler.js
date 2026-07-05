import { Component } from "./component.js";
import { Attribute } from "./attributes.js";
import { Viewport } from "./viewport.js";

export class InputHandeler extends Component {
    constructor(name = "Input Handeler") {
        super(name);

        const inputHandelerAttr = new Attribute("Input Handeler");
        inputHandelerAttr.addField("Mouse Enable", "boolean", true);
        inputHandelerAttr.addField("Keyboard Enable", "boolean", true);
        inputHandelerAttr.addField("Gamepad Enable", "boolean", true);

        inputHandelerAttr.addField("Console Enable", "boolean", true);
        inputHandelerAttr.addField("Clamp Mouse", "boolean", true);
        this.attributes.push(inputHandelerAttr);

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseLeftDown = false;
        this.mouseRightDown = false;
        this.mouseMiddleDown = false;
        this.mouse4Down = false;
        this.mouse5Down = false;
        this.scrollTriggerList = [];

        this.keysDown = new Map();

        this.viewport = null;

        this.resolution = { width: 0, height: 0 };
        this.offsets = { x: 0, y: 0 };
        this.elementSize = { width: 0, height: 0 };
    }

    static baseType = "inputHandeler"
    static type = "inputHandeler"
    static icon = ["inputHandeler", ...super.icon]

    static defaultID = "inputHandeler";

    updateMouseButtons(e) {
        const buttons = e.buttons;

        this.mouseLeftDown = !!(buttons & 1);
        this.mouseRightDown = !!(buttons & 2);
        this.mouseMiddleDown = !!(buttons & 4);
        this.mouse4Down = !!(buttons & 8);
        this.mouse5Down = !!(buttons & 16);
    }

    updateMousePosition(e) {
        this.mouseX = (e.clientX - this.offsets.x) / this.elementSize.width * this.resolution.width;
        this.mouseY = (e.clientY - this.offsets.y) / this.elementSize.height * this.resolution.height;

        if (this.getAttr("Input Handeler", "Clamp Mouse")) {
            if (this.mouseX > this.resolution.width) this.mouseX = this.resolution.width;
            if (this.mouseY > this.resolution.height) this.mouseY = this.resolution.height;
            if (this.mouseX < 0) this.mouseX = 0;
            if (this.mouseY < 0) this.mouseY = 0;
        }
    }

    updateOffsets(elementWidth, elementHeight, offsetX, offsetY) {
        this.offsets = { x: offsetX, y: offsetY };
        this.elementSize = { width: elementWidth, height: elementHeight };
        this.resolution = { width: this.viewport.actualResolution.width, height: this.viewport.actualResolution.height };
    }

    start() {
        this.viewport = this.getFirstParentOfType(Viewport);
        if (!this.viewport) {
            this.enable = false;
            return;
        }

        this.viewport.elementChangeUpdateList.push((w, h, l, t) => this.updateOffsets(w, h, l, t));

        if (this.getAttr("Input Handeler", "Mouse Enable")) {
            document.addEventListener("mousedown", (e) => this.updateMouseButtons(e));
            document.addEventListener("mouseup", (e) => this.updateMouseButtons(e));
            document.addEventListener("mousemove", (e) => this.updateMousePosition(e));

            document.addEventListener("wheel", (e) => {
                e.preventDefault();
                this.scrollTriggerList.forEach(callback => callback(e.deltaY));
            }, { passive: false });


            document.addEventListener("click", (e) => e.preventDefault());
            document.addEventListener("contextmenu", (e) => e.preventDefault());
        }

        if (this.getAttr("Input Handeler", "Keyboard Enable")) {
            document.addEventListener("keydown", (e) => {
                const key = e.key.toLowerCase();
                
                const consoleEnabled = this.getAttr("Input Handeler", "Console Enable");

                const isF12 = key === "f12";
                const isDevToolsShortcut = (e.ctrlKey || e.metaKey) && e.shiftKey && key === "i";
                const isMacElementsShortcut = e.metaKey && e.altKey && key === "i";

                if (consoleEnabled && (isF12 || isDevToolsShortcut || isMacElementsShortcut)) {
                    this.keysDown.set(key, true);
                    if (key === " ") {
                        this.keysDown.set("space", true);
                    }
                    return; 
                }

                e.preventDefault();
                this.keysDown.set(key, true);
                if (key === " ") {
                    this.keysDown.set("space", true);
                }
            });
            document.addEventListener("keyup", (e) => {
                this.keysDown.delete(e.key.toLowerCase())
                if (e.key === " ") {
                    this.keysDown.delete("space");
                }
            });
        }

        window.addEventListener('blur', this.handleUnfocus);
        window.addEventListener('focus', this.handleFocus);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.handleUnfocus();
            else this.handleFocus();
        });

        let focusCheck = setInterval(() => {
            if (!document.hasFocus()) {
                this.handleUnfocus();
            }
        }, 250);
    }

    handleUnfocus() {
        if (!this.keysDown) return;
        this.keysDown.clear();
    }

    handleFocus() {

    }
}