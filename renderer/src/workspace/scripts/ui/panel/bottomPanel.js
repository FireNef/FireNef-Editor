import * as FIRENEF from "firenef";

export default class BottomPanelScript extends FIRENEF.Script {
    constructor(name = "Bottom Panel Script") {
        super(name);
    }

    static type = "bottomPanelScript";
}