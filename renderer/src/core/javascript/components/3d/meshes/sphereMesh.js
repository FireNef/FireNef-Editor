import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import { GeometryComponent } from "../geometry.js";
import * as THREE from "three";

export class SphereMeshComponent extends MeshComponent {
    constructor(name = "Sphere Mesh") {
        super(name);

        const sphereAttribute = new Attribute("Sphere");
        sphereAttribute.addField("Radius", "number", 1, { min: 0 });
        sphereAttribute.addField("Width Segments", "number", 32, { min: 3 });
        sphereAttribute.addField("Height Segments", "number", 32, { min: 3 });
        this.attributes.push(sphereAttribute);

        const geometry = new THREE.SphereGeometry(1, 32, 32);

        const geometryComponent = new GeometryComponent();
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.setAttr("Mesh", "Geometry", geometryComponent);
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "sphereMesh";

    updateSphereGemetry() {
        const Radius = this.getAttr("Sphere", "Radius");
        const WidthSegments = this.getAttr("Sphere", "Width Segments");
        const HeightSegments = this.getAttr("Sphere", "Height Segments");

        const geometry = new THREE.SphereGeometry(Radius, WidthSegments, HeightSegments);

        const geometryComponent = this.getAttr("Mesh", "Geometry");
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.updateMesh();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Sphere") this.updateSphereGemetry();
    }
}