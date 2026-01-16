import { app, BrowserWindow, ipcMain } from 'electron';
import fsPromises from 'fs/promises';
import ffs from "fast-folder-size";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from "child_process";

import { installElectronPreset, installMainPreset, installLoaderPreset, checkNpmOrDie } from './firenefEditorTools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(path.join(__dirname, "project.json"))) throw new Error("Missing project.json");
const projectConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "project.json"), "utf8"));

const projectName = projectConfig.name ?? "project";

const BASE_DIR = path.join(app.getPath("documents"), projectName);

function resolveSafe(target) {
    const resolved = path.resolve(BASE_DIR, target);
    if (!resolved.startsWith(BASE_DIR)) throw new Error("Path escape");
    return resolved;
}

const projectPath = path.join(BASE_DIR, "projects");

if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });

async function listRecursive(dir, base = "") {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    let results = [];
    for (const e of entries) {
        const full = path.join(dir, e.name);
        const rel = path.join(base, e.name);
        if (e.isDirectory()) {
            results.push({ type: "dir", path: rel });
            results = results.concat(await listRecursive(full, rel));
        } else {
            results.push({ type: "file", path: rel });
        }
    }
    return results;
}

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

ipcMain.handle("install-electron-preset", async (_, presetPath, projectPath, projectName) => await installElectronPreset(presetPath, projectPath, projectName));
ipcMain.handle("install-main-preset", async (_, presetPath, projectPath, projectName, coreUrl) => await installMainPreset(presetPath, projectPath, projectName, coreUrl));
ipcMain.handle("install-loader-preset", async (_, presetPath, projectPath, projectName) => await installLoaderPreset(presetPath, projectPath, projectName));

const createWindow = () => {
    const windowSettings = projectConfig.windowSettings ?? {
        width: 960,
        height: 720,
        minWidth: 400,
        minHeight: 270,
        autoHideMenuBar: true,
        icon: path.join(projectName, "assets", "icon.ico"),
        webPreferences: {
            nodeIntegration: true,
            webgpu: true
        }
    };

    if (windowSettings.icon) windowSettings.icon = path.join(__dirname, windowSettings.icon);
    if (windowSettings.webPreferences.preload) windowSettings.webPreferences.preload = path.join(__dirname, windowSettings.webPreferences.preload);

    const win = new BrowserWindow(windowSettings);

    ipcMain.on("win:minimize", () => win.minimize())
    ipcMain.on("win:maximize", () => {
        win.isMaximized() ? win.unmaximize() : win.maximize()
    })
    ipcMain.on("win:close", () => win.close())

    win.loadFile(path.join(__dirname, projectName, "index.html"));
}

app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-unsafe-webgpu");

app.whenReady().then(() => {
    if (!checkNpmOrDie()) return;

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on("quit", () => {
    const projectsDir = resolveSafe("projects");

    spawn("node", [path.resolve(__dirname, "deleteFolder.js"), projectsDir], {
        detached: true,
        stdio: "ignore"
    }).unref();
});