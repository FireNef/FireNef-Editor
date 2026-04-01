import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class RingMeshComponent extends MeshComponent {
    constructor(name = "Ring Mesh") {
        super(name);

        const ringAttribute = new Attribute("Ring");
        ringAttribute.addField("Inner Radius", "number", 1, { min: 0 });
        ringAttribute.addField("Outer Radius", "number", 2, { min: 0 });
        ringAttribute.addField("Segments", "number", 32, { min: 3 });
        this.attributes.push(ringAttribute);

        this.setAttr("Mesh", "Geometry", new THREE.RingGeometry(1, 2, 32));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "ringMesh";

    updateRingGemetry() {
        const innerRadius = this.getAttr("Ring", "Inner Radius");
        const outerRadius = this.getAttr("Ring", "Outer Radius");
        const segments = this.getAttr("Ring", "Segments");
        this.setAttr("Mesh", "Geometry", new THREE.RingGeometry(innerRadius, outerRadius, segments));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Ring") this.updateRingGemetry();
    }
}