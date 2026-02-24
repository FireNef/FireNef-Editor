import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class CircleMeshComponent extends MeshComponent {
    constructor(name = "Circle Mesh") {
        super(name);

        this.setAttributeFieldValue(1, 0, new THREE.CircleGeometry(1, 32));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}