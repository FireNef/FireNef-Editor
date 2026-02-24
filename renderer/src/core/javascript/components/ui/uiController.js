import { Component } from "../component.js";
import { Attribute, Field } from "../attributes.js";

export class UiController extends Component {
    constructor (name = "UI Controller") {
        super(name);

        const uiControllerAttribute = new Attribute("Ui Controller");
        uiControllerAttribute.addField("css", "text", "");
        uiControllerAttribute.addField("Ui Scale", "number", 1);
        uiControllerAttribute.addField("Isolate Scale", "boolean", true);

        this.attributes.push(uiControllerAttribute);

        this.element = document.createElement('div');
        this.element.name = name;
        this.element.style.transformOrigin = "top left";

        this.engine = null;
        this.root = null;

        this.host = null;
        this.shadow = null;
        this.style = null;
        this.inneritedStyles = [];

        this.updateStartCounter = 0;

        this.resolution = { width: 1920, height: 1080 };
    }

    static icon = ["uiController", ...super.icon];
    static group = "UI Elements";

    appendElement(element) {
        this.element.appendChild(element);
    }

    removeElement(element) {
        this.element.removeChild(element);
    }

    updateElement(element) {
        
    }

    start() {
        this.engine = this.highestParent;

        this.root = this.engine.root;

        this.host = document.createElement('div');
        this.shadow = this.host.attachShadow({ mode: "open" });

        this.style = new CSSStyleSheet();
        this.style.replaceSync(this.getAttributeFieldValue(0, 0));

        this.shadow.adoptedStyleSheets = [this.style];
        this.shadow.append(this.element);

        this.root.appendChild(this.host);

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    parentRemoved() {
        if (this.host && this.host.isConnected) this.host.remove();
    }

    parentAdded() {
        if (!this.host) return;

        this.engine = this.highestParent;

        this.root = this.engine.root;

        this.root.appendChild(this.host);
    }

    visiblityChanged() {
        if (this._visible) {
            if (!this.host || this.host.isConnected) return;
            this.engine = this.highestParent;
            this.root = this.engine.root;
            this.root.appendChild(this.host);
        } else {
            if (this.host && this.host.isConnected) this.host.remove();
        }
    }

    update() {
        if (this.updateStartCounter < 2) {
            this.updateStartCounter++;
            this.resize();
            return;
        }
        
        this.resolution = this.engine.renderer.resolution;

        if (!this.getAttributeFieldValue(0, 2)) {
            this.element.style.width = "100%";
            this.element.style.height = "100%";
            return;
        }

        this.element.style.width = this.resolution.width / this.getAttributeFieldValue(0, 1) + "px";
        this.element.style.height = this.resolution.height / this.getAttributeFieldValue(0, 1) + "px";
    }

    resize() {
        if (!this.getAttributeFieldValue(0, 2)) {
            this.element.style.transform = `scale(1)`;
            return;
        }

        if (!this.host) return;
        const scaleX = this.host.clientWidth / (this.resolution.width / this.getAttributeFieldValue(0, 1));
        const scaleY = this.host.clientHeight / (this.resolution.height / this.getAttributeFieldValue(0, 1));
        const scale = Math.min(scaleX, scaleY);

        this.element.style.transform = `scale(${scale})`;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == 0) {
            if (field == 0) {
                this.attributes[0].fields[0].value = await this.resolveImports(this.attributes[0].fields[0].value, value.slice(0, value.lastIndexOf("/") + 1));
                //console.log(this.getAttributeFieldValue(0, 0));
            }
            if (field == 1) this.resize();
            if (field == 2) this.resize();
        }
    }

    async resolveImports(cssText, basePath = "") {
        const importRegex = /@import\s+(?:url\()?["']?([^"')]+)["']?\)?\s*;/g;

        const fetchPromises = [];

        const replacedCSS = cssText.replace(importRegex, (fullMatch, importPath) => {
            const promise = fetch(basePath + importPath)
                .then(r => r.text())
                .catch(() => "")
            fetchPromises.push(promise);
            return `__IMPORT_PLACEHOLDER_${fetchPromises.length - 1}__`;
        });

        const results = await Promise.all(fetchPromises);

        let finalCSS = replacedCSS;
        results.forEach((css, i) => {
            const placeholder = `__IMPORT_PLACEHOLDER_${i}__`;
            finalCSS = finalCSS.replace(placeholder, css);
        });

        return finalCSS;
    }
}   