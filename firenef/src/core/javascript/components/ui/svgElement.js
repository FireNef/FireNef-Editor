import { UiElement } from "./uiElement.js";

export class SvgElement extends UiElement {
    constructor(name = "SVG Element") {
        super(name);
    }

    static icon = ["svgElement", ...super.icon];
}