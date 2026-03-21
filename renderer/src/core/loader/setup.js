import { Engine } from "../javascript/mainEngine.js";
import { fetchLocalJSON } from "./utils.js";
import loadModules from "./loadModules.js";

export default async function setupEngine(configPath) {
    const engine = new Engine();

    const config = await fetchLocalJSON(configPath);
    if (!config || typeof config !== "object") throw console.error("Config missing or incorrect.");

    engine.setMaxUps(config.maxUps ?? 60);

    await loadModules(engine, config);
    await engine.setup();

    return engine;
}