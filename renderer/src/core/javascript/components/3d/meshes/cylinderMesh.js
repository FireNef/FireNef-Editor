import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import { GeometryComponent } from "../geometry.js";
import * as THREE from "three";

export class CylinderMeshComponent extends MeshComponent {
    constructor(name = "Cylinder Mesh") {
        super(name);

        const cylinderAttribute = new Attribute("Cylinder");
        cylinderAttribute.addField("Radius Top", "number", 1, { min: 0 });
        cylinderAttribute.addField("Radius Bottom", "number", 1, { min: 0 });
        cylinderAttribute.addField("Height", "number", 2, { min: 0 });
        cylinderAttribute.addField("Radial Segments", "number", 32, { min: 3 });
        cylinderAttribute.addField("Height Segments", "number", 1, { min: 1 });
        cylinderAttribute.addField("Open Ended", "boolean", false);
        this.attributes.push(cylinderAttribute);

        const geometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1, false);

        const geometryComponent = new GeometryComponent();
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.setAttr("Mesh", "Geometry", geometryComponent);
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "cylinderMesh";

    updateCylinderGemetry() {
        const radiusTop = this.getAttr("Cylinder", "Radius Top");
        const radiusBottom = this.getAttr("Cylinder", "Radius Bottom");
        const height = this.getAttr("Cylinder", "Height");
        const radialSegments = this.getAttr("Cylinder", "Radial Segments");
        const heightSegments = this.getAttr("Cylinder", "Height Segments");
        const openEnded = this.getAttr("Cylinder", "Open Ended");

        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);

        const geometryComponent = this.getAttr("Mesh", "Geometry");
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.updateMesh();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Cylinder") this.updateCylinderGemetry();
    }
}