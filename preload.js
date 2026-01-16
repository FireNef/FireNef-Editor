const { contextBridge, ipcRenderer } = require("electron");
const { rename } = require("original-fs");

contextBridge.exposeInMainWorld("fs", {
    list: () => ipcRenderer.invoke("fs-list"),
    read: (path) => ipcRenderer.invoke("fs-read", path),
    writeFile: (path, content) => ipcRenderer.invoke("fs-write-file", path, content),
    mkdir: (path) => ipcRenderer.invoke("fs-mkdir", path),
    delete: (path) => ipcRenderer.invoke("fs-delete", path),
    pathInfo: (path) => ipcRenderer.invoke("fs-path-info", path),
    rename: (from, to) => ipcRenderer.invoke("fs-rename", from, to),
    exists: (path) => ipcRenderer.invoke("fs-exists", path)
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