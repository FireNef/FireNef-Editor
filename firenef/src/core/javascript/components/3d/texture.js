import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import * as THREE from "#three";

export class TextureComponent extends Component {
    static loader = new THREE.TextureLoader();

    constructor(name = "Texture") {
        super(name);
        this.texture = new THREE.Texture();
        this.isEnvMap = false; // mark if this is used as an environment

        const textureAttribute = new Attribute("Texture");
        textureAttribute.addField("Image", "image", THREE.Texture.DEFAULT_IMAGE);
        textureAttribute.addField("Mapping", "three", THREE.Texture.DEFAULT_MAPPING);
        textureAttribute.addField("Color Space", "colorSpace", THREE.NoColorSpace);
        textureAttribute.addField("Is Environment", "boolean", false); // new flag
        this.attributes.push(textureAttribute);
    }

    static group = "General 3D";

    async setTexture(value, type) {
        if (type === "file") {
            const tex = await TextureComponent.loader.loadAsync(value);
            this.texture = tex;
        } else {
            this.texture = value;
        }
    }

    setMapping(mapping) {
        this.texture.mapping = mapping;
        this.texture.needsUpdate = true;
    }

    setColorSpace(colorSpace) {
        this.texture.colorSpace = colorSpace;
        this.texture.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        if (attribute == 0) {
            if (field == 0) await this.setTexture(value, type);
            if (field == 1) this.setMapping(value);
            if (field == 2) this.setColorSpace(value);
            if (field == 3) this.isEnvMap = value; // track environment usage
        }

        await super.setAttributeFieldValue(attribute, field, value, type);
    }
}
