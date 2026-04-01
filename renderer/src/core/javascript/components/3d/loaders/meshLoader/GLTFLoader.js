import { Object3d } from "../../object3d.js";
import { Attribute } from "../../../attributes.js";
import { Renderer3D } from "../../../renderer3D.js";
import * as THREE from "three";

export class GLTFLoader extends Object3d {
    constructor(name = "GLTF Loader") {
        super(name);

        const meshAttribute = new Attribute("Mesh");
        meshAttribute.addField("GLB File", "path", null);
        meshAttribute.addField("Cast Shadows", "boolean", true);
        meshAttribute.addField("Receive Shadows", "boolean", true);
        this.attributes.push(meshAttribute);

        const mapOverideAttribute = new Attribute("Map Overide");
        mapOverideAttribute.addField("Map Overide", "texture", null);
        mapOverideAttribute.addField("Normal Map Overide", "texture", null);
        mapOverideAttribute.addField("Metalic Map Overide", "texture", null);
        mapOverideAttribute.addField("Roughness Map Overide", "texture", null);
        mapOverideAttribute.addField("Ambient Occlusion Map Overide", "texture", null);
        this.attributes.push(mapOverideAttribute);

        const unityImportAttribute = new Attribute("Unity Import");
        unityImportAttribute.addField("Unity Normal Map Fix", "boolean", false);
        unityImportAttribute.addField("Unity Metal/Smoothness map", "texture", null);
        unityImportAttribute.addField("Use AO maps", "boolean", true);
        this.attributes.push(unityImportAttribute);

        this.object3D = new THREE.Object3D();
        this.object3D.name = name;

        this.maxTextureSize = "global";
    }

    static baseType = "mesh";
    static type = "gltfLoader";

    static group = "3D Mesh Loaders";

    static loader = new THREE.GLTFLoader();
    static ktx2Loader = null;

    async updateMesh() {
        const rendererComponent = this.getFirstParentOfType(Renderer3D);
        if (!rendererComponent || !rendererComponent.initialized) return;

        const url = this.getAttr("Mesh", "GLB File");

        // wrap load in a promise so we can await it
        const gltf = await new Promise((resolve, reject) => {
            GLTFLoader.loader.load(
                url,
                (gltf) => resolve(gltf),
                undefined,           // onProgress callback (optional)
                (err) => reject(err) // onError
            );
        });
        
        this.object3D = gltf.scene;

        if (this.maxTextureSize == 'global') {
            this.compressTextures(rendererComponent.maxTextureSize);
        } else {
            this.compressTextures(this.maxTextureSize);
        }

        this.updateShadow();
        this.updateOverideMaps();
        this.updateUnityNormalMapFix();
        this.updateUnityMetallicSmoothnessMap();
    }

    async onRenderInit() {
        const rendererComponent = this.getFirstParentOfType(Renderer3D);

        if (!rendererComponent) return;
        const renderer = rendererComponent.renderer;

        if (!GLTFLoader.ktx2Loader) {
            GLTFLoader.ktx2Loader = new THREE.KTX2Loader();
            GLTFLoader.ktx2Loader.setTranscoderPath( './src/core/three.js/addons/libs/basis/' );
            GLTFLoader.ktx2Loader.detectSupport( renderer );

            GLTFLoader.loader.setKTX2Loader(GLTFLoader.ktx2Loader);
        }

        await this.updateMesh();
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Mesh") {
            if (field == "GLB File") this.updateMesh();
            if (field == "Cast Shadows") this.updateShadow();
            if (field == "Receive Shadows") this.updateShadow();
        }
        if (attribute == "Map Overide") this.updateOverideMaps();
        if (attribute == "Unity Import") {
            if (field == "Unity Normal Map Fix") this.updateUnityNormalMapFix();
            if (field == "Unity Metal/Smoothness map") this.updateUnityMetallicSmoothnessMap();
        }
    }

    compressTextures(maxSize = 2048) {
        this.object3D.traverse((obj) => {
            if (obj.isMesh && obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach((mat) => {
                    ['map','aoMap','metalnessMap','roughnessMap','normalMap','emissiveMap'].forEach((mapName) => {
                        const tex = mat[mapName];
                        if (tex && tex.image) {
                            const w = tex.image.width;
                            const h = tex.image.height;
                            if (w > maxSize || h > maxSize) {
                                const canvas = document.createElement('canvas');
                                const scale = Math.min(maxSize / w, maxSize / h);
                                canvas.width = Math.floor(w * scale);
                                canvas.height = Math.floor(h * scale);
                                canvas.getContext('2d').drawImage(tex.image, 0, 0, canvas.width, canvas.height);
                                tex.image = canvas;
                                tex.needsUpdate = true;
                            }
                            tex.minFilter = THREE.LinearMipMapLinearFilter;
                            tex.magFilter = THREE.LinearFilter;
                            tex.generateMipmaps = true;
                        }
                    });
                });
            }
        });
    }
    
    updateShadow() {
        this.object3D.traverse((child) => {
            if (child.isMesh) {
                if (!child.geometry?.attributes?.position) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                    return;
                };
                child.castShadow = this.getAttr("Mesh", "Cast Shadows");
                child.receiveShadow = this.getAttr("Mesh", "Receive Shadows");
            }
        })
    }

    updateOverideMaps() {
        const mapOveride = this.getAttr("Map Overide", "Map");
        const normalMapOveride = this.getAttr("Map Overide", "Normal Map");
        const metalicMapOveride = this.getAttr("Map Overide", "Metalic Map");
        const roughnessMapOveride = this.getAttr("Map Overide", "Roughness Map");
        const aoMapOveride = this.getAttr("Map Overide", "Ambient Occlusion Map");

        this.object3D.traverse((child) => {
            if (child.isMesh) {
                if (mapOveride) child.material.map = mapOveride;
                if (normalMapOveride) child.material.normalMap = normalMapOveride;
                if (metalicMapOveride) child.material.metalnessMap = metalicMapOveride;
                if (roughnessMapOveride) child.material.roughnessMap = roughnessMapOveride;
                if (aoMapOveride) child.material.aoMap = aoMapOveride;
            }
        })
    }

    updateUnityNormalMapFix() {
        if (!this.getAttr("Unity Import", "Unity Normal Map Fix")) return;

        this.object3D.traverse((child) => {
            if (child.isMesh && child.material.normalMap) {
                const normalMap = child.material.normalMap;

                // Ensure the texture is loaded
                if (normalMap.image) {
                    const canvas = document.createElement('canvas');
                    canvas.width = normalMap.image.width;
                    canvas.height = normalMap.image.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(normalMap.image, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Swap R and B for every pixel
                    for (let i = 0; i < data.length; i += 4) {
                        // Decode RGB [0,255] → [-1,1]
                        let nx = data[i] / 127.5 - 1;   // R
                        let ny = data[i + 1] / 127.5 - 1; // G
                        let nz = data[i + 2] / 127.5 - 1; // B

                        // Swap X and Z
                        let temp = nx;
                        nx = nz;
                        nz = temp;

                        // Normalize the vector
                        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                        nx /= length;
                        ny /= length;
                        nz /= length;

                        // Re-encode [-1,1] → [0,255]
                        data[i] = Math.round((nx + 1) * 127.5);
                        data[i + 1] = Math.round((ny + 1) * 127.5);
                        data[i + 2] = Math.round((nz + 1) * 127.5);
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // Create a new texture from the modified canvas
                    const newTexture = new THREE.CanvasTexture(canvas);
                    newTexture.wrapS = normalMap.wrapS;
                    newTexture.wrapT = normalMap.wrapT;
                    newTexture.repeat.copy(normalMap.repeat);
                    newTexture.encoding = THREE.LinearEncoding;
                    newTexture.flipY = normalMap.flipY;
                    newTexture.colorSpace = THREE.LinearSRGBColorSpace;
                    newTexture.anisotropy = normalMap.anisotropy;
                    newTexture.offset.copy(normalMap.offset);
                    newTexture.rotation = normalMap.rotation;
                    newTexture.center.copy(normalMap.center);
                    newTexture.generateMipmaps = normalMap.generateMipmaps;

                    child.material.normalScale.set(1, 1);
                    child.material.normalMap = newTexture;
                    child.material.needsUpdate = true;
                }
            }
        });
    }

    updateUnityMetallicSmoothnessMap() {
        if (!this.getAttr("Unity Import", "Unity Metallic Smoothness Map")) return;

        const textureComponent = this.getAttr("Unity Import", "Unity Metallic Smoothness Map");

        if (!textureComponent.unityFix) {
            const texture = textureComponent.texture;
            if (!texture) return;

            if (texture.image) {
                textureComponent.unityFix = true;

                const canvas = document.createElement('canvas');
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(texture.image, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    let a = data[i + 3];

                    const intencity = a / 255;

                    data[i] = Math.round((255 - g) * intencity);
                    data[i + 1] = Math.round((255 - b) * intencity);
                    data[i + 2] = Math.round(r * intencity);
                    data[i + 3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);

                textureComponent.texture = new THREE.CanvasTexture(canvas);
                textureComponent.texture.encoding = THREE.LinearEncoding;
                textureComponent.texture.flipY = false;
                textureComponent.texture.colorSpace = THREE.LinearSRGBColorSpace;
                textureComponent.texture.wrapS = THREE.RepeatWrapping;
                textureComponent.texture.wrapT = THREE.RepeatWrapping;
                textureComponent.texture.repeat.set(1, 1);
                textureComponent.texture.needsUpdate = true;
            }
        }

        this.object3D.traverse((child) => {
            if (child.isMesh) {
                child.material.metalnessMap = textureComponent?.texture ?? null;
                child.material.roughnessMap = textureComponent?.texture ?? null;
                child.material.aoMap = textureComponent?.texture ?? null;
                child.material.needsUpdate = true;
            }
        });
    }
}