import { StandardMaterialComponent } from "./standardMaterial.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "three";

export class PhysicalMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Physical Material", lightingBased = true, detailBased = true, usesEmission = true, usesDisplacement = true, usesLight = true, usesAmbient = true, usesReflection = true, usesOther = true) {
        super(name, lightingBased, detailBased, usesEmission, usesDisplacement, usesLight, usesAmbient, usesReflection, usesOther);

        this.material = new THREE.MeshPhysicalMaterial();

        const clearCoatAttribute = new Attribute("Clear Coat");
        clearCoatAttribute.addField("Clear Coat Strength", "number", 0.0);
        clearCoatAttribute.addField("Clear Coat Roughness", "number", 0.0);
        clearCoatAttribute.addField("Clear Coat Map", "texture", null);
        clearCoatAttribute.addField("Clear Coat Roughness Map", "texture", null);
        clearCoatAttribute.addField("Clear Coat Normal Map", "texture", null);
        this.attributes.push(clearCoatAttribute);

        const sheenAttribute = new Attribute("Sheen");
        sheenAttribute.addField("Sheen Strength", "number", 0.0);
        sheenAttribute.addField("Sheen Color", "color", "#000000");
        sheenAttribute.addField("Sheen Roughness", "number", 0.0);
        sheenAttribute.addField("Sheen Color Map", "texture", null);
        sheenAttribute.addField("Sheen Roughness Map", "texture", null);
        this.attributes.push(sheenAttribute);

        const transmissionAttribute = new Attribute("Transmission");
        transmissionAttribute.addField("Transmission", "number", 0.0);
        transmissionAttribute.addField("Transmission Map", "texture", null);
        transmissionAttribute.addField("Thickness", "number", 0.0);
        transmissionAttribute.addField("Thickness Map", "texture", null);
        transmissionAttribute.addField("Attenuation Color", "color", "#ffffff");
        transmissionAttribute.addField("Attenuation Distance", "number", 0.0);
        transmissionAttribute.addField("Ior", "number", 1.0);
        this.attributes.push(transmissionAttribute);

        const iridescenceAttribute = new Attribute("Iridescence");
        iridescenceAttribute.addField("Iridescence Strength", "number", 0.0);
        iridescenceAttribute.addField("Iridescence IOR", "number", 1.0);
        iridescenceAttribute.addField("Iridescence Thickness Min", "number", 50.0);
        iridescenceAttribute.addField("Iridescence Thickness Max", "number", 400.0);
        iridescenceAttribute.addField("Iridescence Map", "texture", null);
        this.attributes.push(iridescenceAttribute);
    }

    updateClearCoatMaterialProperties(attribute = 9) {
        this.material.clearcoat = this.getAttributeFieldValue(attribute, 0);
        this.material.clearcoatRoughness = this.getAttributeFieldValue(attribute, 1);
        this.material.clearcoatMap = this.getAttributeFieldValue(attribute, 2);
        this.material.clearcoatRoughnessMap = this.getAttributeFieldValue(attribute, 3);
        this.material.clearcoatNormalMap = this.getAttributeFieldValue(attribute, 4);
        this.material.needsUpdate = true;
    }
    
    updateSheenMaterialProperties(attribute = 10) {
        this.material.sheen = this.getAttributeFieldValue(attribute, 0);
        this.material.sheenColor = new THREE.Color(this.getAttributeFieldValue(attribute, 1));
        this.material.sheenRoughness = this.getAttributeFieldValue(attribute, 2);
        this.material.sheenColorMap = this.getAttributeFieldValue(attribute, 3);
        this.material.sheenRoughnessMap = this.getAttributeFieldValue(attribute, 4);
        this.material.needsUpdate = true;
    }

    updateTransmissionMaterialProperties(attribute = 11) {
        this.material.transmission = this.getAttributeFieldValue(attribute, 0);
        this.material.transmissionMap = this.getAttributeFieldValue(attribute, 1);
        this.material.thickness = this.getAttributeFieldValue(attribute, 2);
        this.material.thicknessMap = this.getAttributeFieldValue(attribute, 3);
        this.material.attenuationColor = new THREE.Color(this.getAttributeFieldValue(attribute, 4));
        this.material.attenuationDistance = this.getAttributeFieldValue(attribute, 5);
        this.material.ior = this.getAttributeFieldValue(attribute, 6);
        this.material.needsUpdate = true;
    }

    updateIridescenceMaterialProperties(attribute = 12) {
        this.material.iridescence = this.getAttributeFieldValue(attribute, 0);
        this.material.iridescenceIOR = this.getAttributeFieldValue(attribute, 1);
        this.material.iridescenceThicknessRange = [this.getAttributeFieldValue(attribute, 2), this.getAttributeFieldValue(attribute, 3)];
        this.material.iridescenceMap = this.getAttributeFieldValue(attribute, 4);
        this.material.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);

        if (this.currentAttributeAmount == 1) {
            this.updateClearCoatMaterialProperties(attribute);
            return;
        }
        this.currentAttributeAmount--;
        if (this.currentAttributeAmount == 1) {
            this.updateSheenMaterialProperties(attribute);
            return;
        }
        this.currentAttributeAmount--;
        if (this.currentAttributeAmount == 1) {
            this.updateTransmissionMaterialProperties(attribute);
            return;
        }
        this.currentAttributeAmount--;
        if (this.currentAttributeAmount == 1) {
            this.updateIridescenceMaterialProperties(attribute);
            return;
        }
        this.currentAttributeAmount--;
    }
}