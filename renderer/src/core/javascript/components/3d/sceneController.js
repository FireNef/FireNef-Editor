import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import { SceneComponent } from "./scene.js";
import { Renderer3D } from "../renderer3D.js";

export class SceneController extends Component {
    constructor(name = "Scene Controller") {
        super(name);

        this.renderer = null;

        const sceneControllerAttribute = new Attribute("Scene Controller");
        sceneControllerAttribute.addField("Selected Scene", "number", 0, { type: "child" });
        sceneControllerAttribute.addField("Disable Inactive Scenes", "boolean", false);
        
        this.attributes.push(sceneControllerAttribute);
    }

    static group = "General 3D";

    static baseType = "sceneController";
    static type = "sceneController";

    start() {
        this.renderer = this.getFirstParentOfType(Renderer3D);
        if (!this.renderer) this.enable = false;
    }

    update() {
        if (!this.renderer) return;
        const index = this.getAttributeFieldValue(0, 0);
        const scene = this.children[index];

        if (!(scene instanceof SceneComponent)) return;

        this.renderer.setScene(scene ? scene : null);
        this.renderer.setCamera(scene?.currentCamera ? scene?.currentCamera : null);
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
       
        for (let i = 0; i < this.children.length; i++) {
            if (this.getAttributeFieldValue(0, 0) == i || !this.getAttributeFieldValue(1, 0)) this.children[i].enable = true;
            else this.children[i].enable = false;
        }
    }
}