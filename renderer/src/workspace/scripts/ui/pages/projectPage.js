import * as FIRENEF from "firenef";

export default class ProjectPageScript extends FIRENEF.Script {
    constructor(name = "Project Page Script") {
        super(name);
    }

    static type = "projectPageScript"
}