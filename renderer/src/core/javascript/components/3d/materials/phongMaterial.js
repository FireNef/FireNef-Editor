import { StandardMaterialComponent } from "./standardMaterial.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "three";

export class PhongMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Phong Material") {
        super(name, true, true, true, true, true, true, true, true);

        this.material = new THREE.MeshPhongMaterial();

        const surfaceAttribute = new Attribute("Surface");
        surfaceAttribute.addField("Specular Color", "color", "#ffffff");
        surfaceAttribute.addField("Shininess", "number", 30.0, { min: 0 });
        surfaceAttribute.addField("Specular Map", "texture", null);
        this.attributes[1] = surfaceAttribute;
    }

    static type = "phongMaterial";

    updateSurfaceMaterialProperties(attribute = 1) {
        this.material.specular.set(this.getAttributeFieldValue(attribute, 0));
        this.material.shininess = this.getAttributeFieldValue(attribute, 1);
        this.material.specularMap = this.getAttributeFieldValue(attribute, 2);
        this.material.needsUpdate = true;
    }
}