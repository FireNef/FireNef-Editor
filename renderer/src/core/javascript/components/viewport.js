import { Component } from "./component.js";
import { Attribute } from "./attributes.js";

export class Viewport extends Component {
    constructor(name = "Viewport") {
        super(name);

        const viewportAttribute = new Attribute("Viewport");
        viewportAttribute.addField("Locked Aspect Ratio", "boolean", true);
        viewportAttribute.addField("Resolution Width", "number", 1920, { min: 1 });
        viewportAttribute.addField("Resolution Height", "number", 1080, { min: 1 });
        this.attributes.push(viewportAttribute);

        this.aspectRatio = 16 / 9;

        this.actualResolution = { width: 1920, height: 1080 };
        this.actualAspectRatio = this.actualResolution.width / this.actualResolution.height;
        this.oldResolution = { width: 1920, height: 1080 };

        this.startAmount = 0;

        this.resolutionUpdateList = [];

        this.viewportElement = document.createElement('div');
        this.viewportElement.id = "viewport";
        this.viewportElement.style.width = "100%";
        this.viewportElement.style.height = "100%";
        this.viewportElement.style.maxWidth = "100%";
        this.viewportElement.style.maxHeight = "100%";
        this.viewportElement.style.minWidth = "100%";
        this.viewportElement.style.minHeight = "100%";
        this.viewportElement.style.overflow = "hidden";
    }

    static baseType = "viewport"
    static type = "viewport"

    static icon = ["viewport", ...super.icon];

    start() {
        this.getViewportCapableComponent().appendChild(this.viewportElement);

        this.viewportResize();

        window.addEventListener('resize', () => this.viewportResize());

        const observer = new ResizeObserver(entries => {
            this.viewportResize();
        });

        observer.observe(this.viewportElement);
    }

    update() {
        if (this.startAmount < 2) {
            this.viewportResize();
            this.startAmount++;
        }
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        this.viewportResize();
    }

    viewportResize() {
        this.aspectRatio = this.getAttr("Viewport", "Resolution Width") / this.getAttr("Viewport", "Resolution Height");

        if (this.getAttr("Viewport", "Locked Aspect Ratio")) {
            this.positionElementsAspectRatio(this.viewportElement, this.aspectRatio);
        } else {
            this.positionElementsFreeForm(this.viewportElement);
        }

        if (this.oldResolution.width != this.actualResolution.width || this.oldResolution.height != this.actualResolution.height) {
            this.resolutionUpdateList.forEach(callback => callback(this.actualResolution.width, this.actualResolution.height));
            this.oldResolution.width = this.actualResolution.width;
            this.oldResolution.height = this.actualResolution.height;
        }
    }

    positionElementsFreeForm(container) {

        const vw = this.viewportElement.clientWidth;
        const vh = this.viewportElement.clientHeight;

        const windowRatio = vw / vh;

        if (windowRatio > this.aspectRatio) {
            this.actualResolution.width = this.getAttr("Viewport", "Resolution Width");
            this.actualResolution.height = this.getAttr("Viewport", "Resolution Width") / windowRatio;
        } else {
            this.actualResolution.width = this.getAttr("Viewport", "Resolution Height") * windowRatio;
            this.actualResolution.height = this.getAttr("Viewport", "Resolution Height");
        }

        this.actualAspectRatio = this.actualResolution.width / this.actualResolution.height;

        for (const element of container.children) {
            element.style.position = "absolute";
            element.style.width = "100vw";
            element.style.height = "100vh";
            element.style.left = 0;
            element.style.top = 0;
        }
    }

    positionElementsAspectRatio(container, aspecRatio) {
        const vw = this.viewportElement.clientWidth;
        const vh = this.viewportElement.clientHeight;

        this.actualResolution.width = this.getAttr("Viewport", "Resolution Width");
        this.actualResolution.height = this.getAttr("Viewport", "Resolution Height");

        this.actualAspectRatio = this.actualResolution.width / this.actualResolution.height;

        let width = vw;
        let height = width * (1 / aspecRatio);

        if (height > vh) {
            height = vh;
            width = height * aspecRatio;
        }

        for (const element of container.children) {
            element.style.position = "absolute";
            element.style.width = width + "px";
            element.style.height = height + "px";
            element.style.left = (vw - width) / 2 + "px";
            element.style.top = (vh - height) / 2 + "px";
        }
    }
}