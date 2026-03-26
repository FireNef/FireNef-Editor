import * as FIRENEF from "firenef";

export default class ColorPickerOverlayScript extends FIRENEF.Script {
    constructor(name = "Color Picker Overlay Script") {
        super(name);

        this.element = null;
        this.editor = null;

        this.close = null;

        this.canvas = null;
        this.ctx = null;
        this.selector = null;

        this.hueSlider = null;

        this.preview = null;
        this.hexInput = null;

        this.confirm = null;
        this.cancel = null;

        this.hue = 0;
        this.sat = 1;
        this.val = 1;

        this._moveHandler = (e) => this.pick(e);
    }

    static type = "colorPickerOverlayScript"

    start() {
        this.element = this.parent.element;
        this.editor = window.firenefEditor;

        this.close = this.element.querySelector("#close");
        this.close.addEventListener("click", () => this.editor.clearOverlay());

        this.canvas = this.element.querySelector("#sv");
        this.ctx = this.canvas.getContext("2d");
        this.selector = this.element.querySelector("#selector");

        this.hueSlider = this.element.querySelector("#hue");

        this.preview = this.element.querySelector("#preview");
        this.hexInput = this.element.querySelector("#hexInput");

        this.confirm = this.element.querySelector("#confirm");
        this.cancel = this.element.querySelector("#cancel");

        this.cancel.addEventListener("click", () => this.editor.clearOverlay());

        this.confirm.addEventListener("click", () => {
            let rgb = this.hsvToRgb(this.hue,this.sat,this.val);
            let hex = this.rgbToHex(rgb.r,rgb.g,rgb.b);

            this.editor.overlayInputs.colorSet(hex);
            this.editor.clearOverlay();
        });

        this.canvas.width = 200;
        this.canvas.height = 200;

        this.hueSlider.addEventListener("input", () => {
            this.hue = this.hueSlider.value;
            this.drawSV();
            this.updateColors();
        });

        this.canvas.addEventListener("mousedown", e => {
            this.pick(e);
            document.addEventListener("mousemove", this._moveHandler);
        });

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", this._moveHandler);
        });

        this.hexInput.addEventListener("change", () => {
            this.setToHex(this.hexInput.value);
        });

        this.setToHex("#ff0000");
    }

    setToHex(hex) {
        const hsv = this.hexToHsv(hex);

        this.hue = hsv.h;
        this.sat = hsv.s;
        this.val = hsv.v;

        this.hueSlider.value = this.hue;
        this.drawSV();
        this.updateColors();

        const SIZE = this.canvas.width;
        this.selector.style.left = this.sat * SIZE + "px";
        this.selector.style.top = (1 - this.val) * SIZE + "px";
    }

    pick(e){
        let rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        const SIZE = this.canvas.width;

        x = Math.max(0, Math.min(SIZE, x));
        y = Math.max(0, Math.min(SIZE, y));

        this.sat = x / SIZE;
        this.val = 1 - (y / SIZE);

        this.selector.style.left = x + "px";
        this.selector.style.top = y + "px";

        this.updateColors();
    }

    updateColors(){
        let rgb = this.hsvToRgb(this.hue,this.sat,this.val);
        let hex = this.rgbToHex(rgb.r,rgb.g,rgb.b);

        let rgba = `rgb(${rgb.r},${rgb.g},${rgb.b})`;

        this.preview.style.background = rgba;
        this.hexInput.value = hex;

        this.selector.style.background = rgba;

        const hueRgb = this.hsvToRgb(this.hue,1,1);

        this.hueSlider.style.setProperty("--thumb-color", `rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);
    }

    hsvToRgb(h,s,v){
        h/=60;
        let c=v*s;
        let x=c*(1-Math.abs(h%2-1));
        let m=v-c;
        let r=0,g=0,b=0;

        if(h<1)[r,g,b]=[c,x,0];
        else if(h<2)[r,g,b]=[x,c,0];
        else if(h<3)[r,g,b]=[0,c,x];
        else if(h<4)[r,g,b]=[0,x,c];
        else if(h<5)[r,g,b]=[x,0,c];
        else [r,g,b]=[c,0,x];

        return {
            r: Math.round((r+m)*255),
            g: Math.round((g+m)*255),
            b: Math.round((b+m)*255)
        };
    }

    drawSV() {
        const rgb = this.hsvToRgb(this.hue,1,1);
        this.ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        this.ctx.fillRect(0,0,200,200);

        let white = this.ctx.createLinearGradient(0,0,200,0);
        white.addColorStop(0,"#fff");
        white.addColorStop(1,"transparent");
        this.ctx.fillStyle = white;
        this.ctx.fillRect(0,0,200,200);

        let black = this.ctx.createLinearGradient(0,0,0,200);
        black.addColorStop(0,"transparent");
        black.addColorStop(1,"#000");
        this.ctx.fillStyle = black;
        this.ctx.fillRect(0,0,200,200);
    }

    rgbToHex(r,g,b){
        return "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");
    }

    colorToHex(input) {
        input = input.trim().toLowerCase();

        if (input.startsWith("#")) {
            return this.normalizeHex(input);
        }

        if (input.startsWith("rgb")) {
            const values = input.match(/\d+/g).map(Number);
            return this.rgbToHex(values[0], values[1], values[2]);
        }

        if (input.startsWith("hsl")) {
            const values = input.match(/\d+/g).map(Number);
            const [r, g, b] = this.hslToRgb(values[0], values[1], values[2]);
            return this.rgbToHex(r, g, b);
        }

        return "#000000";
    }

    normalizeHex(hex) {
        hex = hex.replace("#", "");

        if (hex.length === 3) {
            return "#" + hex.split("").map(c => c + c).join("");
        }

        if (hex.length === 6) {
            return "#" + hex;
        }

        return "#000000";
    }

    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);

        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return [
            Math.round(255 * f(0)),
            Math.round(255 * f(8)),
            Math.round(255 * f(4))
        ];
    }

    hexToHsv(hex) {
        if (hex.startsWith("#")) hex = hex.slice(1);
        if (hex.length === 3) {
            hex = hex.split("").map(c => c + c).join("");
        }

        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                h = 60 * (((b - r) / delta) + 2);
            } else if (max === b) {
                h = 60 * (((r - g) / delta) + 4);
            }
        }

        if (h < 0) h += 360;

        const s = max === 0 ? 0 : delta / max;
        const v = max;

        return { h, s, v };
    }

    visiblityChanged() {
        if (!this.visible) return;
        if (!this.editor) return;
        this.setToHex(this.colorToHex(this.editor?.overlayInputs?.color ?? "#ff0000"));
    }
}