import { Object3d } from "../../object3d.js";
import { Attribute } from "../../../attributes.js";
import * as THREE from "three";

export class OBJLoader extends Object3d {
    constructor(name = "OBJ Loader") {
        super(name);

        const meshAttribute = new Attribute("Mesh");
        meshAttribute.addField("OBJ File", "path", null);
        meshAttribute.addField("MTL File", "path", null);
        meshAttribute.addField("Cast Shadows", "boolean", true);
        meshAttribute.addField("Receive Shadows", "boolean", true);
        this.attributes.push(meshAttribute);

        this.object3D = new THREE.Object3D();
        this.object3D.name = name;

        this.loaded = false;
    }

    static baseType = "mesh"
    static type = "objLoader"

    static group = "3D Mesh Loaders";

    static objLoader = new THREE.OBJLoader();
    static mtlLoader = new THREE.MTLLoader();

    updateMesh(forceUpdate = false) {
        if (!forceUpdate && this.loaded) return;
        if (!this.getAttr("Mesh", "OBJ File")) return;

        if (this.getAttr("Mesh", "MTL File")) {
            const mtl = OBJLoader.mtlLoader.parse(this.getAttr("Mesh", "MTL File"), "./");
            mtl.preload();
            OBJLoader.objLoader.setMaterials(mtl);
        } else {
            OBJLoader.objLoader.setMaterials(null);
        }

        const obj = OBJLoader.objLoader.parse(this.getAttr("Mesh", "OBJ File"));

        this.object3D = obj;

        this.updateShadow();

        this.loaded = true;
    }

    updateAllProperties() {
        this.updateMesh(true);
    }

    updateShadow() {
        this.object3D.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = this.getAttr("Mesh", "Cast Shadows");
                child.receiveShadow = this.getAttr("Mesh", "Receive Shadows");
            }
        })
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Mesh") {
            if (field == "OBJ File") this.updateMesh(true);
            if (field == "MTL File") this.updateMesh(true);
            if (field == "Cast Shadows") this.updateShadow();
            if (field == "Receive Shadows") this.updateShadow();
        }
    }
}