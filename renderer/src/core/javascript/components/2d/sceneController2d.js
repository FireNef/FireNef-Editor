import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import { Renderer2D } from "../renderer2D.js";
import { Scene2DComponent } from "./scene2d.js";

export class SceneController2D extends Component {
    constructor(name = "Scene Controller 2D") {
        super(name);

        const sceneControllerAttribute = new Attribute("Scene Controller");
        sceneControllerAttribute.addField("Selected Scene", "number", 0, { type: "child" });
        sceneControllerAttribute.addField("Disable Inactive Scenes", "boolean", false);
        
        this.attributes.push(sceneControllerAttribute);

        this.renderer = null;
    }

    static group = "General 2D";

    static baseType = "sceneController2D";
    static type = "sceneController2D";

    start() {
        this.renderer = this.getFirstParentOfType(Renderer2D);
        if (!this.renderer) this.enable = false;
    }

    update() {
        if (!this.renderer) return;
        const index = this.getAttr("Scene Controller", "Selected Scene");
        const scene = this.children[index];

        if (!(scene instanceof Scene2DComponent)) return;

        this.renderer.setScene(scene ? scene : null);
        this.renderer.setCamera(scene?.currentCamera ? scene?.currentCamera : null);
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        
        for (let i = 0; i < this.children.length; i++) {
            if (this.getAttr("Scene Controller", "Selected Scene") == i || !this.getAttr("Scene Controller", "Disable Inactive Scenes")) this.children[i].enable = true;
            else this.children[i].enable = false;
        }
    }
}