import * as FIRENEF from "firenef";
import { FirenefEditor } from "./workspace/scripts/firenefEditor.js";

window.addEventListener("DOMContentLoaded", async () => {
    window.firenefEditor = new FirenefEditor();

    const engine = await FIRENEF.setupEngine("./src/configs/config.json");

    window.engine = engine;

    engine.start();
});