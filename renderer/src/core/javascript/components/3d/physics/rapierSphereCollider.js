import { Attribute } from "../../attributes.js";
import { RapierCollider } from "./rapierCollider.js";
import * as RAPIER from "rapier";

export class RapierSphereCollider extends RapierCollider {
    constructor(name = "Rapier Sphere Collider") {
        super(name);

        const shapeAttribute = new Attribute("Shape");
        shapeAttribute.addField("Radius", "number", 1.0, { min: 0 });
        this.attributes.push(shapeAttribute);
    }

    static type = "rapierSphereCollider";

    updateShape() {
        const radius = this.getAttr("Shape", "Radius");
        this.desc = RAPIER.ColliderDesc.ball(radius);
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