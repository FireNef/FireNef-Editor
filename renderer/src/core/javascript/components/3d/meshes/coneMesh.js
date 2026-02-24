import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class ConeMeshComponent extends MeshComponent {
    constructor(name = "Cone Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.ConeGeometry(1, 2, 32));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}