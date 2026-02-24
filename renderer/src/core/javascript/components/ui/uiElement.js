import { Component } from "../component.js";
import { Attribute } from "../attributes.js";

export class UiElement extends Component {
    constructor (name = "Ui Element") {
        super(name);

        this.attributes.push(new Attribute("Ui"));
        this.attributes[0].addField("html", "text", "");
        this.attributes[0].addField("css", "text", "");
        this.attributes[0].addField("Isolate Style", "boolean", false);

        this.element = document.createElement('div');
        this.element.name = name;
        this.element.id = "element";

        this.host = document.createElement('div');
        this.shadow = null;
        this.style = null;
        this.inneritedStyles = [];

        this.currentChild = 1;
    }

    static icon = ["uiElement", ...super.icon];
    static group = "UI Elements";

    appendElement(element) {
        this.host.appendChild(element);
        this.updateElement();
    }

    removeElement(element) {
        if (!this.host.contains(element)) return;
        this.host.removeChild(element);
        this.updateElement();
    }

    updateElement() {
        const nodes = this.host.children;
        const slots = this.element.querySelectorAll("slot");

        const validSlots = new Set(
            Array.from(slots)
                .map(s => s.getAttribute("name"))
                .filter(Boolean)
        );

        for (let i = 0; i < nodes.length; i++) {
            const desired = `c${i + 1}`;

            if (validSlots.has(desired)) {
                nodes[i].slot = desired;
            } else {
                nodes[i].slot = "default";
            }
        }
    }

    parentRemoved() {
        if (this.shadow) this.parent.removeElement(this.host);
    }

    parentAdded() {
        if (this.shadow) this.parent.appendElement(this.host);
    }

    visiblityChanged() {
        this.host.style.display = this.visible ? null : "none";
    }

    enableChanged() {
        if (!this.parent || !this.shadow) return;
        if (this.enable) {
            if (this.host.isConnected) return;
            this.parent.appendElement(this.host);
        } else {
            if (!this.host.isConnected) return;
            this.parent.removeElement(this.host);
        }
    }

    start() {
        this.inneritedStyles = (this.parent?.inneritedStyles ?? []).slice();
        this.inneritedStyles.push(this.parent?.style);
        if (this.getAttributeFieldValue(0, 2)) this.inneritedStyles = [];

        this.shadow = this.host.attachShadow({ mode: "open" });

        this.style = new CSSStyleSheet();
        this.style.replaceSync(this.getAttributeFieldValue(0, 1));

        this.shadow.adoptedStyleSheets = [...this.inneritedStyles, this.style];

        const htmlString = this.getAttributeFieldValue(0, 0) ?? "";
        const template = document.createElement("template");

        template.innerHTML = htmlString.trim();

        this.element.appendChild(template.content);
        this.shadow.append(this.element);

        if (!this.enable) return;
        this.parent.appendElement(this.host);
    }
}