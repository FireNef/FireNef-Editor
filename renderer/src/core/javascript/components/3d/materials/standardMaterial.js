import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "three";

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
        coreAttribute.addField("Visible", "boolean", true);
        coreAttribute.addField("Color", "color", "#ffffff");
        coreAttribute.addField("Opacity", "number", 1.0, { min: 0, max: 1 });
        coreAttribute.addField("Transparent", "boolean", false);
        coreAttribute.addField("Texture", "texture", null);
        coreAttribute.addField("Alpha Map", "texture", null);
        coreAttribute.addField("Side", "three", THREE.FrontSide, { defaultValue: "THREE.FrontSide", options: ["THREE.FrontSide", "THREE.BackSide", "THREE.DoubleSide"] });
        coreAttribute.addField("Wireframe", "boolean", false);
        coreAttribute.addField("Wireframe Linewidth", "number", 1, { min: 0 });
        this.attributes.push(coreAttribute);

        if (this.lightingBased) {
            const surfaceAttribute = new Attribute("Surface");
            surfaceAttribute.addField("Roughness", "number", 1.0, { min: 0, max: 1 });
            surfaceAttribute.addField("Metalness", "number", 0.0, { min: 0, max: 1 });
            surfaceAttribute.addField("Roughness Map", "texture", null);
            surfaceAttribute.addField("Metalness Map", "texture", null);
            this.attributes.push(surfaceAttribute);
        }

        if (this.usesEmission) {
            const emissionAttribute = new Attribute("Emission");
            emissionAttribute.addField("Emissive Color", "color", "#000000");
            emissionAttribute.addField("Emissive Intensity", "number", 1.0, { min: 0 });
            emissionAttribute.addField("Emissive Map", "texture", null);
            this.attributes.push(emissionAttribute);
        }

        if (this.detailBased) {
            const detailAttribute = new Attribute("Detail");
            detailAttribute.addField("Normal Map", "texture", null);
            detailAttribute.addField("Normal Scale", "vec2", {x: 1, y: 1});
            detailAttribute.addField("Bump Map", "texture", null);
            detailAttribute.addField("Bump Scale", "number", 1, { min: 0 });
            this.attributes.push(detailAttribute);
        }
        
        if (this.usesDisplacement) {
            const displacementAttribute = new Attribute("Displacement");
            displacementAttribute.addField("Displacement Map", "texture", null);
            displacementAttribute.addField("Displacement Scale", "number", 1, { min: 0 });
            displacementAttribute.addField("Displacement Bias", "number", 0, { min: 0 });
            this.attributes.push(displacementAttribute);
        }

        if (this.usesLight) {
            const lightAttribute = new Attribute("Light");
            lightAttribute.addField("Light Map", "texture", null);
            lightAttribute.addField("Light Map Intensity", "number", 1, { min: 0 });
            this.attributes.push(lightAttribute);
        }

        if (this.usesAmbient) {
            const ambientAttribute = new Attribute("Ambient Occlusion");
            ambientAttribute.addField("AO Map", "texture", null);
            ambientAttribute.addField("AO Intensity", "number", 1, { min: 0 });
            this.attributes.push(ambientAttribute);
        }

        if (this.usesReflection) {
            const reflectionAttribute = new Attribute("Reflection");
            reflectionAttribute.addField("Env Map", "texture", null);
            reflectionAttribute.addField("Env Map Intensity", "number", 1, { min: 0 });
            this.attributes.push(reflectionAttribute);
        }

        if (this.usesOther) {
            const otherAttribute = new Attribute("Other");
            otherAttribute.addField("Flat Shading", "boolean", false);
            otherAttribute.addField("Fog", "boolean", true);
            otherAttribute.addField("Polygon Offset", "boolean", false);
            otherAttribute.addField("Polygon Offset Factor", "number", 0);
            otherAttribute.addField("Polygon Offset Units", "number", 0);
            this.attributes.push(otherAttribute);
        }
    }

    static group = "3D Materials";

    static baseType = "material"
    static type = "standardMaterial"

    updateAllProperties() {
        this.updateCoreMaterialProperties();
        this.updateSurfaceMaterialProperties();
        this.updateEmissionMaterialProperties();
        this.updateDetailMaterialProperties();
        this.updateDisplacementMaterialProperties();
        this.updateLightMaterialProperties();
        this.updateAmbientMaterialProperties();
        this.updateReflectionMaterialProperties();
        this.updateOtherMaterialProperties();
    }

    updateCoreMaterialProperties() {
        this.material.visible = this.getAttr("Core", "Visible");
        if (this.material.color.set) {
            this.material.color.set(this.getAttr("Core", "Color"));
        } else {
            this.material.color = new THREE.Color(this.getAttr("Core", "Color"));
        }
        this.material.opacity = this.getAttr("Core", "Opacity");
        this.material.transparent = this.getAttr("Core", "Transparent");
        this.material.map = this.getAttr("Core", "Texture")?.texture ?? null;
        this.material.alphaMap = this.getAttr("Core", "Alpha Map")?.texture ?? null;
        this.material.side = this.getAttr("Core", "Side");
        this.material.wireframe = this.getAttr("Core", "Wireframe");
        this.material.wireframeLinewidth = this.getAttr("Core", "Wireframe Line Width");
        this.material.needsUpdate = true;
    }

    updateSurfaceMaterialProperties() {
        if (!this.lightingBased) return;
        this.material.roughness = this.getAttr("Surface", "Roughness");
        this.material.metalness = this.getAttr("Surface", "Metalness");
        this.material.roughnessMap = this.getAttr("Surface", "Roughness Map")?.texture ?? null;
        this.material.metalnessMap = this.getAttr("Surface", "Metalness Map")?.texture ?? null;
        this.material.needsUpdate = true;
    }

    updateEmissionMaterialProperties() {
        if (!this.usesEmission) return;
        this.material.emissive.set(this.getAttr("Emission", "Emissive Color"));
        this.material.emissiveIntensity = this.getAttr("Emission", "Emissive Intensity");
        this.material.emissiveMap = this.getAttr("Emission", "Emissive Map")?.texture ?? null;
        this.material.needsUpdate = true;
    }

    updateDetailMaterialProperties() {
        if (!this.detailBased) return;
        this.material.normalMap = this.getAttr("Detail", "Normal Map")?.texture ?? null;
        const normalScale = this.getAttr("Detail", "Normal Scale");
        this.material.normalScale = new THREE.Vector2(normalScale.x, normalScale.y);
        this.material.bumpMap = this.getAttr("Detail", "Bump Map")?.texture ?? null;
        this.material.bumpScale = this.getAttr("Detail", "Bump Scale");
        this.material.needsUpdate = true;
    }

    updateDisplacementMaterialProperties() {
        if (!this.usesDisplacement) return;
        this.material.displacementMap = this.getAttr("Displacement", "Map")?.texture ?? null;
        this.material.displacementScale = this.getAttr("Displacement", "Scale");
        this.material.displacementBias = this.getAttr("Displacement", "Bias");
        this.material.needsUpdate = true;
    }

    updateLightMaterialProperties() {
        if (!this.usesLight) return;
        this.material.lightMap = this.getAttr("Light", "Light Map")?.texture ?? null;
        this.material.lightMapIntensity = this.getAttr("Light", "Light Map Intensity");
        this.material.needsUpdate = true;
    }

    updateAmbientMaterialProperties() {
        if (!this.usesAmbient) return;
        this.material.aoMap = this.getAttr("Ambient", "AO Map")?.texture ?? null;
        this.material.aoMapIntensity = this.getAttr("Ambient", "AO Intensity");
        this.material.needsUpdate = true;
    }

    updateReflectionMaterialProperties() {
        if (!this.usesReflection) return;
        this.material.envMap = this.getAttr("Reflection", "Env Map")?.texture ?? null;
        this.material.envMapIntensity = this.getAttr("Reflection", "Env Map Intensity");
        this.material.needsUpdate = true;
    }

    updateOtherMaterialProperties() {
        if (!this.usesOther) return;
        this.material.flatShading = this.getAttr("Other", "Flat Shading");
        this.material.fog = this.getAttr("Other", "Fog");
        this.material.polygonOffset = this.getAttr("Other", "Polygon Offset");
        this.material.polygonOffsetFactor = this.getAttr("Other", "Polygon Offset Factor");
        this.material.polygonOffsetUnits = this.getAttr("Other", "Polygon Offset Units");
        this.material.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        
        if (attribute == "Core") this.updateCoreMaterialProperties();
        if (attribute == "Surface") this.updateSurfaceMaterialProperties();
        if (attribute == "Emission") this.updateEmissionMaterialProperties();
        if (attribute == "Detail") this.updateDetailMaterialProperties();
        if (attribute == "Displacement") this.updateDisplacementMaterialProperties();
        if (attribute == "Light") this.updateLightMaterialProperties();
        if (attribute == "Ambient") this.updateAmbientMaterialProperties();
        if (attribute == "Reflection") this.updateReflectionMaterialProperties();
        if (attribute == "Other") this.updateOtherMaterialProperties();
    }
}