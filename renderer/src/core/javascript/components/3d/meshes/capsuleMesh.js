import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class CapsuleMeshComponent extends MeshComponent {
    constructor(name = "Capsule Mesh") {
        super(name);

        const capsuleAttribute = new Attribute("Capsule");
        capsuleAttribute.addField("Radius", "number", 1, { min: 0 });
        capsuleAttribute.addField("Height", "number", 4, { min: 0 });
        capsuleAttribute.addField("Cap Segments", "number", 4, { min: 2 });
        capsuleAttribute.addField("Radial Segments", "number", 8, { min: 3 });
        capsuleAttribute.addField("Height Segments", "number", 1, { min: 1 });
        this.attributes.push(capsuleAttribute);

        this.setAttre("Mesh", "Geometry", new THREE.CapsuleGeometry(1, 2, 4, 8, 1));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "capsuleMesh";

    updateCapsuleGemetry() {
        const radius = this.getAttr("Capsule", "Radius");
        const fullHeight = this.getAttr("Capsule", "Height");
        const capSegments = this.getAttr("Capsule", "Cap Segments");
        const radialSegments = this.getAttr("Capsule", "Radial Segments");
        const heightSegments = this.getAttr("Capsule", "Height Segments");

        const height = fullHeight - radius * 2;

        this.setAttr("Mesh", "Geometry", new THREE.CapsuleGeometry(radius, height, capSegments, radialSegments, heightSegments));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Capsule") this.updateCapsuleGemetry();
    }
}