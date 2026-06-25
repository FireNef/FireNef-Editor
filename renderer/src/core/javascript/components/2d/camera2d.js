import { Object2d } from "./object2d.js";
import { Attribute } from "../attributes.js";
import { Scene2DComponent } from "./scene2d.js";

export class Camera2DComponent extends Object2d {
    constructor(name = "Camera 2d") {
        super(name);

        const cameraAttribute = new Attribute("Camera");
        cameraAttribute.addField("Current Camera", "boolean", false);
        cameraAttribute.addField("Zoom", "number", 1, { min: 0 });
        this.attributes.push(cameraAttribute);

        this.sceneComponent = null;
    }
    
    static baseType = "camera2D"
    static type = "camera2D"
    static group = "General 2D"

    start() {
        super.start();

        this.sceneComponent = this.getFirstParentOfType(Scene2DComponent);
    }

    update() {
        super.update();

        if (!this.sceneComponent) return;

        const usedCamera = this.getAttr("Camera", "Current Camera");

        if (this.sceneComponent.currentCamera === this && !usedCamera) {
            this.sceneComponent.currentCamera = null;
        } else if (usedCamera) {
            if (this.sceneComponent.currentCamera !== this) {
                if (this.sceneComponent?.currentCamera?.setAttr) {
                    this.sceneComponent.currentCamera.setAttr("Camera", "Current Camera", false);
                }
            }
            this.sceneComponent.currentCamera = this;
        }
    }
}