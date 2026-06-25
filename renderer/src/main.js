import * as PIXI from "pixi";

// ============================================================================
// NATIVE PIXJS V8 CSP PATCH (Replaces unsafe-eval.min.js)
// ============================================================================
if (PIXI.AbstractRenderer) {
    // 1. Bypass the internal string evaluation check
    PIXI.AbstractRenderer.prototype._unsafeEvalCheck = function() {};
}

if (PIXI.UboSystem) {
    // 2. Bypass Uniform Buffer Object evaluation checks
    PIXI.UboSystem.prototype._systemCheck = function() {};
}

// 3. Fallback functions that compile uniforms using loops instead of generating code strings
if (PIXI.GlUniformGroupSystem) {
    PIXI.GlUniformGroupSystem.prototype._generateUniformsSync = function(t, i, o) {
        const s = o.gl;
        for (const u in t) {
            const f = i[u], c = t[u], l = t[u].value;
            // Native loop fallback safely handling the textures and vectors
            if (s && i[u]?.location) {
                if (Array.isArray(l) || l instanceof Float32Array) {
                    s.uniformfv(i[u].location, l);
                } else if (typeof l === 'number') {
                    s.uniform1f(i[u].location, l);
                }
            }
        }
    };
}
// ============================================================================

import * as FIRENEF from "firenef";
import { FirenefEditor } from "./workspace/scripts/firenefEditor.js";

window.addEventListener("DOMContentLoaded", async () => {
    window.firenefEditor = new FirenefEditor();

    const engine = await FIRENEF.setupEngine("./src/configs/config.json");

    window.engine = engine;

    engine.start();
});