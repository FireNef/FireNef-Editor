import { app, ipcMain } from "electron";
import fsPromises from 'fs/promises';
import ffs from "fast-folder-size";
import path from "path";

import { resolveSafe } from "./utils.js";
import { BASE_DIR } from "./basePaths.js";

const exists = path =>
    fsPromises.access(path).then(() => true).catch(() => false);

async function listRecursiveTree(dir, base = "") {
    if (!await exists(dir)) return [];
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    const tree = [];

    for (const e of entries) {
        const full = path.join(dir, e.name);
        const rel = path.join(base, e.name).replace(/\\/g, "/");

        if (e.isDirectory()) {
            const children = await listRecursiveTree(full, rel);
            tree.push({
                type: "dir",
                path: rel,
                children
            });
        } else {
            tree.push({
                type: "file",
                path: rel
            });
        }
    }

    return tree;
}


function getFolderSize(folderPath) {
    return new Promise((resolve, reject) => {
        ffs(folderPath, (err, size) => {
            if (err) reject(err);
            else resolve(size); // Number
        });
    });
}

async function getPathInfo(p) {
    const stat = await fsPromises.lstat(p);
    const name = path.basename(p);

    if (stat.isDirectory()) {
        return {
            type: "dir",
            name,
            size: await getFolderSize(p),
            createdAt: stat.birthtimeMs,
            modifiedAt: stat.mtimeMs,
            isSymlink: stat.isSymbolicLink(),
        };
    }

    return {
        type: "file",
        name,
        size: stat.size,
        createdAt: stat.birthtimeMs,
        modifiedAt: stat.mtimeMs,
        isSymlink: stat.isSymbolicLink()
    };
}

ipcMain.handle("fs-exists", async (_, p) => {
    return await exists(resolveSafe(p));
});

ipcMain.handle("fs-path-info", async (_, p) => {
    const full = resolveSafe(p);
    return await getPathInfo(full);
});

ipcMain.handle("fs-list", async () => {
    return await listRecursiveTree(BASE_DIR);
});

ipcMain.handle("fs-read", async (_, p) => {
    return await fsPromises.readFile(resolveSafe(p));
});

ipcMain.handle("fs-write-file", async (_, p, content) => {
    const full = resolveSafe(p);
    await fsPromises.mkdir(path.dirname(full), { recursive: true });
    await fsPromises.writeFile(full, content, "utf8");
    return true;
});

ipcMain.handle("fs-mkdir", async (_, p) => {
    const full = resolveSafe(p);
    await fsPromises.mkdir(full, { recursive: true });
    return true;
});

ipcMain.handle("fs-delete", async (_, p) => {
    const full = resolveSafe(p);
    await fsPromises.rm(full, { recursive: true, force: true });
    return true;
});

ipcMain.handle("fs-rename", async (_, from, to) => {
    process.chdir(app.getPath("userData"));
    const src = resolveSafe(from);
    const dst = resolveSafe(to);
    await fsPromises.rename(src, dst);
    return true;
});