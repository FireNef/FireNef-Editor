import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class RingMeshComponent extends MeshComponent {
    constructor(name = "Ring Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.RingGeometry(1, 2, 32));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}