import { Component } from "./component.js";

export class Script extends Component {
    constructor(name = "Script") {
        super(name);
    }

    static icon = ["script", ...super.icon];
    static group = "Scripts";
    static {
        this.hideInGroup = true;
    }
}