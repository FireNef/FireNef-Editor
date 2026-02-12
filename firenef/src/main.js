import * as FIRENEF from "#firenef";
import setupEngine from "./loader/setup.js";
import { FirenefEditor } from "./workspace/scripts/firenefEditor.js";

window.addEventListener("DOMContentLoaded", async () => {
    window.firenefEditor = new FirenefEditor();

    const engine = await setupEngine("./src/configs/config.json");

    window.engine = engine;

    engine.start();
});