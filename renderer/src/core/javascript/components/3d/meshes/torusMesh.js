import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class TorusMeshComponent extends MeshComponent {
    constructor(name = "Torus Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.TorusGeometry(1, 0.4, 16, 100));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}