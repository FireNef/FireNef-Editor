import { screen, app, BrowserWindow } from 'electron';
import path from 'path';

import { projectConfig, projectDir } from './basePaths.js';

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
            sandboxed: true,
            webgpu: true
        }
    };

    if (windowSettings.icon) windowSettings.icon = path.join(projectDir, windowSettings.icon + (process.platform == "win32" ? ".ico" : ".png"));
    if (windowSettings.webPreferences.preload) windowSettings.webPreferences.preload = path.join(projectDir, windowSettings.webPreferences.preload);

    windowSettings.x = x + (width - windowSettings.width) / 2;
    windowSettings.y = y + (height - windowSettings.height) / 2;

    const win = new BrowserWindow(windowSettings);

    win.loadFile(path.join(projectDir, "renderer", "index.html"));
}

app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-unsafe-webgpu");

app.whenReady().then(() => {
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