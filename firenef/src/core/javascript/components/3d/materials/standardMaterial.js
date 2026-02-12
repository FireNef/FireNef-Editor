import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "#three";

export class StandardMaterialComponent extends Component {
    constructor(name = "Standard Material", lightingBased = true, detailBased = true, usesEmission = true, usesDisplacement = true, usesLight = true, usesAmbient = true, usesReflection = true, usesOther = true) {
        super(name);

        this.lightingBased = lightingBased;
        this.detailBased = detailBased;
        this.usesLight = usesLight;
        this.usesAmbient = usesAmbient;
        this.usesReflection = usesReflection;
        this.usesOther = usesOther;
        this.usesEmission = usesEmission;
        this.usesDisplacement = usesDisplacement;
        
        this.material = new THREE.MeshStandardMaterial();

        const coreAttribute = new Attribute("Core");
        coreAttribute.addField("Visible", "visible", true);
        coreAttribute.addField("Color", "color", "#ffffff");
        coreAttribute.addField("Opacity", "opacity", 1.0);
        coreAttribute.addField("Transparent", "transparent", false);
        coreAttribute.addField("Texture", "map", null);
        coreAttribute.addField("Alpha Map", "alphaMap", null);
        coreAttribute.addField("Side", "side", THREE.FrontSide);
        coreAttribute.addField("Wireframe", "wireframe", false);
        coreAttribute.addField("Wireframe Linewidth", "wireframeLinewidth", 1);
        this.attributes.push(coreAttribute);

        if (this.lightingBased) {
            const surfaceAttribute = new Attribute("Surface");
            surfaceAttribute.addField("Roughness", "roughness", 0.5);
            surfaceAttribute.addField("Metalness", "metalness", 0.5);
            surfaceAttribute.addField("Roughness Map", "roughnessMap", null);
            surfaceAttribute.addField("Metalness Map", "metalnessMap", null);
            this.attributes.push(surfaceAttribute);
        }

        if (this.usesEmission) {
            const emissionAttribute = new Attribute("Emission");
            emissionAttribute.addField("Emissive Color", "emissive", "#000000");
            emissionAttribute.addField("Emissive Intensity", "emissiveIntensity", 1.0);
            emissionAttribute.addField("Emissive Map", "emissiveMap", null);
            this.attributes.push(emissionAttribute);
        }

        if (this.detailBased) {
            const detailAttribute = new Attribute("Detail");
            detailAttribute.addField("Normal Map", "normalMap", null);
            detailAttribute.addField("Normal Scale", "normalScale", {x: 1, y: 1});
            detailAttribute.addField("Bump Map", "bumpMap", null);
            detailAttribute.addField("Bump Scale", "bumpScale", 1);
            this.attributes.push(detailAttribute);
        }
        
        if (this.usesDisplacement) {
            const displacementAttribute = new Attribute("Displacement");
            displacementAttribute.addField("Displacement Map", "displacementMap", null);
            displacementAttribute.addField("Displacement Scale", "displacementScale", 1);
            displacementAttribute.addField("Displacement Bias", "displacementBias", 0);
            this.attributes.push(displacementAttribute);
        }

        if (this.usesLight) {
            const lightAttribute = new Attribute("Light");
            lightAttribute.addField("Light Map", "lightMap", null);
            lightAttribute.addField("Light Map Intensity", "lightMapIntensity", 1);
            this.attributes.push(lightAttribute);
        }

        if (this.usesAmbient) {
            const ambientAttribute = new Attribute("Ambient Occlusion");
            ambientAttribute.addField("AO Map", "aoMap", null);
            ambientAttribute.addField("AO Intensity", "aoMapIntensity", 1);
            this.attributes.push(ambientAttribute);
        }

        if (this.usesReflection) {
            const reflectionAttribute = new Attribute("Reflection");
            reflectionAttribute.addField("Env Map", "envMap", null);
            reflectionAttribute.addField("Env Map Intensity", "envMapIntensity", 1);
            this.attributes.push(reflectionAttribute);
        }

        if (this.usesOther) {
            const otherAttribute = new Attribute("Other");
            otherAttribute.addField("Flat Shading", "flatShading", false);
            otherAttribute.addField("Fog", "fog", true);
            otherAttribute.addField("Polygon Offset", "polygonOffset", false);
            otherAttribute.addField("Polygon Offset Factor", "polygonOffsetFactor", 0);
            otherAttribute.addField("Polygon Offset Units", "polygonOffsetUnits", 0);
            this.attributes.push(otherAttribute);
        }
    }

    static group = "3D Materials";

    updateCoreMaterialProperties(attribute = 0) {
        this.material.visible = this.getAttributeFieldValue(attribute, 0);
        this.material.color = new THREE.Color(this.getAttributeFieldValue(attribute, 1));
        this.material.opacity = this.getAttributeFieldValue(attribute, 2);
        this.material.transparent = this.getAttributeFieldValue(attribute, 3);
        this.material.map = this.getAttributeFieldValue(attribute, 4);
        this.material.alphaMap = this.getAttributeFieldValue(attribute, 5);
        this.material.side = this.getAttributeFieldValue(attribute, 6);
        this.material.wireframe = this.getAttributeFieldValue(attribute, 7);
        this.material.wireframeLinewidth = this.getAttributeFieldValue(attribute, 8);
        this.material.needsUpdate = true;
    }

    updateSurfaceMaterialProperties(attribute = 1) {
        if (!this.lightingBased) return;
        this.material.roughness = this.getAttributeFieldValue(attribute, 0);
        this.material.metalness = this.getAttributeFieldValue(attribute, 1);
        this.material.roughnessMap = this.getAttributeFieldValue(attribute, 2);
        this.material.metalnessMap = this.getAttributeFieldValue(attribute, 3);
        this.material.needsUpdate = true;
    }

    updateEmissionMaterialProperties(attribute = 2) {
        this.material.emissive = new THREE.Color(this.getAttributeFieldValue(attribute, 0));
        this.material.emissiveIntensity = this.getAttributeFieldValue(attribute, 1);
        this.material.emissiveMap = this.getAttributeFieldValue(attribute, 2);
        this.material.needsUpdate = true;
    }

    updateDetailMaterialProperties(attribute = 3) {
        if (!this.detailBased) return;
        this.material.normalMap = this.getAttributeFieldValue(attribute, 0);
        const normalScale = this.getAttributeFieldValue(attribute, 1);
        this.material.normalScale = new THREE.Vector2(normalScale.x, normalScale.y);
        this.material.bumpMap = this.getAttributeFieldValue(attribute, 2);
        this.material.bumpScale = this.getAttributeFieldValue(attribute, 3);
        this.material.needsUpdate = true;
    }

    updateDisplacementMaterialProperties(attribute = 4) {
        this.material.displacementMap = this.getAttributeFieldValue(attribute, 0);
        this.material.displacementScale = this.getAttributeFieldValue(attribute, 1);
        this.material.displacementBias = this.getAttributeFieldValue(attribute, 2);
        this.material.needsUpdate = true;
    }

    updateLightMaterialProperties(attribute = 5) {
        this.material.lightMap = this.getAttributeFieldValue(attribute, 0);
        this.material.lightMapIntensity = this.getAttributeFieldValue(attribute, 1);
        this.material.needsUpdate = true;
    }

    updateAmbientMaterialProperties(attribute = 6) {
        this.material.aoMap = this.getAttributeFieldValue(attribute, 0);
        this.material.aoMapIntensity = this.getAttributeFieldValue(attribute, 1);
        this.material.needsUpdate = true;
    }

    updateReflectionMaterialProperties(attribute = 7) {
        this.material.envMap = this.getAttributeFieldValue(attribute, 0);
        this.material.envMapIntensity = this.getAttributeFieldValue(attribute, 1);
        this.material.needsUpdate = true;
    }

    updateOtherMaterialProperties(attribute = 8) {
        this.material.flatShading = this.getAttributeFieldValue(attribute, 0);
        this.material.fog = this.getAttributeFieldValue(attribute, 1);
        this.material.polygonOffset = this.getAttributeFieldValue(attribute, 2);
        this.material.polygonOffsetFactor = this.getAttributeFieldValue(attribute, 3);
        this.material.polygonOffsetUnits = this.getAttributeFieldValue(attribute, 4);
        this.material.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        
        if (attribute == 0) { // Core
            this.updateCoreMaterialProperties(attribute);
            return;
        }

        this.currentAttributeAmount = attribute;

        if (this.lightingBased) { // Surface
            if (this.currentAttributeAmount == 1) {
                this.updateSurfaceMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.usesEmission) { // Emission
            if (this.currentAttributeAmount == 1) {
                this.updateEmissionMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.detailBased) { // Detail
            if (this.currentAttributeAmount == 1) {
                this.updateDetailMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.usesDisplacement) { // Displacement
            if (this.currentAttributeAmount == 1) {
                this.updateDisplacementMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.usesLight) { // Light
            if (this.currentAttributeAmount == 1) {
                this.updateLightMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.usesAmbient) { // Ambient Occlusion
            if (this.currentAttributeAmount == 1) {
                this.updateAmbientMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.usesReflection) { // Reflection
            if (this.currentAttributeAmount == 1) {
                this.updateReflectionMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
        if (this.usesOther) { // Other
            if (this.currentAttributeAmount == 1) {
                this.updateOtherMaterialProperties(attribute);
                return;
            }
            this.currentAttributeAmount--;
        }
    }
}