import * as THREE from "three";
import { Object3d } from "./object3d.js";
import { Attribute } from "../attributes.js";
import { TextureComponent } from "./texture.js";

export class MeshComponent extends Object3d {
    constructor(name = "Mesh") {
        super(name);
        const meshAttribute = new Attribute("Mesh");
        meshAttribute.addField("Geometry", "three", null, { type: "component" });
        meshAttribute.addField("Material", "three", null, { type: "component" });
        meshAttribute.addField("Cast Shadows", "boolean", true);
        meshAttribute.addField("Receive Shadows", "boolean", true);
        this.attributes.push(meshAttribute);

        this.object3D = new THREE.Mesh();
        this.object3D.name = name;
    }

    static group = "3D Meshes";
    static {
        this.hideInGroup = true;
    }

    static baseType = "mesh"
    static type = "mesh"

    start() {
        super.start();
        this.updateAllProperties();
    }

    updateAllProperties() {
        this.updateMesh();
        if (this.getAttributeFieldValue(1, 1)) this.getAttributeFieldValue(1, 1).updateAllProperties();
    }

    updateMesh() {
        this.object3D.geometry = this.getAttributeFieldValue(1, 0);
        this.object3D.material = this.getAttributeFieldValue(1, 1)?.material ?? null;
        this.object3D.castShadow = this.getAttributeFieldValue(1, 2);
        this.object3D.receiveShadow = this.getAttributeFieldValue(1, 3);
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == 1) this.updateMesh();
    }
}