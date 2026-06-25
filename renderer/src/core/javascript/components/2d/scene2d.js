import { Object2d } from "./object2d.js";
import { Attribute } from "../attributes.js";
import { ComponentController } from "../component.js";
import { Renderer2D } from "../renderer2D.js";
import * as PIXI from "pixi";

export class Scene2DComponent extends Object2d {
    constructor(name = "Scene 2d") {
        super(name, false);
        
        const environmentAttribute = new Attribute("Environment");
        environmentAttribute.addField("Sort Children", "boolean", true);
        environmentAttribute.addField("Ambient Tint", "color", "#ffffff");
        this.attributes.push(environmentAttribute);

        const boundsAttribute = new Attribute("World Bounds");
        boundsAttribute.addField("Use Bounds Clamping", "boolean", false);
        boundsAttribute.addField("Min Coordinates", "vec2", { x: 0, y: 0 });
        boundsAttribute.addField("Max Coordinates", "vec2", { x: 1920, y: 1080 });
        this.attributes.push(boundsAttribute);

        this.currentCamera = null;

        this.updateDepthLimit = 100000;

        this.renderer = null;
    }

    static baseType = "scene2D";
    static type = "scene2D";

    updateAllProperties() {
        this.updateEnvironment();
    }

    updateEnvironment() {
        this.object2D.sortableChildren = this.getAttr("Environment", "Sort Children");

        const tintHex = this.getAttr("Environment", "Ambient Tint");
        this.object2D.tint = PIXI.Color.shared.setValue(tintHex).toNumber();
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Environment") this.updateEnvironment();
    }

    start() {
        this.updateDepthLimit = this.getFirstParentOfType(ComponentController)?.updateDepthLimit || 100000;
        this.renderer = this.getFirstParentOfType(Renderer2D);
        this.updateAllProperties();
    }

    renderUpdate(alpha = 1.0) {
        if (!this.enable) return;
        
        this.renderUpdateChildCluster(alpha, this.children);

        if (this.currentCamera && this.renderer) {
            this.object2D.position.set(0, 0);
            this.object2D.scale.set(1, 1);
            this.object2D.rotation = 0;

            this.currentCamera.object2D.updateLocalTransform();

            const cameraGlobalPos = this.currentCamera.object2D.toGlobal({ x: 0, y: 0 });
            
            const cameraGlobalRotRadians = this.currentCamera.object2D.rotation || 0; 
            const cameraZoom = this.currentCamera.getAttr("Camera", "Zoom") || 1.0;

            const screenOffsetX = this.renderer.resolution.width / 2;
            const screenOffsetY = this.renderer.resolution.height / 2;

            const totalXZoom = cameraZoom * this.currentCamera.object2D.scale.x;
            const totalYZoom = cameraZoom * this.currentCamera.object2D.scale.y;

            this.object2D.scale.set(totalXZoom, totalYZoom);
            this.object2D.rotation = -cameraGlobalRotRadians;

            this.object2D.position.x = screenOffsetX - (cameraGlobalPos.x * totalXZoom);
            this.object2D.position.y = screenOffsetY - (cameraGlobalPos.y * totalYZoom);
        } else {
            const screenOffsetX = this.renderer.resolution.width / 2;
            const screenOffsetY = this.renderer.resolution.height / 2;

            this.object2D.position.set(screenOffsetX, screenOffsetY);
            this.object2D.scale.set(1, 1);
            this.object2D.rotation = 0;
        }
    }

    renderUpdateChildCluster(alpha, children, depth = 0) {
        if (children.length === 0) return;
        if (depth >= this.updateDepthLimit) return;
        for (const child of children) {
            if (!child.enable) continue;
            if (child.renderUpdate && typeof child.renderUpdate === "function") {
                child.renderUpdate(alpha);
            }
            this.renderUpdateChildCluster(alpha, child.getChildrenRunOrder(), depth + 1);
        }
    }
}