import { Attribute } from "../../attributes.js";
import { RapierCollider } from "./rapierCollider.js";
import * as RAPIER from "rapier";

export class RapierConeCollider extends RapierCollider {
    constructor(name = "Rapier Cone Collider") {
        super(name);

        const shapeAttribute = new Attribute("Shape");
        shapeAttribute.addField("Height", "number", 1.0, { min: 0 });
        shapeAttribute.addField("Radius", "number", 1.0, { min: 0 });
        this.attributes.push(shapeAttribute);
    }

    static type = "rapierConeCollider";

    updateShape() {
        const height = this.getAttr("Shape", "Height");
        const radius = this.getAttr("Shape", "Radius");
        this.desc = RAPIER.ColliderDesc.cone(height / 2, radius);
    }

    updateDesc() {
        this.updateShape();
        super.updateDesc();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Shape") this.rebuildCollider();
    }
}