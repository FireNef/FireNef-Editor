import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import * as RAPIER from "rapier";

export class RapierController extends Component {
    constructor(name = "Rapier Controller") {
        super(name);

        const rapierControllerAttribute = new Attribute("Rapier Controller");
        rapierControllerAttribute.addField("Gravity", "vec3", { x: 0.0, y: -9.81, z: 0.0 });
        this.attributes.push(rapierControllerAttribute);

        this.initialized = false;

        this.world = null;
    }

    static baseType = "rapierController";
    static type = "rapierController";

    static group = "3D Physics";

    static icon = ["object3d", ...super.icon];

    start() {
        (async () => {
            await RAPIER.init();

            this.world = new RAPIER.World(this.getAttributeFieldValue(0, 0));
            this.initialized = true;
        })();
    }

    update() {
        if (!this.initialized) return;
        this.world.step();
    }

    getChildrenRunOrder() {
        if (!this.initialized) return [];
        return this.children;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (!this.initialized) return;
        if (attribute == 0) {
            if (field == 0) this.world.gravity = this.getAttributeFieldValue(0, 0);
        }
    }
}