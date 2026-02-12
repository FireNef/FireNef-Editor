import { StandardMaterialComponent } from "./standardMaterial.js";
import * as THREE from "#three";

export class PhongMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Phong Material") {
        super(name, true, true, true, true, true, true, true, true);

        this.material = new THREE.MeshPhongMaterial();

        const surfaceAttribute = new Attribute("Surface");
        surfaceAttribute.addField("Specular Color", "specular", "#FFFFFF");
        surfaceAttribute.addField("Shininess", "shininess", 30.0);
        surfaceAttribute.addField("Specular Map", "specularMap", null);
        this.attributes[1] = surfaceAttribute;
    }

    updateSurfaceMaterialProperties(attribute = 1) {
        this.material.specular = new THREE.Color(this.getAttributeFieldValue(attribute, 0));
        this.material.shininess = this.getAttributeFieldValue(attribute, 1);
        this.material.specularMap = this.getAttributeFieldValue(attribute, 2);
        this.material.needsUpdate = true;
    }
}