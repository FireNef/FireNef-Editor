import { StandardMaterialComponent } from "./standardMaterial.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "three";

export class ToonMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Toon Material") {
        super(name, true, true, true, true, true, true, true, true);

        this.material = new THREE.MeshToonMaterial();

        const surfaceAttribute = new Attribute("Surface");
        surfaceAttribute.addField("Gradient Map", "texture", null);
        this.attributes[1] = surfaceAttribute;
    }

    static type = "toonMaterial";

    updateSurfaceMaterialProperties(attribute = 1) {
        this.material.gradientMap = this.getAttributeFieldValue(attribute, 0)?.texture;
        this.material.needsUpdate = true;
    }
}