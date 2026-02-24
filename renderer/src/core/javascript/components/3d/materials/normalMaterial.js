import { StandardMaterialComponent } from "./standardMaterial.js";
import * as THREE from "three";

export class NormalMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Normal Material") {
        super(name, false, true, false, false, false, false, false, false);

        this.material = new THREE.MeshNormalMaterial();
    }
}