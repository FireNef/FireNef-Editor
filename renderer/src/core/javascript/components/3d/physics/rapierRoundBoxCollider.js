import { Attribute } from "../../attributes.js";
import { RapierCollider } from "./rapierCollider.js";
import * as RAPIER from "rapier";

export class RapierRoundBoxCollider extends RapierCollider {
    constructor(name = "Rapier Round Box Collider") {
        super(name);

        const shapeAttribute = new Attribute("Shape");
        shapeAttribute.addField("Size", "vec3", { x: 1, y: 1, z: 1 });
        shapeAttribute.addField("Round Radius", "number", 1.0, { min: 0 });
        this.attributes.push(shapeAttribute);
    }

    static type = "rapierRoundBoxCollider";

    updateShape() {
        const size = this.getAttr("Shape", "Size");
        const roundRadius = this.getAttr("Shape", "Round Radius");

        const hx = Math.max(0.0001, size.x / 2);
        const hy = Math.max(0.0001, size.y / 2);
        const hz = Math.max(0.0001, size.z / 2);

        const rr = Math.min(roundRadius, hx, hy, hz);

        this.desc = RAPIER.ColliderDesc.roundCuboid(hx - rr, hy - rr, hz - rr, rr);
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