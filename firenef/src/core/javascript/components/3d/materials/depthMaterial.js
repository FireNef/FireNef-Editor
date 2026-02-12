import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "#three";

export class DepthMaterialComponent extends Component {
    constructor(name = "Depth Material") {
        super(name);

        this.material = new THREE.MeshDepthMaterial();

        const wireframeAttribute = new Attribute("Wireframe");
        wireframeAttribute.addField("Wireframe", "boolean", false);
        this.attributes.push(wireframeAttribute);
    }

    static group = "3D Materials";

    updateWireframeMaterialProperties(attribute = 0) {
        this.material.wireframe = this.getAttributeFieldValue(attribute, 0);
        this.material.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        if (attribute == 0) this.updateWireframeMaterialProperties(attribute);
        await super.setAttributeFieldValue(attribute, field, value, type);
    }
}