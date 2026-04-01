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

    updateSurfaceMaterialProperties() {
        this.material.gradientMap = this.getAttr("Surface", "Gradient Map")?.texture ?? null;
        this.material.needsUpdate = true;
    }
}