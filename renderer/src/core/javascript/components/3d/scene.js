import * as THREE from "three";

import { Object3d } from "./object3d.js";
import { Attribute } from "../attributes.js";
import { ComponentController } from "../componentController.js";


export class SceneComponent extends Object3d {
    constructor(name = "Scene") {
        super(name, false); // disable transform attributes

        this.object3D = new THREE.Scene();
        this.object3D.name = name;

        this.object3D.matrixAutoUpdate = false;
        this.object3D.updateMatrix();

        const sceneAttribute = new Attribute("Scene");
        sceneAttribute.addField("Background", "any", "#000000");
        sceneAttribute.addField("Environment", "texture", null);
        sceneAttribute.addField("Fog Enabled", "boolean", false);
        sceneAttribute.addField("Fog Color", "color", "#000000");
        sceneAttribute.addField("Fog Near", "number", 1);
        sceneAttribute.addField("Fog Far", "number", 1000);
        sceneAttribute.addField("Override Material", "material", null);
        sceneAttribute.addField("Auto Update", "boolean", true);

        this.attributes.push(sceneAttribute);

        this.currentCamera = null;

    
        this.updateDepthLimit = 100000;
    }

    async updateEnvironment(renderer) {
        const texComp = this.getAttributeFieldValue(0, 1);
        if (!texComp || !texComp.texture) {
            this.object3D.environment = null;
            return;
        }

        let envMap = texComp.texture;

        if (texComp.isEnvMap) {
            // Only generate PMREM once per environment texture
            if (!texComp.pmremTexture) {
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

        // Update all child materials so reflections take effect
        this.object3D.traverse((obj) => {
            if (obj.material) obj.material.needsUpdate = true;
        });
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, engine) {
        await super.setAttributeFieldValue(attribute, field, value, type, engine);
        if (attribute == 0) {
            if (field == 0) this.updateBackground();
            if (field == 1) await this.updateEnvironment(engine.renderer);
        }
    }

    start() {
        this.updateDepthLimit = this.getFirstParentOfType(ComponentController)?.updateDepthLimit || 100000;
    }

    update() {
        this.object3D.overrideMaterial = this.getAttributeFieldValue(0, 6);

        const fogEnabled = this.getAttributeFieldValue(0, 2);
        if (fogEnabled) {
            const color = this.getAttributeFieldValue(0, 3);
            const near = this.getAttributeFieldValue(0, 4);
            const far = this.getAttributeFieldValue(0, 5);

            if (
                !this.object3D.fog ||
                this.object3D.fog.near !== near ||
                this.object3D.fog.far !== far
            ) {
                this.object3D.fog = new THREE.Fog(color, near, far);
            } else {
                this.object3D.fog.color.set(color);
            }
        } else {
            this.object3D.fog = null;
        }

        if (this.getAttributeFieldValue(0, 7)) {
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

    updateBackground() {
        const bg = this.getAttributeFieldValue(0, 0);

        if (bg === null) {
            this.object3D.background = null;
        } else if (typeof bg === "string") {
            if (!(this.object3D.background instanceof THREE.Color)) {
                this.object3D.background = new THREE.Color(bg);
            } else {
                this.object3D.background.set(bg);
            }
        } else if (bg?.texture instanceof THREE.Texture) {
            if (bg.texture && this.object3D.background !== bg.texture) {
                this.object3D.background = bg.texture;
            }
        } else {
            console.warn("SceneComponent: Invalid background type", bg);
        }
    }
}
