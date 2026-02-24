import { Engine } from "../javascript/mainEngine.js";
import { fetchLocalJSON } from "./utils.js";
import { positionElements } from "./elementPosition.js";
import loadModules from "./loadModules.js";

export default async function setupEngine(configPath) {
    const root = document.createElement('div');
    root.id = "root";

    const canvas = document.createElement('canvas');
    canvas.id = "mainCanvas";

    root.appendChild(canvas);
    document.body.appendChild(root);

    const engine = new Engine(root, canvas);

    const config = await fetchLocalJSON(configPath);

    if (!config || typeof config !== "object") throw console.error("Config missing or incorrect.");

    const resolution = config.resolution ?? { width: 1920, height: 1080 };

    engine.setMaxUps(config.maxUps ?? 60);
    engine.renderer.setMaxFPS(config.maxFps ?? 60);
    engine.renderer.setVsync(config.vsync ?? true);
    engine.renderer.setResolution(resolution.width, resolution.height);

    const aspecRatio = resolution.width / resolution.height;

    positionElements(root, aspecRatio);
    window.addEventListener('resize', () => {
        positionElements(root, aspecRatio);
    });

    await engine.initRenderer();

    await loadModules(engine, config);

    await engine.setup();
    positionElements(root, aspecRatio);

    return engine;
}