import { StandardMaterialComponent } from "./standardMaterial.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "three";

export class PhysicalMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Physical Material", lightingBased = true, detailBased = true, usesEmission = true, usesDisplacement = true, usesLight = true, usesAmbient = true, usesReflection = true, usesOther = true) {
        super(name, lightingBased, detailBased, usesEmission, usesDisplacement, usesLight, usesAmbient, usesReflection, usesOther);

        this.material = new THREE.MeshPhysicalMaterial();

        const clearCoatAttribute = new Attribute("Clear Coat");
        clearCoatAttribute.addField("Clear Coat Strength", "number", 0.0, { min: 0, max: 1 });
        clearCoatAttribute.addField("Clear Coat Roughness", "number", 0.0, { min: 0, max: 1 });
        clearCoatAttribute.addField("Clear Coat Map", "texture", null);
        clearCoatAttribute.addField("Clear Coat Roughness Map", "texture", null);
        clearCoatAttribute.addField("Clear Coat Normal Map", "texture", null);
        this.attributes.push(clearCoatAttribute);

        const sheenAttribute = new Attribute("Sheen");
        sheenAttribute.addField("Sheen Strength", "number", 0.0, { min: 0, max: 1 });
        sheenAttribute.addField("Sheen Color", "color", "#000000");
        sheenAttribute.addField("Sheen Roughness", "number", 0.0, { min: 0, max: 1 });
        sheenAttribute.addField("Sheen Color Map", "texture", null);
        sheenAttribute.addField("Sheen Roughness Map", "texture", null);
        this.attributes.push(sheenAttribute);

        const transmissionAttribute = new Attribute("Transmission");
        transmissionAttribute.addField("Transmission", "number", 0.0, { min: 0, max: 1 });
        transmissionAttribute.addField("Transmission Map", "texture", null);
        transmissionAttribute.addField("Thickness", "number", 0.0, { min: 0 });
        transmissionAttribute.addField("Thickness Map", "texture", null);
        transmissionAttribute.addField("Attenuation Color", "color", "#ffffff");
        transmissionAttribute.addField("Attenuation Distance", "number", 0.0, { min: 0 });
        transmissionAttribute.addField("Ior", "number", 1.0, { min: 0 });
        this.attributes.push(transmissionAttribute);

        const iridescenceAttribute = new Attribute("Iridescence");
        iridescenceAttribute.addField("Iridescence Strength", "number", 0.0, { min: 0, max: 1 });
        iridescenceAttribute.addField("Iridescence IOR", "number", 1.0, { min: 0 });
        iridescenceAttribute.addField("Iridescence Thickness Min", "number", 50.0, { min: 0 });
        iridescenceAttribute.addField("Iridescence Thickness Max", "number", 400.0, { min: 0 });
        iridescenceAttribute.addField("Iridescence Map", "texture", null);
        this.attributes.push(iridescenceAttribute);
    }

    static type = "pysicalMaterial";

    updateMaterialProperties() {
        super.updateMaterialProperties();
        this.updateClearCoatMaterialProperties();
        this.updateSheenMaterialProperties();
        this.updateTransmissionMaterialProperties();
        this.updateIridescenceMaterialProperties();
    }

    updateClearCoatMaterialProperties() {
        this.material.clearcoat = this.getAttr("Clear Coat", "Clear Coat Strength");
        this.material.clearcoatRoughness = this.getAttr("Clear Coat", "Clear Coat Roughness");
        this.material.clearcoatMap = this.getAttr("Clear Coat", "Clear Coat Map")?.texture ?? null;
        this.material.clearcoatRoughnessMap = this.getAttr("Clear Coat", "Clear Coat Roughness Map")?.texture ?? null;
        this.material.clearcoatNormalMap = this.getAttr("Clear Coat", "Clear Coat Normal Map")?.texture ?? null;
        this.material.needsUpdate = true;
    }
    
    updateSheenMaterialProperties() {
        this.material.sheen = this.getAttr("Sheen", "Sheen Strength");
        this.material.sheenColor.set(this.getAttr("Sheen", "Sheen Color"));
        this.material.sheenRoughness = this.getAttr("Sheen", "Sheen Roughness");
        this.material.sheenColorMap = this.getAttr("Sheen", "Sheen Color Map")?.texture ?? null;
        this.material.sheenRoughnessMap = this.getAttr("Sheen", "Sheen Roughness Map")?.texture ?? null;
        this.material.needsUpdate = true;
    }

    updateTransmissionMaterialProperties() {
        this.material.transmission = this.getAttr("Transmission", "Transmission");
        this.material.transmissionMap = this.getAttr("Transmission", "Transmission Map")?.texture ?? null;
        this.material.thickness = this.getAttr("Transmission", "Thickness");
        this.material.thicknessMap = this.getAttr("Transmission", "Thickness Map")?.texture ?? null;
        this.material.attenuationColor.set(this.getAttr("Transmission", "Attenuation Color"));
        this.material.attenuationDistance = this.getAttr("Transmission", "Attenuation Distance");
        this.material.ior = this.getAttr("Transmission", "Ior");
        this.material.needsUpdate = true;
    }

    updateIridescenceMaterialProperties() {
        this.material.iridescence = this.getAttr("Iridescence", "Iridescence Strength");
        this.material.iridescenceIOR = this.getAttr("Iridescence", "Iridescence IOR");
        this.material.iridescenceThicknessRange = [this.getAttr("Iridescence", "Iridescence Thickness Min"), this.getAttr("Iridescence", "Iridescence Thickness Max")];
        this.material.iridescenceMap = this.getAttr("Iridescence", "Iridescence Map")?.texture ?? null;
        this.material.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);

        if (attribute == "Clear Coat") this.updateClearCoatMaterialProperties();
        if (attribute == "Sheen") this.updateSheenMaterialProperties();
        if (attribute == "Transmission") this.updateTransmissionMaterialProperties();
        if (attribute == "Iridescence") this.updateIridescenceMaterialProperties();
    }
}