import { Component } from "./component.js";
import { Attribute } from "./attributes.js";
import { Viewport } from "./viewport.js";
import * as PIXI from "pixi";

export class Renderer2D extends Component {
    constructor(name = "Renderer2D") {
        super(name);

        const framerateAttribute = new Attribute("Frame Rate");
        framerateAttribute.addField("Cap FPS", "boolean", true);
        framerateAttribute.addField("Max FPS", "number", 60, { min: 1, max: 250, step: 1 });
        framerateAttribute.addField("Use Vsync", "boolean", true);

        const rendererAttribute = new Attribute("2D Renderer");
        rendererAttribute.addField("Prefer WebGPU", "boolean", true); 
        rendererAttribute.addField("Antialias", "boolean", true);
        rendererAttribute.addField("Background Alpha", "number", 1, { min: 0, max: 1, step: 0.1 });
        rendererAttribute.addField("Antialias Samples", "number", 4, { options: [1, 2, 4, 8] }); 

        const qualityAttribute = new Attribute("Texture & Quality");
        qualityAttribute.addField("Scale Mode", "string", "linear", { options: ["linear", "nearest"] });
        qualityAttribute.addField("Wrap Mode", "string", "clamp", { options: ["clamp", "repeat", "mirror-repeat"] });
        qualityAttribute.addField("Canvas Rendering", "string", "auto", { options: ["auto", "pixelated"] });
        qualityAttribute.addField("Round Pixels", "boolean", false);

        const performanceAttribute = new Attribute("Performance");
        performanceAttribute.addField("Max Texture Size", "number", 4096, { min: 1, max: 16384, noRange: true, powerOf2: true });
        performanceAttribute.addField("Batch Size", "number", 4096, { min: 512, max: 16384, step: 512 });
        performanceAttribute.addField("Clear Before Render", "boolean", true);

        this.attributes.push(framerateAttribute);
        this.attributes.push(rendererAttribute);
        this.attributes.push(qualityAttribute);
        this.attributes.push(performanceAttribute);

        this.renderer = null;
        this.engine = null;

        this.running = false;

        this.initialized = false;

        this.renderLoopId = null;

        this.dtRender = 1000 / 60;

        this.frameTimes = [];
        this.fps = 0;
        this.fpsLow = 0;
        this.fpsHigh = 0;
        this.maxSamples = 100;

        this.sceneComponent = null;
        this.cameraComponent = null;

        this.scene = null;
        this.camera = null;
        this.viewport = null;

        this.canvasElement = document.createElement('canvas');
        this.canvasElement.id = "mainCanvas";
        this.canvasElement.style.background = "#000000";
        this.canvasElement.style.zIndex = -1;

        this.resolution = { width: 1920, height: 1080 };
        this.aspectRatio = 16 / 9;
    }

    static baseType = "renderer2D";
    static type = "renderer2D";

    static group = "General 2D";

    static icon = ["renderer2d", ...super.icon];

    static #textureCache = new Map();

    static getTexture(path) {
        if (Renderer2D.#textureCache.has(path)) {
            return Renderer2D.#textureCache.get(path);
        }

        // 1. Create a proxy placeholder texture with a width/height framework
        const texture = new PIXI.Texture({
            source: new PIXI.CanvasSource({
                canvas: document.createElement('canvas')
            }),
            dynamic: true // CRITICAL: Tells Pixi v8 this texture's bounds will shift
        });
        
        Renderer2D.#textureCache.set(path, texture);

        PIXI.Assets.load(path).then((loadedTexture) => {
            // Overwrite cache with the completed production texture
            Renderer2D.#textureCache.set(path, loadedTexture);

            // 2. FIX: Link the source AND explicitly sync the view boundaries
            texture.source = loadedTexture.source;
            
            // Copy dimensions so internal UV calculations don't divide by zero
            texture.frame.width = loadedTexture.frame.width;
            texture.frame.height = loadedTexture.frame.height;
            texture.orig.width = loadedTexture.orig.width;
            texture.orig.height = loadedTexture.orig.height;

            // 3. FORCE RE-CALCULATION: Tell Pixi v8 to regenerate the UV arrays instantly
            texture.update(); 
        }).catch((err) => {
            console.error(`Failed to load engine texture asset at: ${path}`, err);
        });

        return texture;
    }

    updateResolution() {
        this.resolution.width = this.viewport.actualResolution.width;
        this.resolution.height = this.viewport.actualResolution.height;
        this.aspectRatio = this.resolution.width / this.resolution.height;

        if (this.renderer) {
            this.renderer.resize(this.resolution.width, this.resolution.height);
        } else {
            this.canvasElement.width = this.resolution.width;
            this.canvasElement.height = this.resolution.height;
        }
    }

    start() {
        this.viewport = this.getFirstParentOfType(Viewport);
        if (!this.viewport) return;

        this.engine = this.highestParent;

        this.viewport.viewportElement.appendChild(this.canvasElement);

        this.viewport.resolutionUpdateList.push(() => this.updateResolution());
        this.updateResolution();

        PIXI.TextureSource.defaultOptions.scaleMode = this.getAttr("Texture & Quality", "Scale Mode");
        PIXI.TextureSource.defaultOptions.wrapMode = this.getAttr("Texture & Quality", "Wrap Mode");

        (async () => {

            this.renderer = await PIXI.autoDetectRenderer({
                canvas: this.canvasElement,
                preference: this.getAttr("2D Renderer", "Prefer WebGPU") ? "webgpu" : "webgl",
                texturePreference: {
                    scaleMode: this.getAttr("Texture & Quality", "Scale Mode"),
                    wrapMode: this.getAttr("Texture & Quality", "Wrap Mode"),
                    format: navigator.gpu ? (await navigator.gpu.requestAdapter())?.features : undefined
                },
                antialias: this.getAttr("2D Renderer", "Antialias"),
                backgroundAlpha: this.getAttr("2D Renderer", "Background Alpha"),
                multisample: this.getAttr("2D Renderer", "Antialias Samples"),
                clearBeforeRender: this.getAttr("Performance", "Clear Before Render"),
                batchSize: this.getAttr("Performance", "Batch Size"),
                roundPixels: this.getAttr("Texture & Quality", "Round Pixels"),

                manageImports: false,
                skipShaderValidation: true,

                resolution: 1,
                autoDensity: false,

                width: this.resolution.width,
                height: this.resolution.height
            });

            const canvasRenderMode = this.getAttr("Texture & Quality", "Canvas Rendering");
            if (canvasRenderMode == "pixelated") {
                this.canvasElement.style.imageRendering = "pixelated";
            } else {
                this.canvasElement.style.imageRendering = "auto"; 
            }

            this.initialized = true;

            await this.traverse(async (child) => {
                if (child.onRenderInit && typeof child.onRenderInit === "function") await child.onRenderInit();
            });

            console.log("Renderer 2D initialized.");

            this.startRenderLoop();
        })();
    }

    startRenderLoop() {
        if (this.renderLoopId) this.stopRenderLoop();
        this.running = true;

        if (this.getAttr("Frame Rate", "Use Vsync")) {
            this.startRenderVsync();
        } else {
            this.startRenderFixedFPS();
        }
    }

    stopRenderLoop() {
        if (!this.renderLoopId) return;

        if (this.getAttr("Frame Rate", "Use Vsync")) {
            cancelAnimationFrame(this.renderLoopId);
        } else {
            clearInterval(this.renderLoopId);
        }

        this.renderLoopId = null;
        this.running = false;
    }

    setMaxFPS(maxFps) {
        this.dtRender = maxFps == 0 ? 0 : 1000 / maxFps;

        if (!this.getAttr("Frame Rate", "Cap FPS")) this.dtRender = 0;

        if (!this.getAttr("Frame Rate", "Use Vsync") && this.running) {
            this.startRenderLoop();
        }
    }

    setVsync() {
        if (this.running) {
            this.startRenderLoop();
        }
    }

    startRenderVsync() {
        const renderer = this;

        function loop() {
            renderer.renderFrame();
            renderer.renderLoopId = requestAnimationFrame(loop);
        }

        loop();
    }

    startRenderFixedFPS() {
        this.renderLoopId = setInterval(() => this.renderFrame(), this.dtRender);
    }

    setScene(scene) {
        this.sceneComponent = scene;
        if (!this.sceneComponent) return
        this.scene = scene?.pixiObject;
    }

    setCamera(camera) {
        this.cameraComponent = camera;
        if (!this.cameraComponent) return
        this.camera = camera?.pixiObject;
    }

    getFps() {
        const now = performance.now()

        if (this.lastFrameTime === undefined) {
            this.lastFrameTime = now
            return
        }

        const delta = now - this.lastFrameTime
        this.lastFrameTime = now

        this.frameTimes.push(delta)
        if (this.frameTimes.length > this.maxSamples) {
            this.frameTimes.shift()
        }

        const samples = this.frameTimes

        if (samples.length > 0) {
            const avgDelta = samples.reduce((a, b) => a + b) / samples.length
            this.fps = 1000 / avgDelta

            const sorted = [...samples].sort((a, b) => a - b)

            const lowIndex = Math.floor(sorted.length * 0.99)
            const highIndex = Math.floor(sorted.length * 0.01)

            const lowDelta = sorted[lowIndex]
            const highDelta = sorted[highIndex]

            this.fpsLow = 1000 / lowDelta
            this.fpsHigh = 1000 / highDelta
        }
    }

    renderFrame() {
        this.getFps();
        if (!this.scene || !this.running || !this.renderer) return;

        const now = performance.now();
        const engine = this.engine;

        let alpha = 1;
        if (engine) {
            alpha = (now - engine.lastUpdateTime) / engine.dtUpdate;
            alpha = Math.min(Math.max(alpha, 0), 1);
        }

        if (this.sceneComponent.renderUpdate) {
            this.sceneComponent.renderUpdate(alpha);
        }

        this.renderer.render({ container: this.scene });

    }

    updateRenderer() {
        if (!this.renderer) return;
        const canvasRenderMode = this.getAttr("Texture & Quality", "Canvas Rendering");
        console.log(this.canvasElement.style.imageRendering)
        if (canvasRenderMode == "pixelated") {
            this.canvasElement.style.imageRendering = "pixelated";
        } else {
            this.canvasElement.style.imageRendering = "auto";
        }
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        this.updateRenderer();
    }
}