import { Attribute } from "../../attributes.js";
import { RapierCollider } from "./rapierCollider.js";
import * as RAPIER from "rapier";

export class RapierCapsuleCollider extends RapierCollider {
    constructor(name = "Rapier Capsule Collider") {
        super(name);

        const shapeAttribute = new Attribute("Shape");
        shapeAttribute.addField("Height", "number", 1.0, { min: 0 });
        shapeAttribute.addField("Radius", "number", 1.0, { min: 0 });
        this.attributes.push(shapeAttribute);
    }

    static type = "rapierCapsuleCollider";

    updateShape() {
        const height = this.getAttr("Shape", "Height");
        const radius = this.getAttr("Shape", "Radius");
        this.desc = RAPIER.ColliderDesc.capsule(height / 2 - radius, radius);
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