import { StandardMaterialComponent } from "./standardMaterial.js";
import * as THREE from "three";

export class LambertMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Lambert Material") {
        super(name, false, true, true, true, true, true, false, true);
        
        this.material = new THREE.MeshLambertMaterial();
    }
}