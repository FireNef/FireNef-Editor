import * as THREE from "three";
import { Object3d } from "./object3d.js";
import { SceneComponent } from "./scene.js";
import { Attribute } from "../attributes.js";

export class DirectionalLightComponent extends Object3d {
    constructor(name = "Directional Light") {
        super(name);
        const lightAttribute = new Attribute("Directional Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 1);
        lightAttribute.addField("Cast Shadows", "boolean", false);
        this.attributes.push(lightAttribute);

        this.object3D = new THREE.DirectionalLight(0xffffff, 1);
        this.object3D.name = name;
    }

    static baseType = "directionalLight";
    static type = "directionalLight";

    static group = "Lights";

    updateAllProperties() {
        this.updateLightProperties();
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0);
        const intensity = this.getAttributeFieldValue(1, 1);
        const castShadows = this.getAttributeFieldValue(1, 2);
        this.object3D.color.set(color);
        this.object3D.intensity = intensity;
        this.object3D.castShadow = castShadows;
        this.object3D.shadow.normalBias = 0.02;
        this.object3D.shadow.bias = -0.0005
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == 1) this.updateLightProperties();
    }
}

export class PointLightComponent extends Object3d {
    constructor(name = "Point Light") {
        super(name);
        const lightAttribute = new Attribute("Point Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 1);
        lightAttribute.addField("Distance", "number", 0);
        lightAttribute.addField("Decay", "number", 2);
        lightAttribute.addField("Cast Shadows", "boolean", false);
        this.attributes.push(lightAttribute);

        this.object3D = new THREE.PointLight(0xffffff, 1, 0, 2);
        this.object3D.name = name;
    }

    static baseType = "pointLight";
    static type = "pointLight";

    static group = "Lights";

    updateAllProperties() {
        this.updateLightProperties();
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0);
        const intensity = this.getAttributeFieldValue(1, 1);
        const distance = this.getAttributeFieldValue(1, 2);
        const decay = this.getAttributeFieldValue(1, 3);
        const castShadows = this.getAttributeFieldValue(1, 4);

        this.object3D.color.set(color);
        this.object3D.intensity = intensity;
        this.object3D.distance = distance;
        this.object3D.decay = decay;
        this.object3D.castShadow = castShadows;
        this.object3D.shadow.normalBias = 0.02;
        this.object3D.shadow.bias = -0.0005;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == 1) this.updateLightProperties();
    }
}

export class SpotLightComponent extends Object3d {

    constructor(name = "Spot Light") {
        super(name);

        const lightAttribute = new Attribute("Spot Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 1);
        lightAttribute.addField("Distance", "number", 0);
        lightAttribute.addField("Angle", "number", Math.PI / 6);
        lightAttribute.addField("Penumbra", "number", 0.1);
        lightAttribute.addField("Decay", "number", 2);
        lightAttribute.addField("Cast Shadows", "boolean", false);

        this.attributes.push(lightAttribute);

        // Create spotlight
        this.object3D = new THREE.SpotLight(0xffffff, 1);
        this.object3D.name = name;
        this.object3D.castShadow = false;
        this.object3D.shadow.normalBias = 0.02;
        this.object3D.shadow.bias = -0.0005;

        // Create target (NOT parented to the light)
        this.target = new THREE.Object3D();
        this.object3D.target = this.target;

        // Internal reusable vectors (no GC spam)
        this._forward = new THREE.Vector3();
        this._quat = new THREE.Quaternion();
        this._worldPos = new THREE.Vector3();
    }

    static baseType = "spotLight";
    static type = "spotLight";

    static group = "Lights";

    start() {
        this.getFirstParentOfType(SceneComponent).object3D.add(this.target);
    }

    updateAllProperties() {
        this.updateLightProperties();
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0);
        const intensity = this.getAttributeFieldValue(1, 1);
        const distance = this.getAttributeFieldValue(1, 2);
        const angle = this.getAttributeFieldValue(1, 3);
        const penumbra = this.getAttributeFieldValue(1, 4);
        const decay = this.getAttributeFieldValue(1, 5);
        const castShadows = this.getAttributeFieldValue(1, 6);

        this.object3D.color.set(color);
        this.object3D.intensity = intensity;
        this.object3D.distance = distance;
        this.object3D.angle = angle;
        this.object3D.penumbra = penumbra;
        this.object3D.decay = decay;
        this.object3D.castShadow = castShadows;
    }

    renderUpdate(alpha = 1.0) {
        super.renderUpdate(alpha);

        if (!this.object3D.parent) return;

        // Make sure world matrices are updated
        this.object3D.updateMatrixWorld(true);

        // Get interpolated WORLD position
        this.object3D.getWorldPosition(this._worldPos);

        // Get interpolated WORLD rotation
        this.object3D.getWorldQuaternion(this._quat);

        // Forward vector
        this._forward.set(0, 0, -1);
        this._forward.applyQuaternion(this._quat);

        // Place target 1 unit forward in world space
        this.target.position.copy(this._worldPos).add(this._forward);

        // Ensure target matrix updates too
        this.target.updateMatrixWorld(true);
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == 1) this.updateLightProperties();
    }
}

export class AmbientLightComponent extends Object3d {
    constructor(name = "Ambient Light") {
        super(name);
        const lightAttribute = new Attribute("Ambient Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 0.5);
        this.attributes.push(lightAttribute);

        this.object3D = new THREE.AmbientLight(0xffffff, 0.5);
        this.object3D.name = name;
    }

    static baseType = "ambientLight";
    static type = "ambientLight";

    static group = "Lights";

    updateAllProperties() {
        this.updateLightProperties();
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0);
        const intensity = this.getAttributeFieldValue(1, 1);

        this.object3D.color = new THREE.Color(color);
        this.object3D.intensity = intensity;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == 1) this.updateLightProperties();
    }
}

export class HemisphereLightComponent extends Object3d {
    constructor(name = "Hemisphere Light") {
        super(name);
        const lightAttribute = new Attribute("Hemisphere Light");
        lightAttribute.addField("Sky Color", "color", "#87CEEB");
        lightAttribute.addField("Ground Color", "color", "#444444");
        lightAttribute.addField("Intensity", "number", 0.6);
        this.attributes.push(lightAttribute);

        this.object3D = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.6);
        this.object3D.name = name;
    }

    static baseType = "hemisphereLight";
    static type = "hemisphereLight";

    static group = "Lights";

    updateAllProperties() {
        this.updateLightProperties();
    }

    updateLightProperties() {
        const skyColor = this.getAttributeFieldValue(1, 0);
        const groundColor = this.getAttributeFieldValue(1, 1);
        const intensity = this.getAttributeFieldValue(1, 2);

        this.object3D.color.set(skyColor);
        this.object3D.groundColor.set(groundColor);
        this.object3D.intensity = intensity;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type)
        if (attribute == 1) this.updateLightProperties()
    }
}