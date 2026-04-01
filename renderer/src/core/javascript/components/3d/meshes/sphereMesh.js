import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class SphereMeshComponent extends MeshComponent {
    constructor(name = "Sphere Mesh") {
        super(name);

        const sphereAttribute = new Attribute("Sphere");
        sphereAttribute.addField("Radius", "number", 1, { min: 0 });
        sphereAttribute.addField("Width Segments", "number", 32, { min: 3 });
        sphereAttribute.addField("Height Segments", "number", 32, { min: 3 });
        this.attributes.push(sphereAttribute);

        this.setAttr("Mesh", "Geometry", new THREE.SphereGeometry(1, 32, 32));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "sphereMesh";

    updateSphereGemetry() {
        const Radius = this.getAttr("Sphere", "Radius");
        const WidthSegments = this.getAttr("Sphere", "Width Segments");
        const HeightSegments = this.getAttr("Sphere", "Height Segments");
        this.setAttr("Mesh", "Geometry", new THREE.SphereGeometry(Radius, WidthSegments, HeightSegments));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Sphere") this.updateSphereGemetry();
    }
}