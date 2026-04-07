import { Component } from "../component.js";
import { Attribute } from "../attributes.js";

export class GeometryComponent extends Component {
    constructor(name = "Geometry") {
        super(name);

        const geometryAttribute = new Attribute("Geometry");
        geometryAttribute.addField("Geometry", "three", null);
        this.attributes.push(geometryAttribute);
        
        this.geometry = null;
    }

    static group = "3D Geometries";
    static {
        this.hideInGroup = true;
    }

    static baseType = "geometry"
    static type = "geometry"

    start() {
        this.updateAllProperties();
    }

    updateAllProperties() {
        this.updateGeometry();
    }

    updateGeometry() {
        this.geometry = this.getAttr("Geometry", "Geometry");
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Geometry") this.updateGeometry();
    }
}