import * as THREE from "three";
import { Object3d } from "./object3d.js";
import { Attribute } from "../attributes.js";
import { TextureComponent } from "./texture.js";

export class MeshComponent extends Object3d {
    constructor(name = "Mesh") {
        super(name);
        const meshAttribute = new Attribute("Mesh");
        meshAttribute.addField("Geometry", "three", null);
        meshAttribute.addField("Material", "three", null);
        this.attributes.push(meshAttribute);

        this.object3D = new THREE.Mesh();
        this.object3D.name = name;
    }

    static group = "3D Meshes";
    static {
        this.hideInGroup = true;
    }

    update() {
        super.update(); // Update transform if allowed
        const geometry = this.getAttributeFieldValue(1, 0);
        const materialComponent = this.getAttributeFieldValue(1, 1);
        this.object3D.geometry = geometry;
        this.object3D.material = materialComponent?.material ?? null;
    }
}