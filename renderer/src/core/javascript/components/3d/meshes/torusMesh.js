import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import * as THREE from "three";

export class TorusMeshComponent extends MeshComponent {
    constructor(name = "Torus Mesh") {
        super(name);

        const torusAttribute = new Attribute("Torus");
        torusAttribute.addField("Radius", "number", 1, { min: 0 });
        torusAttribute.addField("Tube", "number", 0.4, { min: 0 });
        torusAttribute.addField("Radial Segments", "number", 12, { min: 3 });
        torusAttribute.addField("Tubular Segments", "number", 48, { min: 3 });
        this.attributes.push(torusAttribute);

        this.setAttr("Mesh", "Geometry", new THREE.TorusGeometry(1, 0.4, 12, 48));
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "torusMesh";

    updateTorusGemetry() {
        const radius = this.getAttributeValue("Radius");
        const tube = this.getAttributeValue("Tube");
        const radialSegments = this.getAttributeValue("Radial Segments");
        const tubularSegments = this.getAttributeValue("Tubular Segments");
        this.setAttr("Mesh", "Geometry", new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments));
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Torus") this.updateTorusGemetry();
    }
}