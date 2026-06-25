import { Object2d } from "./object2d.js";
import { Attribute } from "../attributes.js";
import * as PIXI from "pixi";

export class Graphics2D extends Object2d {
    constructor(name = "Graphics 2d") {
        super(name);

        const shapeAttr = new Attribute("Shape");
        shapeAttr.addField("Shape Type", "string", "Rectangle", {
            options: ["Rectangle", "Circle", "Ellipse", "Polygon"],
        });
        shapeAttr.addField("Dimensions", "vec2", { x: 100, y: 100 });
        shapeAttr.addField("Polygon Path", "string", "0, 100, 100,100, 50,0", {
            description: "Comma-separated X,Y pairs for custom polygons"
        });
        shapeAttr.addField("Z Index", "number", 0);
        this.attributes.push(shapeAttr);

        const fillAttr = new Attribute("Fill");
        fillAttr.addField("Fill Color", "color", "#ff0000");
        fillAttr.addField("Fill Alpha", "float", 1.0, { min: 0.0, max: 1.0 });
        this.attributes.push(fillAttr);

        const strokeAttr = new Attribute("Stroke");
        strokeAttr.addField("Stroke Width", "float", 0.0, { min: 0.0 });
        strokeAttr.addField("Stroke Color", "color", "#000000");
        strokeAttr.addField("Stroke Alpha", "float", 1.0, { min: 0.0, max: 1.0 });
        strokeAttr.addField("Stroke Alignment", "float", 0.5, { min: 0.0, max: 1.0 });
        strokeAttr.addField("Pixel Line", "boolean", false);
        this.attributes.push(strokeAttr);

        this.object2D = new PIXI.Graphics();
        this.object2D.name = name;
    }

    static baseType = "graphics2D";
    static type = "graphics2D";
    static icon = ["graphics2d", ...Object2d.icon];

    updateAllProperties() {
        this.redrawShape();
    }

    start() {
        super.start();
        this.updateAllProperties();
    }

    redrawShape() {
        if (!this.object2D) return;

        this.object2D.clear();

        const type = this.getAttr("Shape", "Shape Type");
        const dims = this.getAttr("Shape", "Dimensions");
        const polyPathStr = this.getAttr("Shape", "Polygon Path");

        const fillColor = this.getAttr("Fill", "Fill Color");
        const fillAlpha = this.getAttr("Fill", "Fill Alpha");

        const strokeWidth = this.getAttr("Stroke", "Stroke Width");
        const strokeColor = this.getAttr("Stroke", "Stroke Color");
        const strokeAlpha = this.getAttr("Stroke", "Stroke Alpha");
        const strokeAlignment = this.getAttr("Stroke", "Stroke Alignment");
        const pixelLine = this.getAttr("Stroke", "Pixel Line");

        switch (type) {
            case "Circle":
                this.object2D.circle(0, 0, dims.x);
                break;
            case "Ellipse":
                this.object2D.ellipse(0, 0, dims.x, dims.y);
                break;
            case "Polygon":
                const points = this.parsePolygonPoints(polyPathStr);
                if (points.length >= 6) {
                    this.object2D.poly(points);
                }
                break;
            case "Rectangle":
            default:
                const halfW = dims.x / 2;
                const halfH = dims.y / 2;
                this.object2D.rect(-halfW, -halfH, dims.x, dims.y);
                break;
        }

        const parsedFillColor = PIXI.Color.shared.setValue(fillColor).toNumber();
        this.object2D.fill({
            color: parsedFillColor,
            alpha: fillAlpha
        });

        if (strokeWidth > 0) {
            const parsedStrokeColor = PIXI.Color.shared.setValue(strokeColor).toNumber();
            this.object2D.stroke({
                width: strokeWidth,
                color: parsedStrokeColor,
                alpha: strokeAlpha,
                alignment: strokeAlignment,
                pixel: pixelLine
            });
        }

        const zIndex = this.getAttr("Shape", "Z Index");
        if (this.object2D.zIndex !== zIndex) {
            this.object2D.zIndex = zIndex;
            if (this.object2D.parent) this.object2D.parent.sortChildren();
        }
    }

    parsePolygonPoints(str) {
        if (!str) return [];
        return str.split(/[,\s]+/)
                  .map(num => parseFloat(num))
                  .filter(num => !isNaN(num));
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Shape" || attribute == "Fill" || attribute == "Stroke") this.redrawShape();
    }
}
