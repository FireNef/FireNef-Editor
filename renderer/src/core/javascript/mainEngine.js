import { EngineLogger } from "./components/engineLogger.js";

export class Engine {
    constructor() {
        this.running = false;
        
        this.logger = new EngineLogger();
        this.maxUPS = 60;

        this.updateLoopId = null;

        this.updateList = [];

        this.lastUpdateTime = performance.now();
        this.dtUpdate = 1000 / this.maxUPS;
        this.alpha = 0;
    }

    async setup() {
        await this.update();
    }

    async initRenderer() {
        await this.renderer.setup();
    }

    start() {
        this.running = true;
        this.startUpdateLoop();
    }

    stop() {
        this.running = false;
        this.stopUpdateLoop();
    }

    setMaxUps(maxUps) {
        this.maxUPS = maxUps;
        this.dtUpdate = maxUps == 0 ? 0 : 1000 / maxUps;
    }

    startUpdateLoop() {
        if (this.updateLoopId) return;

        this.updateLoopId = setInterval(() => {
            this.lastUpdateTime = performance.now();
            this.update();
        }, this.dtUpdate);
    }

    stopUpdateLoop() {
        if (!this.updateLoopId) return;
        clearInterval(this.updateLoopId);
        this.updateLoopId = null;
    }

    update() {
        for (const item of this.updateList) {
            if (!item.update) continue;
            if (typeof item.update !== "function") continue;
            item.update();
        }
    }

    getViewportCapableComponent() {
        return document.body;
    }
}