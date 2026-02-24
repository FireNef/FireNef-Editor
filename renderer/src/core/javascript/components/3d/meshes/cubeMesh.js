import { MeshComponent } from "../mesh.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class CubeMeshComponent extends MeshComponent {
    constructor(name = "Cube Mesh") {
        super(name);
        
        this.setAttributeFieldValue(1, 0, new THREE.BoxGeometry(1, 1, 1));
        this.setAttributeFieldValue(1, 1, new StandardMaterialComponent());
    }
}