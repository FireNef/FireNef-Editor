import { screen, app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { spawn } from "child_process";

import { checkNpmOrDie } from './firenefEditorTools.js';
import { projectConfig, projectDir, projectsPath } from './basePaths.js';

import './fsBridge.js';
import './protocols.js';

const createWindow = () => {

    const cursorPoint = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursorPoint);

    const { x, y, width, height } = display.workArea;

    const windowSettings = projectConfig.windowSettings ?? {
        width: 960,
        height: 720,
        minWidth: 400,
        minHeight: 270,
        autoHideMenuBar: true,
        icon: "renderer/assets/icon",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandboxed: false,
            webgpu: true
        }
    };

    if (windowSettings.icon) windowSettings.icon = path.join(projectDir, windowSettings.icon + (process.platform == "win32" ? ".ico" : ".png"));
    if (windowSettings.webPreferences.preload) windowSettings.webPreferences.preload = path.join(projectDir, windowSettings.webPreferences.preload);

    windowSettings.x = x + (width - windowSettings.width) / 2;
    windowSettings.y = y + (height - windowSettings.height) / 2;

    const win = new BrowserWindow(windowSettings);

    ipcMain.on("win:minimize", () => win.minimize())
    ipcMain.on("win:maximize", () => {
        win.isMaximized() ? win.unmaximize() : win.maximize()
    })
    ipcMain.on("win:close", () => win.close())

    win.loadFile(path.join(projectDir, "renderer", "index.html"));
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
    spawn("node", [path.resolve(projectDir, "src", "deleteFolder.js"), projectsPath], {
        detached: true,
        stdio: "ignore"
    }).unref();
});