import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "#three";

export class CylinderMeshComponent extends MeshComponent {
    constructor(name = "Cylinder Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.CylinderGeometry(1, 1, 2, 8, 1, false));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}