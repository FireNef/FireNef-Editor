import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import { SceneComponent } from "./scene.js";

export class SceneController extends Component {
    constructor(name = "Scene Controller") {
        super(name);

        this.renderer = null;

        const selectedSceneAttribute = new Attribute("Selected Scene");
        selectedSceneAttribute.addField("Scene", "child", 0);
        this.attributes.push(selectedSceneAttribute);
    }

    static group = "General 3D";

    start() {
        this.renderer = this.highestParent.renderer;
    }

    update() {
        const index = this.getAttributeFieldValue(0, 0);
        const scene = this.children[index];

        if (!(scene instanceof SceneComponent)) return;

        this.renderer.setScene(scene);
        this.renderer.setCamera(scene.currentCamera ? scene.currentCamera : null);
    }
}