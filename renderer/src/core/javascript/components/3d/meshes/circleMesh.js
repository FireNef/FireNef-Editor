import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class CircleMeshComponent extends MeshComponent {
    constructor(name = "Circle Mesh") {
        super(name);

        const circleAttribute = new Attribute("Circle");
        circleAttribute.addField("Radius", "number", 1, { min: 0 });
        circleAttribute.addField("Segments", "number", 32, { min: 3 });
        this.attributes.push(circleAttribute);

        this.setAttr("Mesh", "Geometry", new THREE.CircleGeometry(1, 32));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "circleMesh";

    updateCircleGemetry() {
        const radius = this.getAttr("Circle", "Radius");
        const segments = this.getAttr("Circle", "Segments");
        this.setAttr("Mesh", "Geometry", new THREE.CircleGeometry(radius, segments));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Circle") this.updateCircleGemetry();
    }
}