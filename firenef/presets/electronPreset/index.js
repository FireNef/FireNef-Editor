import { app, BrowserWindow, ipcMain } from 'electron';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(path.join(__dirname, "project.json"))) throw new Error("Missing project.json");
const projectConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "project.json"), "utf8"));

const projectName = projectConfig.name ?? "project";

const BASE_DIR = app.getPath("userData")

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

    win.loadFile(path.join(__dirname, projectName, "index.html"));
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