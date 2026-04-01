import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import * as THREE from "three";

export class DepthMaterialComponent extends Component {
    constructor(name = "Depth Material") {
        super(name);

        this.material = new THREE.MeshDepthMaterial();

        const wireframeAttribute = new Attribute("Wireframe");
        wireframeAttribute.addField("Wireframe", "boolean", false);
        this.attributes.push(wireframeAttribute);
    }

    static group = "3D Materials";

    static baseType = "material";
    static type = "depthMaterial";

    updateAllProperties() {
        this.updateWireframeMaterialProperties();
    }

    updateWireframeMaterialProperties() {
        this.material.wireframe = this.getAttributeFieldValue("Wireframe", "Wireframe");
        this.material.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Wireframe") this.updateWireframeMaterialProperties();
    }
}