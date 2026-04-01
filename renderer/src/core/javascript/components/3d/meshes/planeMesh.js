import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class PlaneMeshComponent extends MeshComponent {
    constructor(name = "Plane Mesh") {
        super(name);

        const planeAttribute = new Attribute("Plane");
        planeAttribute.addField("Width", "number", 1, { min: 0 });
        planeAttribute.addField("Height", "number", 1, { min: 0 });
        planeAttribute.addField("Width Segments", "number", 1, { min: 1 });
        planeAttribute.addField("Height Segments", "number", 1, { min: 1 });
        this.attributes.push(planeAttribute);

        const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        geometry.rotateX(-Math.PI / 2);

        this.setAttr("Mesh", "Geometry", geometry);
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "planeMesh";

    updatePlaneGemetry() {
        const width = this.getAttr("Plane", "Width");
        const height = this.getAttr("Plane", "Height");
        const widthSegments = this.getAttr("Plane", "Width Segments");
        const heightSegments = this.getAttr("Plane", "Height Segments");

        const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        geometry.rotateX(-Math.PI / 2);

        this.setAttr("Mesh", "Geometry", geometry);
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Plane") this.updatePlaneGemetry();
    }
}