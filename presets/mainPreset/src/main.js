import * as FIRENEF from "firenef";

window.addEventListener("DOMContentLoaded", async () => {
    const engine = await FIRENEF.setupEngine("./src/configs/config.json");

    window.engine = engine;

    engine.start();
});