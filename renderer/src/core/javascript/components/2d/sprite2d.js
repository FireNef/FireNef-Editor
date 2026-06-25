import { Object2d } from "./object2d.js";
import { Attribute } from "../attributes.js";
import { Renderer2D } from "../renderer2D.js";
import * as PIXI from "pixi";

export class Sprite2D extends Object2d {
    constructor(name = "Sprite2D") {
        super(name);
        
        const spriteAttr = new Attribute("Sprite");
        spriteAttr.addField("Texture Path", "path", "assets/default.png", { fileSelect: "image/*" });
        spriteAttr.addField("Anchor", "vec2", { x: 0.5, y: 0.5 });
        spriteAttr.addField("Tint", "color", "#ffffff");
        spriteAttr.addField("Alpha", "float", 1.0, { min: 0.0, max: 1.0 });
        spriteAttr.addField("Flip X", "boolean", false);
        spriteAttr.addField("Flip Y", "boolean", false);
        spriteAttr.addField("Blend Mode", "string", "normal");
        spriteAttr.addField("Z Index", "number", 0);
        this.attributes.push(spriteAttr);

        this.object2D = new PIXI.Sprite();
        this.object2D.name = name;
        
        this.currentTexturePath = null;
    }

    static baseType = "sprite2D"
    static type = "sprite2D"
    static icon = ["sprite2d", ...Object2d.icon]

    updateAllProperties() {
        this.syncTexture();
        this.updateVisualProperties();
    }

    start() {
        super.start();
        this.updateAllProperties();
    }
    
    update() {
        super.update();
    }

    syncTexture() {
        const path = this.getAttr("Sprite", "Texture Path");
        if (path === this.currentTexturePath && this.object2D) return;

        const sharedTexture = Renderer2D.getTexture(path);

        this.object2D.texture = sharedTexture;

        this.currentTexturePath = path;
    }

    updateVisualProperties() {
        if (!this.object2D) return;

        // 1. Sync Anchor Coordinates
        const anchor = this.getAttr("Sprite", "Anchor");
        this.object2D.anchor.set(anchor.x, anchor.y);

        // 2. Sync Coloration & Transparency
        const tintHex = this.getAttr("Sprite", "Tint");
        this.object2D.tint = PIXI.Color.shared.setValue(tintHex).toNumber();
        this.object2D.alpha = this.getAttr("Sprite", "Alpha");

        // 4. Sync Blending Styles
        this.object2D.blendMode = this.getAttr("Sprite", "Blend Mode");

        // 5. Sync Structural Z-Indexing Layout
        const zIndex = this.getAttr("Sprite", "Z Index");
        if (this.object2D.zIndex !== zIndex) {
            this.object2D.zIndex = zIndex;
            // Tell parent container to resort rendering order next pass
            if (this.object2D.parent) this.object2D.parent.sortChildren();
        }
    }

    renderUpdate(alpha = 1.0) {
        super.renderUpdate(alpha);

        if (!this.enable || !this.object2D) return;

        const flipX = this.getAttr("Sprite", "Flip X");
        const flipY = this.getAttr("Sprite", "Flip Y");

        this.object2D.scale.x *= (flipX ? -1 : 1);
        this.object2D.scale.y *= (flipY ? -1 : 1);
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute === "Sprite") {
            if (field === "Texture Path") this.syncTexture();
            else this.updateVisualProperties();
        }
    }
}