import * as THREE from "three";

import { Object3d } from "./object3d.js";
import { Attribute } from "../attributes.js";
import { ComponentController } from "../component.js";
import { Renderer3D } from "../renderer3D.js";
import { TextureComponent } from "./texture.js";

export class SceneComponent extends Object3d {
    constructor(name = "Scene") {
        super(name, false); // disable transform attributes

        this.object3D = new THREE.Scene();
        this.object3D.name = name;

        this.object3D.matrixAutoUpdate = false;
        this.object3D.updateMatrix();

        const sceneAttribute = new Attribute("Scene");
        sceneAttribute.addField("Background", "texture,color", "#000000");
        sceneAttribute.addField("Background Blurriness", "number", 0, { min: 0, max: 1 });
        sceneAttribute.addField("Background Intensity", "number", 1, { min: 0, max: 1 });
        sceneAttribute.addField("Background Rotation", "euler", { x: 0, y: 0, z: 0, order: "XYZ" });
        sceneAttribute.addField("Override Material", "material", null);
        sceneAttribute.addField("Auto Update", "boolean", true);
        this.attributes.push(sceneAttribute);

        const enviormentAttribute = new Attribute("Environment");
        enviormentAttribute.addField("Environment", "texture", null);
        enviormentAttribute.addField("Environment Intensity", "number", 1, { min: 0 });
        enviormentAttribute.addField("Environment Rotation", "euler", { x: 0, y: 0, z: 0, order: "XYZ" });
        this.attributes.push(enviormentAttribute);

        const fogAttribute = new Attribute("Fog");
        fogAttribute.addField("Fog Enabled", "boolean", false);
        fogAttribute.addField("Fog Type", "string", "linear", { defaultValue: "linear", options: ["linear", "exponential2"] });
        fogAttribute.addField("Fog Color", "color", "#000000");
        fogAttribute.addField("Fog Near", "number", 1, { min: 0 });
        fogAttribute.addField("Fog Far", "number", 1000, { min: 0 });
        fogAttribute.addField("Fog Density", "number", 1, { min: 0 });
        this.attributes.push(fogAttribute);

        this.currentCamera = null;

        this.updateDepthLimit = 100000;
    }

    static baseType = "scene";
    static type = "scene";

    updateAllProperties() {
        this.updateScene();
        this.updateEnvironment();
        this.updateFog();
    }

    async updateEnvironment() {
        const renderer = this.getFirstParentOfType(Renderer3D);

        if (!renderer.initialized) return;

        const texComp = this.getAttr("Environment", "Environment");
        if (!texComp || !texComp.texture) {
            this.object3D.environment = null;
            return;
        }

        let envMap = texComp.texture;

        if (texComp.getAttr("Texture", "Preset") == "environment") {
            // Only generate PMREM once per environment texture
            if (!texComp.pmremTexture) {
                if (texComp.texture !== texComp._lastTexture) {
                    texComp.pmremTexture = null;
                    texComp._lastTexture = texComp.texture;
                }

                if (!renderer.pmremGenerator) {
                    console.warn("Renderer PMREMGenerator not found!");
                } else {
                    // Use synchronous fromEquirectangular (WebGPU-safe after renderer.init())
                    const pmremResult = await renderer.pmremGenerator.fromEquirectangular(texComp.texture);
                    texComp.pmremTexture = pmremResult.texture;
                }
            }
            envMap = texComp.pmremTexture;
        }

        this.object3D.environment = envMap;
        this.object3D.environmentIntensity = this.getAttr("Environment", "Environment Intensity");

        const envRotation = this.getAttr("Environment", "Environment Rotation");
        this.object3D.environmentRotation.set(THREE.MathUtils.degToRad(envRotation.x), THREE.MathUtils.degToRad(envRotation.y), THREE.MathUtils.degToRad(envRotation.z));

        // Update all child materials so reflections take effect
        this.object3D.traverse((obj) => {
            if (!obj.material) return;

            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.needsUpdate = true);
            } else {
                obj.material.needsUpdate = true;
            }
        });
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Scene") this.updateScene();
        if (attribute == "Environment") this.updateEnvironment();
        if (attribute == "Fog") this.updateFog();
    }

    start() {
        this.updateDepthLimit = this.getFirstParentOfType(ComponentController)?.updateDepthLimit || 100000;
        this.updateAllProperties();
    }

    update() {
        if (this.getAttr("Scene", "Auto Update")) {
            this.object3D.updateMatrixWorld();
        }
    }

    renderUpdate(alpha = 1.0) {
        if (!this.enable) return;
        this.renderUpdateChildCluster(alpha, this.children);
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

    updateScene() {
        if (this.getAttr("Scene", "Background") instanceof TextureComponent) {
            this.object3D.background = this.getAttr("Scene", "Background")?.texture ?? null;
        } else {
            this.object3D.background = new THREE.Color(this.getAttr("Scene", "Background"));
        }
        this.object3D.backgroundBlurriness = this.getAttr("Scene", "Background Blurriness");
        this.object3D.backgroundIntensity = this.getAttr("Scene", "Background Intensity");

        const backgroundRotation = this.getAttr("Scene", "Background Rotation");
        this.object3D.backgroundRotation.set(THREE.MathUtils.degToRad(backgroundRotation.x), THREE.MathUtils.degToRad(backgroundRotation.y), THREE.MathUtils.degToRad(backgroundRotation.z));
    
        this.object3D.overrideMaterial = this.getAttr("Scene", "Override Material");
    }

    updateFog() {
        if (!this.getAttr("Fog", "Enabled")) {
            this.object3D.fog = null;
            return;
        }

        if (this.getAttr("Fog", "Type") === "linear") {
            this.object3D.fog = new THREE.Fog(new THREE.Color(this.getAttr("Fog", "Fog Color")), this.getAttr("Fog", "Fog Near"), this.getAttr("Fog", "Fog Far"));
        } else {
            this.object3D.fog = new THREE.FogExp2(new THREE.Color(this.getAttr("Fog", "Fog Color")), this.getAttr("Fog", "Fog Near"), this.getAttr("Fog", "Fog Far"));
        }
    }
}
