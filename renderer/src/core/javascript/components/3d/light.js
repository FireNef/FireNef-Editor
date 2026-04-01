import * as THREE from "three";
import { Object3d } from "./object3d.js";
import { SceneComponent } from "./scene.js";
import { Attribute } from "../attributes.js";

export class DirectionalLightComponent extends Object3d {
    constructor(name = "Directional Light") {
        super(name);
        const lightAttribute = new Attribute("Directional Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 1, { min: 0 });
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
        const color = this.getAttr("Directional Light", "Color");
        const intensity = this.getAttr("Directional Light", "Intensity");
        const castShadows = this.getAttr("Directional Light", "Cast Shadows");
        this.object3D.color.set(color);
        this.object3D.intensity = intensity;
        this.object3D.castShadow = castShadows;
        this.object3D.shadow.normalBias = 0.02;
        this.object3D.shadow.bias = -0.0005
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Directional Light") this.updateLightProperties();
    }
}

export class PointLightComponent extends Object3d {
    constructor(name = "Point Light") {
        super(name);
        const lightAttribute = new Attribute("Point Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 1, { min: 0 });
        lightAttribute.addField("Distance", "number", 0, { min: 0 });
        lightAttribute.addField("Decay", "number", 2, { min: 0 });
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
        const color = this.getAttr("Point Light", "Color");
        const intensity = this.getAttr("Point Light", "Intensity");
        const distance = this.getAttr("Point Light", "Distance");
        const decay = this.getAttr("Point Light", "Decay");
        const castShadows = this.getAttr("Point Light", "Cast Shadows");

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
        if (attribute == "Point Light") this.updateLightProperties();
    }
}

export class SpotLightComponent extends Object3d {

    constructor(name = "Spot Light") {
        super(name);

        const lightAttribute = new Attribute("Spot Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 1, { min: 0 });
        lightAttribute.addField("Distance", "number", 0, { min: 0 });
        lightAttribute.addField("Angle", "number", 45);
        lightAttribute.addField("Penumbra", "number", 0.1, { min: 0 });
        lightAttribute.addField("Decay", "number", 2, { min: 0 });
        lightAttribute.addField("Cast Shadows", "boolean", false);

        this.attributes.push(lightAttribute);

        this.object3D = new THREE.SpotLight(0xffffff, 1);
        this.object3D.name = name;
        this.object3D.castShadow = false;
        this.object3D.shadow.normalBias = 0.02;
        this.object3D.shadow.bias = -0.0005;

        this.target = new THREE.Object3D();
        this.object3D.target = this.target;

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
        const color = this.getAttr("Spot Light", "Color");
        const intensity = this.getAttr("Spot Light", "Intensity");
        const distance = this.getAttr("Spot Light", "Distance");
        const angle = this.getAttr("Spot Light", "Angle");
        const penumbra = this.getAttr("Spot Light", "Penumbra");
        const decay = this.getAttr("Spot Light", "Decay");
        const castShadows = this.getAttr("Spot Light", "Cast Shadows");

        this.object3D.color.set(color);
        this.object3D.intensity = intensity;
        this.object3D.distance = distance;
        this.object3D.angle = angle * Math.PI / 180;
        this.object3D.penumbra = penumbra;
        this.object3D.decay = decay;
        this.object3D.castShadow = castShadows;
    }

    renderUpdate(alpha = 1.0) {
        super.renderUpdate(alpha);

        if (!this.object3D.parent) return;

        this.object3D.updateMatrixWorld(true);
        this.object3D.getWorldPosition(this._worldPos);
        this.object3D.getWorldQuaternion(this._quat);

        this._forward.set(0, 0, -1);
        this._forward.applyQuaternion(this._quat);

        this.target.position.copy(this._worldPos).add(this._forward);
        this.target.updateMatrixWorld(true);
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Spot Light") this.updateLightProperties();
    }
}

export class AmbientLightComponent extends Object3d {
    constructor(name = "Ambient Light") {
        super(name);
        const lightAttribute = new Attribute("Ambient Light");
        lightAttribute.addField("Color", "color", "#FFFFFF");
        lightAttribute.addField("Intensity", "number", 0.5, { min: 0 });
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
        const color = this.getAttr("Ambient Light", "Color");
        const intensity = this.getAttr("Ambient Light", "Intensity");

        this.object3D.color = new THREE.Color(color);
        this.object3D.intensity = intensity;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Ambient Light") this.updateLightProperties();
    }
}

export class HemisphereLightComponent extends Object3d {
    constructor(name = "Hemisphere Light") {
        super(name);
        const lightAttribute = new Attribute("Hemisphere Light");
        lightAttribute.addField("Sky Color", "color", "#87CEEB");
        lightAttribute.addField("Ground Color", "color", "#444444");
        lightAttribute.addField("Intensity", "number", 0.6, { min: 0 });
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
        const skyColor = this.getAttr("Hemisphere Light", "Sky Color");
        const groundColor = this.getAttr("Hemisphere Light", "Ground Color");
        const intensity = this.getAttr("Hemisphere Light", "Intensity");

        this.object3D.color.set(skyColor);
        this.object3D.groundColor.set(groundColor);
        this.object3D.intensity = intensity;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type)
        if (attribute == "Hemisphere Light") this.updateLightProperties()
    }
}