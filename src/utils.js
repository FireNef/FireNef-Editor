import path from "path";
import { BASE_DIR } from "./basePaths.js";

export function resolveSafe(target) {
    const resolved = path.resolve(BASE_DIR, target);
    if (!resolved.startsWith(BASE_DIR)) throw new Error("Path escape");
    return resolved;
}