import { contextBridge, ipcRenderer } from "electron";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

contextBridge.exposeInMainWorld("fs", {
    list: () => ipcRenderer.invoke("fs-list"),
    read: (path) => ipcRenderer.invoke("fs-read", path),
    writeFile: (path, content) => ipcRenderer.invoke("fs-write-file", path, content),
    mkdir: (path) => ipcRenderer.invoke("fs-mkdir", path),
    delete: (path) => ipcRenderer.invoke("fs-delete", path),
    pathInfo: (path) => ipcRenderer.invoke("fs-path-info", path),
    rename: (from, to) => ipcRenderer.invoke("fs-rename", from, to),
    exists: (path) => ipcRenderer.invoke("fs-exists", path),
    loadModule: async (modulePath) => {
        const BASE_DIR = await ipcRenderer.invoke("get-base-dir");

        if (path.isAbsolute(modulePath)) {
            throw new Error('Absolute paths are not allowed.');
        }
    
        const resolvedPath = path.resolve(BASE_DIR, modulePath);
    
        if (!resolvedPath.startsWith(BASE_DIR)) {
            throw new Error('Path traversal detected.');
        }
    
        if (!fs.existsSync(resolvedPath)) {
            throw new Error('Module not found.');
        }
    
        const moduleUrl = pathToFileURL(resolvedPath).href;
        return await import(moduleUrl);
    }
});

contextBridge.exposeInMainWorld("windowControls", {
    minimize: () => ipcRenderer.send("win:minimize"),
    maximize: () => ipcRenderer.send("win:maximize"),
    close: () => ipcRenderer.send("win:close")
});

contextBridge.exposeInMainWorld("firenefEditorTools", {
    installElectronPreset: (presetPath, projectPath, projectName) => ipcRenderer.invoke("install-electron-preset", presetPath, projectPath, projectName),
    installMainPreset: (presetPath, projectPath, projectName, coreUrl) => ipcRenderer.invoke("install-main-preset", presetPath, projectPath, projectName, coreUrl),
    installLoaderPreset: (presetPath, projectPath, projectName) => ipcRenderer.invoke("install-loader-preset", presetPath, projectPath, projectName)
});