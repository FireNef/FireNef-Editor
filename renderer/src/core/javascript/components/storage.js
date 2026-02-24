import { Component } from "./component.js";

export class StorageComponent extends Component {
    constructor(name = "Storage") {
        super(name);
    }

    getChildrenRunOrder() {
        return [];
    }
}