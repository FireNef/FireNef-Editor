import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "#three";

export class CapsuleMeshComponent extends MeshComponent {
    constructor(name = "Capsule Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.CapsuleGeometry(1, 2, 4, 8));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}