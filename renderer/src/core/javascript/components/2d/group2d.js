import { Object2d } from "./object2d.js";

export class Group2d extends Object2d {
    constructor(name = "2D Group") {
        super(name);
    }

    static baseType = "group2D"
    static type = "group2D"

    static icon = ["group2d", ...super.icon];
}