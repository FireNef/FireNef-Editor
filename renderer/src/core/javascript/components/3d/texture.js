import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import { Renderer3D } from "../renderer3D.js";
import * as THREE from "three";

export class TextureComponent extends Component {
    static ktx2Loader = null;

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
        advancedTextureAttribute.addField("Min Filter", "three", THREE.LinearMipmapLinearFilter, { defaultValue: "THREE.LinearMipmapLinearFilter", options: ["THREE.LinearMipmapLinearFilter", "THREE.LinearMipmapNearestFilter"] });
        advancedTextureAttribute.addField("Type", "three", THREE.UnsignedByteType, { defaultValue: "THREE.UnsignedByteType", options: ["THREE.UnsignedByteType", "THREE.UnsignedShortType", "THREE.FloatType"] });
        advancedTextureAttribute.addField("Anisotropy", "number", 1, { min: 1, max: 16, step: 1 });
        advancedTextureAttribute.addField("Generate Mipmaps", "string", "auto", { defaultValue: "auto", options: ["auto", "true", "false"] });
        advancedTextureAttribute.addField("Premultiply Alpha", "boolean", false);
        advancedTextureAttribute.addField("Matrix Auto Update", "boolean", true);

        this.attributes.push(advancedTextureAttribute);
        this.rendererComponent = null;

        this.maxTextureSize = "global";
    }

    static group = "General 3D";

    static baseType = "texture"
    static type = "texture"

    async updateTexture() {
        const rawValue = this.getAttr("Texture", "Image");
        if (!rawValue || rawValue === THREE.Texture.DEFAULT_IMAGE) return;

        if (!this.rendererComponent) {
            this.rendererComponent = this.getFirstParentOfType(Renderer3D);
        }

        const isKTX2 = rawValue.toLowerCase().endsWith('.ktx2');
        let maxSize = this.maxTextureSize || 2048;
        if (this.maxTextureSize == 'global') {
            maxSize = this.rendererComponent?.maxTextureSize ?? 2048;
            console.log(this.rendererComponent);
        }

        if (isKTX2) {
            if (!TextureComponent.ktx2Loader) this.initKTX2Loader();
            this.texture = await TextureComponent.ktx2Loader.loadAsync(rawValue);
        } else {
            const image = await this.loadImage(rawValue);
            
            const isPOT = THREE.MathUtils.isPowerOfTwo(image.width) && THREE.MathUtils.isPowerOfTwo(image.height);
            const isTooLarge = image.width > maxSize || image.height > maxSize;

            if (isTooLarge || !isPOT) {
                this.texture = this.processAndCompressImage(image, maxSize);
            } else {
                this.texture = new THREE.Texture(image);
            }
        }

        // WebGPU / Linux Compatibility Fixes
        this.texture.forceArrayTexture = false;
        this.texture.needsUpdate = true;
        
        this.updateUV();
        this.updateTransform();
        this.updateAdvanced();
    }

    initKTX2Loader() {
        if (!this.rendererComponent || !this.rendererComponent.renderer) {
            console.warn("TextureComponent: Renderer3D not found, KTX2 might fail to transcode.");
            return;
        }

        TextureComponent.ktx2Loader = new THREE.KTX2Loader();
        TextureComponent.ktx2Loader.setTranscoderPath('./src/core/three.js/addons/libs/basis/');
        TextureComponent.ktx2Loader.detectSupport(this.rendererComponent.renderer);
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    processAndCompressImage(image, maxSize) {
        let width = image.width;
        let height = image.height;

        if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
        }

        width = THREE.MathUtils.floorPowerOfTwo(width);
        height = THREE.MathUtils.floorPowerOfTwo(height);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0, width, height);
        
        console.log(`Texture optimized: ${image.width}x${image.height} -> ${width}x${height}`);
        
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }

    updateAllProperties() {
        this.updateTexture();
    }

    updateMapping() {
        const mapping = this.getAttr("UV", "Mapping");

        if (mapping == "auto") {
            const preset = this.getAttr("Texture", "Preset");

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
        const flipY = this.getAttr("Transform", "Flip Y");

        if (flipY == "auto") {
            const preset = this.getAttr("Texture", "Preset");

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
        const colorSpace = this.getAttr("Advanced", "Color Space");

        if (colorSpace == "auto") {
            const preset = this.getAttr("Texture", "Preset");

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
        const generateMipmaps = this.getAttr("Advanced", "Generate Mipmaps");

        if (generateMipmaps == "auto") {
            const preset = this.getAttr("Texture", "Preset");

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
        this.texture.wrapS = this.getAttr("UV", "Wrap S");
        this.texture.wrapT = this.getAttr("UV", "Wrap T");
        this.texture.repeat.set(this.getAttr("UV", "Repeat X"), this.getAttr("UV", "Repeat Y"));
        this.texture.channel = this.getAttr("UV", "UV Channel");
        this.texture.needsUpdate = true;
    }

    updateTransform() {
        this.texture.offset.set(this.getAttr("Transform", "Offset X"), this.getAttr("Transform", "Offset Y"));
        this.texture.rotation = this.getAttr("Transform", "Rotation");
        this.texture.center.set(this.getAttr("Transform", "Center X"), this.getAttr("Transform", "Center Y"));
        this.updateFlipY();
        this.texture.needsUpdate = true;
    }

    updateAdvanced() {
        this.updateColorSpace();
        this.texture.magFilter = this.getAttr("Advanced", "Mag Filter");
        this.texture.minFilter = this.getAttr("Advanced", "Min Filter");
        this.texture.type = this.getAttr("Advanced", "Type");
        this.texture.anisotropy = this.getAttr("Advanced", "Anisotropy");
        this.updateGenerateMipmaps();
        this.texture.premultiplyAlpha = this.getAttr("Advanced", "Premultiply Alpha");
        this.texture.matrixAutoUpdate = this.getAttr("Advanced", "Matrix Auto Update");
        this.texture.needsUpdate = true;
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Texture") {
            if (field == "Image") await this.updateTexture();
            if (field == "Preset") {
                this.updateMapping();
                this.updateFlipY();
                this.updateColorSpace();
                this.updateGenerateMipmaps();
            }
        }
        if (attribute == "UV") this.updateUV();
        if (attribute == "Transform") this.updateTransform();
        if (attribute == "Advanced") this.updateAdvanced();
    }
}
