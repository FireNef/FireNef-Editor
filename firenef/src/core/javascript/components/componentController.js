import { Component } from "./component.js";

export class ComponentController extends Component {
    constructor(name = "Component Controller") {
        super(name);

        this.updateDepthLimit = 100000;
    }

    static icon = ["componentController", ...super.icon];

    update() {
        if (!this.enable) return;
        this.runChildrenCluster(this.children);
    }

    runChildrenCluster(children, depth = 0) {
        if (children.length === 0) return;
        if (depth >= this.updateDepthLimit) return;

        for (const child of children) {
            if (!child.enable) continue;
            this.runChild(child);
            this.runChildrenCluster(child.getChildrenRunOrder(), depth + 1);
        }
    }

    runChild(child) {
        if (child.start && typeof child.start === "function") {
            if (!child.started) {
                try { child.start(); } catch (e) { console.error(e); }
                child.started = true;
            }
        }
        if (child.update && typeof child.update === "function") {
            try { child.update(); } catch (e) { console.error(e); }
        }
    }
}