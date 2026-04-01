import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
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

        this.setAttr("Mesh", "Geometry", new THREE.CylinderGeometry(1, 1, 2, 32, 1, false));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "cylinderMesh";

    updateCylinderGemetry() {
        const radiusTop = this.getAttributeFieldValue("Cylinder", "Radius Top");
        const radiusBottom = this.getAttributeFieldValue("Cylinder", "Radius Bottom");
        const height = this.getAttributeFieldValue("Cylinder", "Height");
        const radialSegments = this.getAttributeFieldValue("Cylinder", "Radial Segments");
        const heightSegments = this.getAttributeFieldValue("Cylinder", "Height Segments");
        const openEnded = this.getAttributeFieldValue("Cylinder", "Open Ended");
        this.setAttr("Mesh", "Geometry", new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Cylinder") this.updateCylinderGemetry();
    }
}