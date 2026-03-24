import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import * as THREE from "three";

export class TextureComponent extends Component {
    static loader = new THREE.TextureLoader();

    constructor(name = "Texture") {
        super(name);
        this.texture = null;

        const textureAttribute = new Attribute("Texture");
        textureAttribute.addField("Image", "path", THREE.Texture.DEFAULT_IMAGE, { defaultValue: "THREE.Texture.DEFAULT_IMAGE", fileSelect: "image/*" });
        textureAttribute.addField("Preset", "string", "color", { options: ["color", "normal", "roughness", "metalness", "emissive", "environment", "data"] });
        this.attributes.push(textureAttribute);

        const UVAttribute = new Attribute("UV");
        UVAttribute.addField("Mapping", "three", "auto", { defaultValue: "auto", options: ["auto", "THREE.UVMapping", "THREE.CubeReflectionMapping", "THREE.CubeRefractionMapping", "THREE.EquirectangularReflectionMapping", "THREE.EquirectangularRefractionMapping", "THREE.CubeUVReflectionMapping"] });
        UVAttribute.addField("Wrap S", "three", THREE.ClampToEdgeWrapping, { defaultValue: "THREE.ClampToEdgeWrapping", options: ["THREE.RepeatWrapping", "THREE.ClampToEdgeWrapping", "THREE.MirroredRepeatWrapping"] });
        UVAttribute.addField("Wrap T", "three", THREE.ClampToEdgeWrapping, { defaultValue: "THREE.ClampToEdgeWrapping", options: ["THREE.RepeatWrapping", "THREE.ClampToEdgeWrapping", "THREE.MirroredRepeatWrapping"] });
        UVAttribute.addField("Repeat X", "number", 1, { min: 0 });
        UVAttribute.addField("Repeat Y", "number", 1, { min: 0 });
        UVAttribute.addField("UV Channel", "number", 0, { min: 0, max: 3, step: 1 });
        this.attributes.push(UVAttribute);

        const transformAttribute = new Attribute("Transform");
        transformAttribute.addField("Offset X", "number", 0);
        transformAttribute.addField("Offset Y", "number", 0);
        transformAttribute.addField("Rotation", "number", 0);
        transformAttribute.addField("Center X", "number", 0.5, { min: 0, max: 1 });
        transformAttribute.addField("Center Y", "number", 0.5, { min: 0, max: 1 });
        transformAttribute.addField("Flip Y", "string", "auto", { defaultValue: "auto", options: ["auto", "true", "false"] });
        this.attributes.push(transformAttribute);

        const advancedTextureAttribute = new Attribute("Advanced");
        advancedTextureAttribute.addField("Color Space", "three", "auto", { defaultValue: "auto", options: ["auto", "THREE.NoColorSpace", "THREE.SRGBColorSpace", "THREE.LinearSRGBColorSpace"] });
        advancedTextureAttribute.addField("Mag Filter", "three", THREE.LinearFilter, { defaultValue: "THREE.LinearFilter", options: ["THREE.LinearFilter", "THREE.NearestFilter"] });
        advancedTextureAttribute.addField("Min Filter", "three", THREE.LinearMipMapLinearFilter, { defaultValue: "THREE.LinearMipMapLinearFilter", options: ["THREE.LinearMipMapNearestFilter", "THREE.LinearMipMapLinearFilter"] });
        advancedTextureAttribute.addField("Type", "three", THREE.UnsignedByteType, { defaultValue: "THREE.UnsignedByteType", options: ["THREE.UnsignedByteType", "THREE.UnsignedShortType", "THREE.FloatType"] });
        advancedTextureAttribute.addField("Anisotropy", "number", 1, { min: 1, max: 16, step: 1 });
        advancedTextureAttribute.addField("Generate Mipmaps", "string", "auto", { defaultValue: "auto", options: ["auto", "true", "false"] });
        advancedTextureAttribute.addField("Premultiply Alpha", "boolean", false);
        advancedTextureAttribute.addField("Matrix Auto Update", "boolean", true);

        this.attributes.push(advancedTextureAttribute);
    }

    static group = "General 3D";

    static baseType = "texture"
    static type = "texture"

    async updateTexture() {
        const rawValue = this.attributes[0].fields[0].rawValue;
        this.texture = await TextureComponent.loader.loadAsync(rawValue); 
        this.texture.needsUpdate = true;

        this.updateUV();
        this.updateTransform();
        this.updateAdvanced();
    }

    updateAllProperties() {
        this.updateTexture();
    }

    updateMapping() {
        const mapping = this.getAttributeFieldValue(1, 0);

        if (mapping == "auto") {
            const preset = this.getAttributeFieldValue(0, 1);

            if (preset == "environment") {
                this.texture.mapping = THREE.EquirectangularReflectionMapping;
            } else {
                this.texture.mapping = THREE.UVMapping;
            }
        } else {
            this.texture.mapping = mapping;
        }
        this.texture.needsUpdate = true;
    }

    updateFlipY() {
        const flipY = this.getAttributeFieldValue(2, 5);

        if (flipY == "auto") {
            const preset = this.getAttributeFieldValue(0, 1);

            if (preset == "data") {
                this.texture.flipY = false;
            } else {
                this.texture.flipY = true;
            }
        } else {
            this.texture.flipY = flipY === "true";
        }
        this.texture.needsUpdate = true;
    }

    updateColorSpace() {
        const colorSpace = this.getAttributeFieldValue(3, 0);

        if (colorSpace == "auto") {
            const preset = this.getAttributeFieldValue(0, 1);

            if (preset == "color" || preset == "emissive" || preset == "environment") {
                this.texture.colorSpace = THREE.SRGBColorSpace;
            } else {
                this.texture.colorSpace = THREE.LinearSRGBColorSpace;
            }
        } else {
            this.texture.colorSpace = colorSpace;
        }
        this.texture.needsUpdate = true;
    }

    updateGenerateMipmaps() {
        const generateMipmaps = this.getAttributeFieldValue(3, 5);

        if (generateMipmaps == "auto") {
            const preset = this.getAttributeFieldValue(0, 1);

            if (preset == "data") {
                this.texture.generateMipmaps = false;
            } else {
                this.texture.generateMipmaps = true;
            }
        } else {
            this.texture.generateMipmaps = generateMipmaps === "true";
        }
        this.texture.needsUpdate = true;
    }

    updateUV() {
        this.updateMapping();
        this.texture.wrapS = this.getAttributeFieldValue(1, 1);
        this.texture.wrapT = this.getAttributeFieldValue(1, 2);
        this.texture.repeat.set(this.getAttributeFieldValue(1, 3), this.getAttributeFieldValue(1, 4));
        this.texture.channel = this.getAttributeFieldValue(1, 5);
        this.texture.needsUpdate = true;
    }

    updateTransform() {
        this.texture.offset.set(this.getAttributeFieldValue(2, 0), this.getAttributeFieldValue(2, 1));
        this.texture.rotation = this.getAttributeFieldValue(2, 2);
        this.texture.center.set(this.getAttributeFieldValue(2, 3), this.getAttributeFieldValue(2, 4));
        this.updateFlipY();
        this.texture.needsUpdate = true;
    }

    updateAdvanced() {
        this.updateColorSpace();
        this.texture.magFilter = this.getAttributeFieldValue(3, 1);
        this.texture.minFilter = this.getAttributeFieldValue(3, 2);
        this.texture.type = this.getAttributeFieldValue(3, 3);
        this.texture.anisotropy = this.getAttributeFieldValue(3, 4);
        this.updateGenerateMipmaps();
        this.texture.premultiplyAlpha = this.getAttributeFieldValue(3, 6);
        this.texture.matrixAutoUpdate = this.getAttributeFieldValue(3, 7);
        this.texture.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == 0) {
            if (field == 0) await this.updateTexture();
            if (field == 1) {
                this.updateMapping();
                this.updateFlipY();
                this.updateColorSpace();
                this.updateGenerateMipmaps();
            }
        }
        if (attribute == 1) this.updateUV();
        if (attribute == 2) this.updateTransform();
        if (attribute == 3) this.updateAdvanced();
    }
}
