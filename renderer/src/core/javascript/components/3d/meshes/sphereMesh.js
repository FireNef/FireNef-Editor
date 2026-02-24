import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class SphereMeshComponent extends MeshComponent {
    constructor(name = "Sphere Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.SphereGeometry(1, 32, 32));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}