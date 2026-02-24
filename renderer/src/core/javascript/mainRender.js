import * as THREE from "three";

export class Renderer {
    constructor(engine, canvas) {
        this.engine = engine;

        this.canvas = canvas;
        this.ctx = null;

        this.resolution = {
            width  : 1960,
            height : 1080
        }

        this.running = false;

        this.maxFps = 0;
        this.dtRender = 0;
        this.vsync = true;
        
        this.renderLoopId = null;

        this.frameTimes = [];
        this.fps = 0;
        this.fpsLow = 0;
        this.fpsHigh = 0;
        this.maxSamples = 100;

        this.sceneComponent = null;
        this.cameraComponent = null;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

    setResolution(width, height = width / (16 / 9)) {
        this.resolution = { width, height };
        this.updateResolution();
    }

    updateResolution() {
        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;

        if (this.renderer && this.camera) {
            this.renderer.setSize(this.resolution.width, this.resolution.height, false);
            this.camera.aspect = this.resolution.width / this.resolution.height;
            this.camera.updateProjectionMatrix();
        }
    }

    startRenderLoop() {
        if (this.renderLoopId) this.stopRenderLoop();
        this.running = true;

        if (this.vsync) {
            this.startRenderVsync();
        } else {
            this.startRenderFixedFPS();
        }
    }

    stopRenderLoop() {
        if (!this.renderLoopId) return;

        if (this.vsync) {
            cancelAnimationFrame(this.renderLoopId);
        } else {
            clearInterval(this.renderLoopId);
        }

        this.renderLoopId = null;
        this.running = false;
    }

    setMaxFPS(maxFps) {
        this.maxFps = maxFps;
        this.dtRender = maxFps == 0 ? 0 : 1000 / maxFps;

        if (!this.vsync && this.running) {
            this.startRenderLoop();
        }
    }

    setVsync(vsync) {
        this.vsync = vsync;

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
        this.scene = scene?.threeObject;
    }

    setCamera(camera) {
        // return;
        this.cameraComponent = camera;
        this.camera = camera?.threeObject;
    }

    async setup() {
        this.updateResolution();

        this.renderer = new THREE.WebGPURenderer({
            canvas: this.canvas,
            antialias: true
        });

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        await this.renderer.init();
        this.renderer.setSize(this.resolution.width, this.resolution.height, false);

        // --- ADD SINGLE PMREM GENERATOR FOR THE WHOLE RENDERER ---
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();


        /*
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            60,
            this.resolution.width / this.resolution.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.2, 3);
        this.camera.lookAt(0, 0.5, 0);

        // PMREM stays alive for WebGPU
        const pmrem = new THREE.PMREMGenerator(this.renderer);

        new THREE.TextureLoader().load("./assets/skybox/sb4.png", (tex) => {
            tex.mapping = THREE.EquirectangularReflectionMapping;
            tex.colorSpace = THREE.SRGBColorSpace;

            const envMap = pmrem.fromEquirectangular(tex).texture;

            // assign environment only after PMREM texture is ready
            this.scene.environment = envMap;
            this.scene.background = envMap;

            // start the render loop here
            this.renderer.setAnimationLoop(() => {
                this.cube.rotation.y += 0.01;
                this.renderer.render(this.scene, this.camera);
            });

            tex.dispose();
            // don't dispose PMREM yet
        });

        const floorGeo = new THREE.PlaneGeometry(10, 10);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8,
            metalness: 0.0
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.2
        });
        this.cube = new THREE.Mesh(cubeGeo, metalMat);
        this.cube.position.y = 0.5;
        this.scene.add(this.cube);

        const keyLight = new THREE.DirectionalLight(0xffffff, 4);
        keyLight.position.set(5, 5, 5);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1);
        fillLight.position.set(-5, 2, -3);
        this.scene.add(fillLight);
        */
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
        if (!this.scene || !this.camera) return;

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

