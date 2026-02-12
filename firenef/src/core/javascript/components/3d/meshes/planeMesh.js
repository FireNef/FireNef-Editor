import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "#three";

export class PlaneMeshComponent extends MeshComponent {
    constructor(name = "Plane Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.PlaneGeometry(1, 1, 1, 1));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}