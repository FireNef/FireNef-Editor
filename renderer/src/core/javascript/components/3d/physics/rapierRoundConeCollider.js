import { Attribute } from "../../attributes.js";
import { RapierCollider } from "./rapierCollider.js";
import * as RAPIER from "rapier";

export class RapierRoundConeCollider extends RapierCollider {
    constructor(name = "Rapier Round Cone Collider") {
        super(name);

        const shapeAttribute = new Attribute("Shape");
        shapeAttribute.addField("Height", "number", 1.0, { min: 0 });
        shapeAttribute.addField("Radius", "number", 1.0, { min: 0 });
        shapeAttribute.addField("Round Radius", "number", 1.0, { min: 0 });
        this.attributes.push(shapeAttribute);
    }

    static type = "rapierRoundConeCollider";

    updateShape() {
        const height = this.getAttr("Shape", "Height");
        const radius = this.getAttr("Shape", "Radius");
        const roundRadius = this.getAttr("Shape", "Round Radius");
        
        const hh = Math.max(0.0001, height / 2 - roundRadius);
        const r  = Math.max(0.0001, radius - roundRadius);
        const rr = Math.min(roundRadius, hh, r);

        this.desc = RAPIER.ColliderDesc.roundCone(hh, r, rr);
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