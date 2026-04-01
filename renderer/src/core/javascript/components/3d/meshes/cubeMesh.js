import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class CubeMeshComponent extends MeshComponent {
    constructor(name = "Cube Mesh") {
        super(name);

        const cubeAttribute = new Attribute("Cube");
        cubeAttribute.addField("Width", "number", 1, { min: 0 });
        cubeAttribute.addField("Height", "number", 1, { min: 0 });
        cubeAttribute.addField("Depth", "number", 1, { min: 0 });
        cubeAttribute.addField("Width Segments", "number", 1, { min: 1 });
        cubeAttribute.addField("Height Segments", "number", 1, { min: 1 });
        cubeAttribute.addField("Depth Segments", "number", 1, { min: 1 });
        this.attributes.push(cubeAttribute);
        
        this.setAttr("Mesh", "Geometry", new THREE.BoxGeometry(1, 1, 1, 1, 1, 1));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "cubeMesh";

    updateCubeGemetry() {
        const width = this.getAttributeFieldValue("Width", "number");
        const height = this.getAttributeFieldValue("Height", "number");
        const depth = this.getAttributeFieldValue("Depth", "number");
        const widthSegments = this.getAttributeFieldValue("Width Segments", "number");
        const heightSegments = this.getAttributeFieldValue("Height Segments", "number");
        const depthSegments = this.getAttributeFieldValue("Depth Segments", "number");
        this.setAttr("Mesh", "Geometry", new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Cube") this.updateCubeGemetry();
    }
}