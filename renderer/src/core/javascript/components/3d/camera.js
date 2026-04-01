import { Object3d } from "./object3d.js";
import { Attribute } from "../attributes.js";
import { SceneComponent } from "./scene.js";
import { Renderer3D } from "../renderer3D.js";
import * as THREE from "three";

export class PerspectiveCameraComponent extends Object3d {
    constructor(name = "Perspective Camera") {
        super(name);

        const cameraAttribute = new Attribute("Perspective Camera");
        cameraAttribute.addField("Current Camera", "boolean", false);
        cameraAttribute.addField("FOV", "number", 60, { min: 1, max: 179, step: 1 });
        cameraAttribute.addField("Near", "number", 0.1, { min: 0 });
        cameraAttribute.addField("Far", "number", 1000, { min: 0 });
        this.attributes.push(cameraAttribute);

        this.object3D = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
        this.object3D.name = name;

        this.renderer = null;

        this.sceneComponent = null;
    }

    static baseType = "camera"
    static type = "camera"

    static group = "Cameras";

    updateCamera() {
        const fov = this.getAttr("Perspective Camera", "FOV");
        const aspect = this.renderer ? this.renderer.resolution.width / this.renderer.resolution.height : 16 / 9;
        const near = this.getAttr("Perspective Camera", "Near");
        const far = this.getAttr("Perspective Camera", "Far");
        this.object3D.fov = fov;
        this.object3D.aspect = aspect;
        this.object3D.near = near;
        this.object3D.far = far;
        this.object3D.updateProjectionMatrix();
    }

    start() {
        super.start();

        this.renderer = this.getFirstParentOfType(Renderer3D);
        this.sceneComponent = this.getFirstParentOfType(SceneComponent);
        this.updateCamera();
    }

    update() {
        super.update();

        if (this.sceneComponent) {
            const usedCamera = this.getAttr("Perspective Camera", "Current Camera");
            if (this.sceneComponent.currentCamera === this && !usedCamera) {
                this.sceneComponent.currentCamera = null;
            } else if (usedCamera) {
                this.sceneComponent.currentCamera = this;
            }
        }
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Perspective Camera") this.updateCamera();
    }
}