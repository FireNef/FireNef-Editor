import { StandardMaterialComponent } from "./standardMaterial.js";
import * as THREE from "#three";

export class BasicMaterialComponent extends StandardMaterialComponent {
    constructor(name = "BasicMaterial") {
        super(name, false, false, true, false, false, false, false, false);

        this.material = new THREE.MeshBasicMaterial();
    }
}