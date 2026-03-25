import {  Component } from "./component.js";

export class GroupComponent extends Component {
    constructor(name = "Group") {
        super(name);
    }

    static baseType = "group";
    static type = "group";

    static icon = ["group", ...super.icon];
}