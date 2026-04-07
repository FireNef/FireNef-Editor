import { MeshComponent } from "../mesh.js";
import { Attribute } from "../../attributes.js";
import { StandardMaterialComponent } from "../materials/standardMaterial.js";
import { GeometryComponent } from "../geometry.js";
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

        const geometry = new THREE.TorusGeometry(1, 0.4, 12, 48);

        const geometryComponent = new GeometryComponent();
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.setAttr("Mesh", "Geometry", geometryComponent);
        this.setAttr("Mesh", "Material", new StandardMaterialComponent());
    }

    static type = "torusMesh";

    updateTorusGemetry() {
        const radius = this.getAttr("Radius");
        const tube = this.getAttr("Tube");
        const radialSegments = this.getAttr("Radial Segments");
        const tubularSegments = this.getAttr("Tubular Segments");

        const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);

        const geometryComponent = this.getAttr("Mesh", "Geometry");
        geometryComponent.setAttr("Geometry", "Geometry", geometry);

        this.updateMesh();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Torus") this.updateTorusGemetry();
    }
}