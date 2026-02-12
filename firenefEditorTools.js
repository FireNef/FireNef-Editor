import { app, dialog, shell, BrowserWindow, ipcMain } from 'electron';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync, spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.join(app.getPath("documents"), "firenef");

export async function installElectronPreset(presetPath, projectPath, projectName) {
    await fsPromises.cp(path.join(__dirname, presetPath), path.join(BASE_DIR, projectPath), { recursive: true });

    const projectConfig = {
        name: projectName,
        windowSettings: {
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
        }
    };
    
    await fsPromises.writeFile(path.join(BASE_DIR, projectPath, "project.json"), JSON.stringify(projectConfig, null, 2));

    const packageJsonPath = path.join(BASE_DIR, projectPath, "package.json");
    const packageJson = JSON.parse(await fsPromises.readFile(packageJsonPath, "utf8"));
    packageJson.name = toPackageName(projectName);
    packageJson.author = app.getName();
    packageJson.productName = projectName;
    packageJson.imports = {
        "#firenef": `./${projectName}/src/core/javascript/firenef.js`,
        "#three": `./${projectName}/src/core/three.js/v181/three.webgpu.min.js`
    },
    await fsPromises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    await runNpmInstall(path.join(BASE_DIR, projectPath));
}

export async function installMainPreset(presetPath, projectPath, projectName, coreUrl) {
    await fsPromises.cp(path.join(__dirname, presetPath), path.join(BASE_DIR, projectPath, projectName), { recursive: true });
    
    const sourcePath = path.join(BASE_DIR, projectPath, projectName, "src");
    const workspacePath = path.join(sourcePath, "workspace");
    await fsPromises.mkdir(path.join(sourcePath, "configs"));
    await fsPromises.mkdir(workspacePath);
    await fsPromises.mkdir(path.join(workspacePath, "scripts"));
    await fsPromises.mkdir(path.join(workspacePath, "modules"));
    await fsPromises.mkdir(path.join(workspacePath, "components"));

    await fsPromises.mkdir(path.join(sourcePath, "core"));
    await importCore(coreUrl, path.join(sourcePath, "core"));

    const config = {
        maxUps: 60,
        maxFps: 0,
        vsync: true,
        resolution: {
            width: 1920,
            height: 1080
        },
        mainModulePath: "workspace/modules/project.json",
        sourcePath: "./src/"
    };

    await fsPromises.writeFile(path.join(sourcePath, "configs", "config.json"), JSON.stringify(config, null, 2));

    const projectModule = {
        imports: [],
        updater: []
    };

    await fsPromises.writeFile(path.join(workspacePath, "modules", "project.json"), JSON.stringify(projectModule, null, 2));
}

export async function installLoaderPreset(presetPath, projectPath, projectName) {
    await fsPromises.cp(path.join(__dirname, presetPath), path.join(BASE_DIR, projectPath, projectName, "src", "loader"), { recursive: true });
}

function toPackageName(input) {
    let name = input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-._]/g, "")
        .replace(/^[._]+/, "")
        .replace(/-+/g, "-");

    if (name.length === 0) {
        name = "my-package";
    }

    if (name.length > 214) {
        name = name.slice(0, 214);
    }

    return name;
}

async function importCore(coreUrl, targetPath) {
    await cloneRepo(coreUrl, targetPath);
}

async function cloneRepo(repoUrl, targetFolder, timeoutMs = 30000) {
    const targetPath = path.resolve(targetFolder);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const { stdout } = await execAsync(
            `git clone "${repoUrl}" "${targetPath}"`,
            { signal: controller.signal }
        );

        console.log(stdout);
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("Git clone timed out");
        }

        throw err;
    } finally {
        clearTimeout(timer);
    }
}

export function runNpmInstall(projectPath, onData) {
    return new Promise((resolve, reject) => {
        const command = process.platform === "win32" ? "npm.cmd" : "npm";

        // Save original CWD
        const originalCwd = process.cwd();

        try {
            // Temporarily move Electron CWD to a safe location
            process.chdir(app.getPath("userData"));

            const child = spawn(command, ["install"], {
                cwd: projectPath, // still installs in project folder
                shell: true
            });

            child.stdout.on("data", data => onData?.(data.toString()));
            child.stderr.on("data", data => onData?.(data.toString()));

            child.on("error", err => {
                // Restore CWD on error
                process.chdir(originalCwd);
                reject(err);
            });

            child.on("close", code => {
                // Restore original CWD
                process.chdir(originalCwd);

                if (code === 0) resolve();
                else reject(new Error(`npm install failed (${code})`));
            });
        } catch (err) {
            // Ensure CWD is restored if something throws
            process.chdir(originalCwd);
            reject(err);
        }
    });
}

export function checkNpmOrDie() {
    const command = process.platform === "win32" ? "npm.cmd" : "npm";

    const result = spawnSync(command, ["--version"], {
        shell: true,
        stdio: "ignore"
    });

    // console.log(result);

    if (result.error || result.status !== 0) {
        dialog.showMessageBoxSync({
            type: "error",
            title: "npm not found",
            message: "Node.js / npm is required",
            detail:
                "FireNef requires Node.js (which includes npm).\n\n" +
                "Please install Node.js and restart FireNef.",
            buttons: ["Open Node.js Website", "Exit"],
            defaultId: 0,
            cancelId: 1
        });

        shell.openExternal("https://nodejs.org/");
        app.quit();
        return false;
    }

    return true;
}