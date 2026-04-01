import { Component } from "./component.js";
import { Attribute } from "./attributes.js";
import { Viewport } from "./viewport.js";
import * as THREE from "three";

export class Renderer3D extends Component {
    constructor(name = "Renderer 3D") {
        super(name);

        const framerateAttribute = new Attribute("Frame Rate");
        framerateAttribute.addField("Cap FPS", "boolean", true);
        framerateAttribute.addField("Max FPS", "number", 60, { min: 1, max: 250, step: 1 });
        framerateAttribute.addField("Use Vsync", "boolean", true);

        const rendererAttribute = new Attribute("Renderer");
        rendererAttribute.addField("Output Color Space", "three", THREE.SRGBColorSpace, { defaultValue: "THREE.SRGBColorSpace", options: ["THREE.SRGBColorSpace", "THREE.LinearSRGBColorSpace"] });
        rendererAttribute.addField("Tone Mapping", "three", THREE.ACESFilmicToneMapping, { defaultValue: "THREE.ACESFilmicToneMapping", options: ["THREE.NoToneMapping", "THREE.LinearToneMapping", "THREE.ReinhardToneMapping", "THREE.CineonToneMapping", "THREE.ACESFilmicToneMapping"] });
        rendererAttribute.addField("Tone Mapping Exposure", "number", 1, { min: 0, max: 2 });
        rendererAttribute.addField("Shadow Map Enabled", "boolean", true);
        rendererAttribute.addField("Shadow Map Type", "three", THREE.PCFSoftShadowMap, { defaultValue: "THREE.PCFSoftShadowMap", options: ["THREE.BasicShadowMap", "THREE.PCFShadowMap", "THREE.PCFSoftShadowMap", "THREE.VSMShadowMap"] });
        rendererAttribute.addField("Antialias", "boolean", true);

        const performanceAttribute = new Attribute("Performance");
        performanceAttribute.addField("Max Texture Size", "number", 2048, { min: 1, max: 4096, noRange: true });

        this.attributes.push(framerateAttribute);
        this.attributes.push(rendererAttribute);
        this.attributes.push(performanceAttribute);

        this.renderer = null;
        this.engine = null;

        this.running = false;

        this.initialized = false;

        this.renderLoopId = null;

        this.dtRender = 1000 / 60;

        this.pmremGenerator = null;

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

        this.maxTextureSize = 2048;
    }

    static baseType = "renderer3D";
    static type = "renderer3D";

    static group = "General 3D";

    static icon = ["renderer3d", ...super.icon];

    updateResolution() {
        this.resolution.width = this.viewport.actualResolution.width;
        this.resolution.height = this.viewport.actualResolution.height;
        this.aspectRatio = this.resolution.width / this.resolution.height;

        this.canvasElement.width = this.resolution.width;
        this.canvasElement.height = this.resolution.height;

        if (this.renderer) {
            this.renderer.setSize(this.resolution.width, this.resolution.height, false);
        }
        if (this.camera) {
            this.camera.aspect = this.aspectRatio;
            this.camera.updateProjectionMatrix();
        }
    }

    start() {
        this.viewport = this.getFirstParentOfType(Viewport);
        if (!this.viewport) return;

        this.engine = this.highestParent;

        this.viewport.viewportElement.appendChild(this.canvasElement);

        this.viewport.resolutionUpdateList.push(() => this.updateResolution());
        this.updateResolution();

        (async () => {
            this.renderer = new THREE.WebGPURenderer({
                canvas: this.canvasElement,
                antialias: this.getAttr("Renderer", "Antialias"),
            });

            this.canvasElement.width = this.resolution.width;
            this.canvasElement.height = this.resolution.height;

            this.renderer.setPixelRatio(1);
            this.renderer.setSize(this.resolution.width, this.resolution.height, false);
            this.renderer.outputEncoding = this.getAttr("Renderer", "Output Color Space");
            this.renderer.toneMapping = this.getAttr("Renderer", "Tone Mapping");
            this.renderer.toneMappingExposure = this.getAttr("Renderer", "Tone Mapping Exposure");
            this.renderer.shadowMap.enabled = this.getAttr("Renderer", "Cast Shadows");
            this.renderer.shadowMap.type = this.getAttr("Renderer", "Shadow Map Type");

            await this.renderer.init();
            this.renderer.setSize(this.resolution.width, this.resolution.height, false);

            this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            this.pmremGenerator.compileEquirectangularShader();

            this.updateSettings();

            this.initialized = true;

            await this.traverse(async (child) => {
                if (child.onRenderInit && typeof child.onRenderInit === "function") await child.onRenderInit();
            });

            console.log("Renderer 3D initialized.");

            this.startRenderLoop();
        })();
    }

    getChildrenRunOrder() {
        if (!this.running) return [];
        return this.children;
    }

    async setAttributeFieldValue(attribute, field, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == "Frame Rate") {
            if (field == "Cap FPS") this.setMaxFPS(this.getAttr("Frame Rate", "Max FPS"));
            if (field == "Max FPS") this.setMaxFPS(value);
            if (field == "Use Vsync") this.setVsync();
        }
        if (attribute == "Renderer") this.updateSettings();
        if (attribute == "Performance") {
            if (field == "Max Texture Size") this.maxTextureSize = this.getAttr("Performance", "Max Texture Size");
        }
    }

    updateSettings() {
        if (!this.renderer) return;
        this.renderer.outputEncoding = this.getAttr("Renderer", "Output Encoding");
        this.renderer.toneMapping = this.getAttr("Renderer", "Tone Mapping");
        this.renderer.toneMappingExposure = this.getAttr("Renderer", "Tone Mapping Exposure");
        this.renderer.shadowMap.enabled = this.getAttr("Renderer", "Cast Shadows");
        this.renderer.shadowMap.type = this.getAttr("Renderer", "Shadow Map Type");
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
        // return;
        this.sceneComponent = scene;
        if (!this.sceneComponent) return
        this.scene = scene?.threeObject;
    }

    setCamera(camera) {
        // return;
        this.cameraComponent = camera;
        if (!this.cameraComponent) return
        this.camera = camera?.threeObject;
        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
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
        if (!this.scene || !this.camera || !this.running || !this.renderer) return;

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

        this.renderer.render(this.scene, this.camera);
    }
}