export class Renderer {
    constructor(canvas) {
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
    }

    setResolution(height, width = height * (16/9)) {
        this.resolution = {
            width, height
        }
        this.updateResolution();
    }

    updateResolution() {
        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;
    }

    startRenderLoop() {
        if (this.renderLoopId) this.stopRenderLoop();
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
    }

    setMaxFPS(maxFps) {
        this.maxFps = maxFps;
        this.dtRender = maxFps == 0 ? 0 : 1000 / maxFps;
        if (!this.vsync && this.running) this.startRenderLoop();
    }

    setVsync(vsync) {
        this.vsync = vsync;
        if (this.running) this.startRenderLoop();
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

    setup() {
        this.updateResolution();
        this.ctx = this.canvas.getContext('2d');
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = "80px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillText("FPS: "+Math.floor(this.fps), this.canvas.width/2, this.canvas.height/2);
        this.ctx.fillText("1% Lows: "+Math.floor(this.fpsLow), this.canvas.width/2, this.canvas.height/2-100);
        this.ctx.fillText("1% Highs: "+Math.floor(this.fpsHigh), this.canvas.width/2, this.canvas.height/2+100);

    }
}

