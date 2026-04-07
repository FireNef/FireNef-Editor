import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import { GeometryComponent } from "../geometry.js";
import * as THREE from "three";

export class ConeMeshComponent extends MeshComponent {
    constructor(name = "Cone Mesh") {
        super(name);

        const coneAttribute = new Attribute("Cone");
        coneAttribute.addField("Radius", "number", 1, { min: 0 });
        coneAttribute.addField("Height", "number", 2, { min: 0 });
        coneAttribute.addField("Radial Segments", "number", 32, { min: 3 });
        coneAttribute.addField("Height Segments", "number", 1, { min: 1 });
        coneAttribute.addField("Open Ended", "boolean", false);
        this.attributes.push(coneAttribute);

        const geometry = new THREE.ConeGeometry(1, 2, 32, 1, false);

        const geometryComponent = new GeometryComponent();
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.setAttr("Mesh", "Geometry", geometryComponent);
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "coneMesh";

    updateConeGemetry() {
        const radius = this.getAttr("Cone", "Radius");
        const height = this.getAttr("Cone", "Height");
        const radialSegments = this.getAttr("Cone", "Radial Segments");
        const heightSegments = this.getAttr("Cone", "Height Segments");
        const openEnded = this.getAttr("Cone", "Open Ended");

        const geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, openEnded);

        const geometryComponent = this.getAttr("Mesh", "Geometry");
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.updateMesh();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute.name == "Cone") this.updateConeGemetry();
    }
}