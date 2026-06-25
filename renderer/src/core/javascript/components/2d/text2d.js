import { Object2d } from "./object2d.js";
import { Attribute } from "../attributes.js";
import * as PIXI from "pixi";

export class Text2D extends Object2d {
    constructor(name = "Text 2d") {
        super(name);

        const textContentAttr = new Attribute("Text Content");
        textContentAttr.addField("String", "string", "Hello World!");
        textContentAttr.addField("Z Index", "number", 0);
        this.attributes.push(textContentAttr);

        const fontAttr = new Attribute("Font Style");
        fontAttr.addField("Font Family", "string", "Arial");
        fontAttr.addField("Font Size", "number", 28, { min: 1, max: 200 });
        fontAttr.addField("Font Weight", "string", "normal", { 
            options: ["normal", "bold", "bolder", "lighter", "100", "400", "700", "900"] 
        });
        fontAttr.addField("Font Item Style", "string", "normal", { 
            options: ["normal", "italic", "oblique"] 
        });
        fontAttr.addField("Fill Color", "color", "#ffffff");
        fontAttr.addField("Align", "string", "left", { 
            options: ["left", "center", "right", "justify"] 
        });
        this.attributes.push(fontAttr);

        const layoutAttr = new Attribute("Word Wrap");
        layoutAttr.addField("Enable Wrap", "boolean", false);
        layoutAttr.addField("Wrap Width", "number", 200, { min: 10 });
        layoutAttr.addField("Line Height", "number", 0, { description: "0 sets automatically" });
        this.attributes.push(layoutAttr);

        const strokeAttr = new Attribute("Text Stroke");
        strokeAttr.addField("Stroke Width", "float", 0.0, { min: 0.0 });
        strokeAttr.addField("Stroke Color", "color", "#000000");
        this.attributes.push(strokeAttr);

        const shadowAttr = new Attribute("Drop Shadow");
        shadowAttr.addField("Enable Shadow", "boolean", false);
        shadowAttr.addField("Shadow Color", "color", "#000000");
        shadowAttr.addField("Shadow Blur", "number", 4, { min: 0 });
        shadowAttr.addField("Shadow Distance", "number", 5);
        shadowAttr.addField("Shadow Angle", "number", 45, { min: 0, max: 360, description: "In Degrees" });
        this.attributes.push(shadowAttr);
        
        this.object2D = new PIXI.Text({
            text: "Hello World!",
            style: {
                fontFamily: "Arial",
                fontSize: 28,
                fill: 0xffffff
            }
        });
        this.object2D.name = name;
        this.object2D.anchor.set(0.5);
    }

    static baseType = "text2D";
    static type = "text2D";
    static icon = ["text", ...Object2d.icon];

    updateAllProperties() {
        this.syncTextAndStyle();
    }

    start() {
        super.start();
        this.updateAllProperties();
    }

    syncTextAndStyle() {
        if (!this.object2D) return;

        const textString = this.getAttr("Text Content", "String");
        
        const fontFamily = this.getAttr("Font Style", "Font Family");
        const fontSize = this.getAttr("Font Style", "Font Size");
        const fontWeight = this.getAttr("Font Style", "Font Weight");
        const fontStyle = this.getAttr("Font Style", "Font Item Style");
        const fillColor = this.getAttr("Font Style", "Fill Color");
        const textAlign = this.getAttr("Font Style", "Align");

        const wordWrap = this.getAttr("Word Wrap", "Enable Wrap");
        const wordWrapWidth = this.getAttr("Word Wrap", "Wrap Width");
        const lineHeight = this.getAttr("Word Wrap", "Line Height");

        const strokeWidth = this.getAttr("Text Stroke", "Stroke Width");
        const strokeColor = this.getAttr("Text Stroke", "Stroke Color");

        const shadowEnable = this.getAttr("Drop Shadow", "Enable Shadow");
        const shadowColor = this.getAttr("Drop Shadow", "Shadow Color");
        const shadowBlur = this.getAttr("Drop Shadow", "Shadow Blur");
        const shadowDistance = this.getAttr("Drop Shadow", "Shadow Distance");
        const shadowAngleDeg = this.getAttr("Drop Shadow", "Shadow Angle");

        const parsedFillColor = PIXI.Color.shared.setValue(fillColor).toNumber();
        const parsedStrokeColor = PIXI.Color.shared.setValue(strokeColor).toNumber();

        const newStyle = {
            fontFamily,
            fontSize,
            fontWeight,
            fontStyle,
            fill: parsedFillColor,
            align: textAlign,
            wordWrap,
            wordWrapWidth,

            lineHeight: lineHeight > 0 ? lineHeight : undefined,
            
            stroke: strokeWidth > 0 ? {
                width: strokeWidth,
                color: parsedStrokeColor
            } : undefined,

            dropShadow: shadowEnable ? {
                color: PIXI.Color.shared.setValue(shadowColor).toNumber(),
                blur: shadowBlur,
                distance: shadowDistance,
                angle: shadowAngleDeg * (Math.PI / 180) 
            } : undefined
        };

        this.object2D.text = textString;
        this.object2D.style = newStyle;

        const zIndex = this.getAttr("Text Content", "Z Index");
        if (this.object2D.zIndex !== zIndex) {
            this.object2D.zIndex = zIndex;
            if (this.object2D.parent) this.object2D.parent.sortChildren();
        }
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        
        // Match any text formatting attribute adjustments
        if (attribute === "Text Content" || 
            attribute === "Font Style" || 
            attribute === "Word Wrap" || 
            attribute === "Text Stroke" || 
            attribute === "Drop Shadow") {
            this.syncTextAndStyle();
        }
    }
}