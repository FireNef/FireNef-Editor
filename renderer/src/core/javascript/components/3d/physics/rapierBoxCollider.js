import { Attribute } from "../../attributes.js";
import { RapierCollider } from "./rapierCollider.js";
import * as RAPIER from "rapier";

export class RapierBoxCollider extends RapierCollider {
    constructor(name = "Rapier Box Collider") {
        super(name);

        const shapeAttribute = new Attribute("Shape");
        shapeAttribute.addField("Size", "vec3", { x: 1, y: 1, z: 1 });
        this.attributes.push(shapeAttribute);
    }

    static type = "rapierBoxCollider";

    updateShape() {
        const size = this.getAttr("Shape", "Size");

        const hx = Math.max(0.0001, size.x / 2);
        const hy = Math.max(0.0001, size.y / 2);
        const hz = Math.max(0.0001, size.z / 2);

        this.desc = RAPIER.ColliderDesc.cuboid(hx, hy, hz);
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