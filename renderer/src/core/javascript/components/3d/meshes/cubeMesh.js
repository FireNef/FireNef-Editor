import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import { GeometryComponent } from "../geometry.js";
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

        const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
        
        const geometryComponent = new GeometryComponent();
        geometryComponent.setAttr("Geometry", "Geometry", geometry);
        
        this.setAttr("Mesh", "Geometry", geometryComponent);
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "cubeMesh";

    updateCubeGeometry() {
        const width = this.getAttr("Width", "number");
        const height = this.getAttr("Height", "number");
        const depth = this.getAttr("Depth", "number");
        const widthSegments = this.getAttr("Width Segments", "number");
        const heightSegments = this.getAttr("Height Segments", "number");
        const depthSegments = this.getAttr("Depth Segments", "number");

        const geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);

        const geometryComponent = this.getAttr("Mesh", "Geometry");
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.updateMesh();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Cube") this.updateCubeGeometry();
    }
}