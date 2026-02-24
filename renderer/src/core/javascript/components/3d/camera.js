import { Object3d } from "./object3d.js";
import { Attribute } from "../attributes.js";
import { SceneComponent } from "./scene.js";
import * as THREE from "three";

export class PerspectiveCameraComponent extends Object3d {
    constructor(name = "Perspective Camera") {
        super(name);

        const fov = 60;
        const aspect = 16 / 9;
        const near = 0.1;
        const far = 1000;

        const cameraAttribute = new Attribute("Perspective Camera");
        cameraAttribute.addField("usedCamera", "boolean", false);
        cameraAttribute.addField("FOV", "number", fov);
        cameraAttribute.addField("Near", "number", near);
        cameraAttribute.addField("Far", "number", far);
        this.attributes.push(cameraAttribute);

        this.object3D = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.object3D.name = name;

        this.renderer = null;
    }

    start() {
        this.renderer = this.highestParent.renderer;
    }

    update() {
        super.update(); // Update transform if allowed

        const fov = this.getAttributeFieldValue(1, 1);
        const aspect = this.renderer ? this.renderer.resolution.width / this.renderer.resolution.height : 16 / 9;
        const near = this.getAttributeFieldValue(1, 2);
        const far = this.getAttributeFieldValue(1, 3);
        this.object3D.fov = fov;
        this.object3D.aspect = aspect;
        this.object3D.near = near;
        this.object3D.far = far;
        this.object3D.updateProjectionMatrix();

        const sceneComponent = this.getFirstParentOfType(SceneComponent);
        if (sceneComponent) {
            const usedCamera = this.getAttributeFieldValue(1, 0);
            if (sceneComponent.currentCamera === this && !usedCamera) {
                sceneComponent.currentCamera = null;
            } else if (usedCamera) {
                sceneComponent.currentCamera = this;
            }
        }
    }    
}