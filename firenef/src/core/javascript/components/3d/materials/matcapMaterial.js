import { StandardMaterialComponent } from "./standardMaterial.js";
import * as THREE from "#three";

export class MapcapMaterialComponent extends StandardMaterialComponent {
    constructor(name = "Mapcap Material") {
        super(name, false, true, true, true, false, false, false, true);

        this.material = new THREE.MeshMatcapMaterial();
    }
}