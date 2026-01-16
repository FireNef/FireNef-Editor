import * as FIRENEF from "firenef";
import setupEngine from "./loader/setup.js";

window.addEventListener("DOMContentLoaded", async () => {
    const engine = await setupEngine("./src/configs/config.json");

    window.engine = engine;

    engine.start();
});