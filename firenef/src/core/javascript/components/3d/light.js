import * as THREE from "#three";
import { Object3d } from "./object3d.js";
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

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0);
        const intensity = this.getAttributeFieldValue(1, 1);
        const castShadows = this.getAttributeFieldValue(1, 2);
        this.object3D.color = new THREE.Color(color);
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
        super(name)
        const lightAttribute = new Attribute("Point Light")
        lightAttribute.addField("Color", "color", "#FFFFFF")
        lightAttribute.addField("Intensity", "number", 1)
        lightAttribute.addField("Distance", "number", 0)
        lightAttribute.addField("Decay", "number", 2)
        lightAttribute.addField("Cast Shadows", "boolean", false)
        this.attributes.push(lightAttribute)

        this.object3D = new THREE.PointLight(0xffffff, 1, 0, 2)
        this.object3D.name = name
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0)
        const intensity = this.getAttributeFieldValue(1, 1)
        const distance = this.getAttributeFieldValue(1, 2)
        const decay = this.getAttributeFieldValue(1, 3)
        const castShadows = this.getAttributeFieldValue(1, 4)

        this.object3D.color = new THREE.Color(color)
        this.object3D.intensity = intensity
        this.object3D.distance = distance
        this.object3D.decay = decay
        this.object3D.castShadow = castShadows
        this.object3D.shadow.normalBias = 0.02
        this.object3D.shadow.bias = -0.0005
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type)
        if (attribute == 1) this.updateLightProperties()
    }
}

export class SpotLightComponent extends Object3d {
    constructor(name = "Spot Light") {
        super(name)
        const lightAttribute = new Attribute("Spot Light")
        lightAttribute.addField("Color", "color", "#FFFFFF")
        lightAttribute.addField("Intensity", "number", 1)
        lightAttribute.addField("Distance", "number", 0)
        lightAttribute.addField("Angle", "number", Math.PI / 6)
        lightAttribute.addField("Penumbra", "number", 0.1)
        lightAttribute.addField("Decay", "number", 2)
        lightAttribute.addField("Cast Shadows", "boolean", false)
        lightAttribute.addField("Target", "vector3", { x: 0, y: 0, z: -1 }) // default forward
        this.attributes.push(lightAttribute)

        this.object3D = new THREE.SpotLight(0xffffff, 1)
        this.object3D.name = name
        this.object3D.castShadow = true
        this.object3D.shadow.normalBias = 0.02
        this.object3D.shadow.bias = -0.0005

        // Create a target object for the spotlight
        this.target = new THREE.Object3D()
        this.object3D.target = this.target
        this.target.position.set(0, 0, -1) // default forward
        this.object3D.add(this.target)
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0)
        const intensity = this.getAttributeFieldValue(1, 1)
        const distance = this.getAttributeFieldValue(1, 2)
        const angle = this.getAttributeFieldValue(1, 3)
        const penumbra = this.getAttributeFieldValue(1, 4)
        const decay = this.getAttributeFieldValue(1, 5)
        const castShadows = this.getAttributeFieldValue(1, 6)

        this.object3D.color = new THREE.Color(color)
        this.object3D.intensity = intensity
        this.object3D.distance = distance
        this.object3D.angle = angle
        this.object3D.penumbra = penumbra
        this.object3D.decay = decay
        this.object3D.castShadow = castShadows
    }

    // Keep the spotlight always pointing forward
    update() {
        if (!this.object3D.parent) return
        this.target.position.set(0, 0, -1) // forward relative to parent
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type)
        if (attribute == 1) this.updateLightProperties()
    }
}

export class AmbientLightComponent extends Object3d {
    constructor(name = "Ambient Light") {
        super(name)
        const lightAttribute = new Attribute("Ambient Light")
        lightAttribute.addField("Color", "color", "#FFFFFF")
        lightAttribute.addField("Intensity", "number", 0.5)
        this.attributes.push(lightAttribute)

        this.object3D = new THREE.AmbientLight(0xffffff, 0.5)
        this.object3D.name = name
    }

    updateLightProperties() {
        const color = this.getAttributeFieldValue(1, 0)
        const intensity = this.getAttributeFieldValue(1, 1)

        this.object3D.color = new THREE.Color(color)
        this.object3D.intensity = intensity
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type)
        if (attribute == 1) this.updateLightProperties()
    }
}

export class HemisphereLightComponent extends Object3d {
    constructor(name = "Hemisphere Light") {
        super(name)
        const lightAttribute = new Attribute("Hemisphere Light")
        lightAttribute.addField("Sky Color", "color", "#87CEEB")
        lightAttribute.addField("Ground Color", "color", "#444444")
        lightAttribute.addField("Intensity", "number", 0.6)
        this.attributes.push(lightAttribute)

        this.object3D = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.6)
        this.object3D.name = name
    }

    updateLightProperties() {
        const skyColor = this.getAttributeFieldValue(1, 0)
        const groundColor = this.getAttributeFieldValue(1, 1)
        const intensity = this.getAttributeFieldValue(1, 2)

        this.object3D.color = new THREE.Color(skyColor)
        this.object3D.groundColor = new THREE.Color(groundColor)
        this.object3D.intensity = intensity
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type)
        if (attribute == 1) this.updateLightProperties()
    }
}