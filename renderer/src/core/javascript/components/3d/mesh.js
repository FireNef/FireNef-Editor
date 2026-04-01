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
        if (this.getAttr("Mesh", "Material")) this.getAttr("Mesh", "Material").updateAllProperties();
    }

    updateMesh() {
        this.object3D.geometry = this.getAttr("Mesh", "Geometry");
        this.object3D.material = this.getAttr("Mesh", "Material")?.material ?? null;
        this.object3D.castShadow = this.getAttr("Mesh", "Cast Shadows");
        this.object3D.receiveShadow = this.getAttr("Mesh", "Receive Shadows");
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Mesh") this.updateMesh();
    }
}