import * as FIRENEF from "#firenef";
import * as THREE from "#three";

export class FirenefEditor {
    constructor() {
        this.overlay = false;
        this.currentOverlay = null;
        this.overlayInputs = {};
        
        this.projectAmount = 0;
        this.getProjects().then((projects) => this.projectAmount = projects.length);

        this.page = "start";

        this.currentProject = null;
        this.projectModules = {};
        this.projectGroups = {};
        this.projectComponentIcons = {};

        this.imports = {};

        this.contextMenu = {};
    }

    setOverlay(overlay, inputs = {}) {
        this.currentOverlay = overlay;
        this.overlay = true;
        this.overlayInputs = inputs;
    }

    clearOverlay() {
        this.currentOverlay = null;
        this.overlay = false;
        this.overlayInputs = {};
    }

    setContextMenu(menu, position, onClose = null, inputs = {}) {
        this.clearContextMenu();

        this.contextMenu[menu] = {
            position: position,
            inputs: inputs,
            onClose: onClose
        };
    }

    addContextMenu(menu, position, onClose = null, inputs = {}) {
        this.contextMenu[menu] = {
            position: position,
            inputs: inputs,
            onClose: onClose
        };
    }

    removeContextMenu(menu) {
        if (this.contextMenu[menu]) {
            if (this.contextMenu[menu].onClose && typeof this.contextMenu[menu].onClose == "function") this.contextMenu[menu].onClose();
            delete this.contextMenu[menu];
        }
    }

    clearContextMenu() {
        for (const menu in this.contextMenu) {
            const menuValues = this.contextMenu[menu];
            if (menuValues?.onClose && typeof menuValues.onClose == "function") menuValues.onClose();
        }
        this.contextMenu = {};
    }

    async createProject(name, successFunction) {
        if (name == "") return {error: "Name cannot be empty."};
        if (!this.isPathSafe(name)) return {error: "Name contains invalid characters."};
        if (await this.projectExists(name)) return {error: "Project already exists."};

        if (successFunction && typeof successFunction == "function") successFunction();

        try {
            await window.fs.mkdir(`projects/${name}`);
            await window.firenefEditorTools.installElectronPreset("firenef/presets/electronPreset", `projects/${name}`, name);
            await window.firenefEditorTools.installMainPreset("firenef/presets/mainPreset", `projects/${name}`, name, "https://github.com/FireNef/FireNef-Core");
            await window.firenefEditorTools.installLoaderPreset("firenef/presets/loaderPreset", `projects/${name}`, name);

            this.projectAmount++;

            return {success: "Project created."};
        } catch (err) {
            console.error(err);
            return {error: err.message};
        }
    }

    async deleteProject(name) {
        this.setOverlay("confirm", {message: "Are you sure you want to delete this project?\nThis action cannot be undone.", onConfirm: async () => {

            let dots = "";
            for (let i = 0; i < 10; i++) {
                dots += ".";
                if (!await window.fs.exists(`projects/${dots}${name}`)) break;
            }
            
            window.fs.rename(`projects/${name}`, `projects/${dots}${name}`);
            this.projectAmount--;
        }});
    }

    async projectExists(name) {
        const appData = await window.fs.list();
        const projects = appData.filter(e => e.type == "dir" && e.path.startsWith("projects")).map(e => e.children)[0];
        const projectNames = projects.filter(e => e.type == "dir").map(e => e.path.split("/").pop());
        return projectNames.includes(name);
    }

    async getProjectInfo(projectName) {
        if (!await this.projectExists(projectName)) return;

        const path = `projects/${projectName}`;
        if (!await window.fs.exists(path)) return;
        const data = await window.fs.pathInfo(path);
        data.path = path;
        return data;
    }

    async getProjectIconAsUrl(projectName) {
        if (!await this.projectExists(projectName)) return;

        let blob;

        const path = `projects/${projectName}/${projectName}/assets/icon`;
        if (await window.fs.exists(path + ".svg")) {
            const data = await window.fs.read(path + ".svg");
            blob = new Blob([data], { type: 'image/svg+xml' });
            
        } else if (await window.fs.exists(path + ".png")) {
            const data = await window.fs.read(path + ".png");
            blob = new Blob([data], { type: 'image/png' });

        } else if (await window.fs.exists(path + ".ico")) {
            const data = await window.fs.read(path + ".ico");
            blob = new Blob([data], { type: 'image/x-icon' });
            
        } else return;

        const url = URL.createObjectURL(blob);
        return url;
    }

    async getProjects() {
        const appData = await window.fs.list();

        const projects = appData
            .filter(e => e.type === "dir" && e.path.startsWith("projects"))
            .map(e => e.children)[0];

        if (!projects) return [];

        const projectNames = projects
            .filter(e => e.type === "dir" && !e.path.split("/").pop().startsWith("."))
            .map(e => e.path.split("/").pop());

        return projectNames;
    }

    isPathSafe(text) {
        return !/[\\\/:*?"<>| ]/.test(text);
    }

    async openProject(projectName) {
        if (!await this.projectExists(projectName)) return;
        this.clearOverlay();
        this.currentProject = projectName;

        this.projectModules = await this.getProjectModules(projectName);
        await this.storeImports(this.projectModules.project.imports);

        this.projectGroups = await this.getProjectGroups(this.imports);

        const componentIconMapping = await this.fetchFileAsText("./src/workspace/data/json/componentIconMapping.json").then(text => JSON.parse(text));
        await this.fetchFilesAsText(Object.values(componentIconMapping)).then(texts => {
            this.projectComponentIcons = Object.keys(componentIconMapping).reduce((acc, key, index) => {
                acc[key] = texts[index];
                return acc;
            }, {});
        });

        console.log(this.projectGroups);

        this.page = "project";
    }

    async getProjectGroups(imports) {
        const groups = {};
        for (const importName in imports) {
            const importModule = imports[importName];
            if (!importModule) continue;
            if (importModule.hideInGroup == undefined || importModule.hideInGroup) continue;
            if (!importModule.group) {
                if (!groups["Others"]) groups["Others"] = [];
                groups["Others"].push(importModule);
                continue;
            }

            if (!groups[importModule.group]) groups[importModule.group] = [];
            groups[importModule.group].push(importModule);
        }

        for (const componentName in FIRENEF) {
            const componentModule = FIRENEF[componentName];
            if (!componentModule) continue;
            if (componentModule.hideInGroup == undefined || componentModule.hideInGroup) continue;
            if (!componentModule.group) {
                if (!groups["Others"]) groups["Others"] = [];
                groups["Others"].push(componentModule);
                continue;
            }

            if (!groups[componentModule.group]) groups[componentModule.group] = [];
            groups[componentModule.group].push(componentModule);
        }

        return groups;
    }

    async getProjectModules(projectName) {
        if (!await this.projectExists(projectName)) return;

        const modules = {};

        const projectPath = `projects/${projectName}/${projectName}`;

        const engineConfig = await this.getExternalJson(`${projectPath}/src/configs/config.json`);
        const projectModulePath = `${projectPath}/src/${engineConfig.mainModulePath}`;

        modules.project = await this.getExternalJson(projectModulePath);

        await this.walkModule(projectPath, modules, modules.project.updater ?? []);

        return modules;
    }

    async walkModule(projectPath, moduleCollection, moduleChildren) {
        for (const module of moduleChildren) {
            if (module.type == "module") {
                const path = `${projectPath}/src/${module.path}`;
                if (!await window.fs.exists(path)) continue;
                if (moduleCollection[module.path]) continue;
                moduleCollection[module.path] = await this.getExternalJson(path);
                if (moduleCollection[module.path].children) await this.walkModule(projectPath, moduleCollection, moduleCollection[module.path].children);
            }
            if (module.type == "component") {
                if (module.children) await this.walkModule(projectPath, moduleCollection, module.children);
            }
        }
    }

    async getExternalJson(path) {
        if (!await window.fs.exists(path)) return;
        const data = await window.fs.read(path);
        const text = new TextDecoder("utf-8").decode(data)
        return JSON.parse(text);
    }

    fetchNonAsyncFileAsText(path, callback) {
        fetch(path).then(r => r.text()).then(text => callback(text));
    }

    fetchNonAsyncFilesAsText(paths, callback) {
        let textsUnsorted = {};
        let fileLoadedAmount = 0;

        for (const path of paths) {
            this.fetchNonAsyncFileAsText(path, (text) => {
                textsUnsorted[path] = text;
                fileLoadedAmount += 1;
                if (fileLoadedAmount == paths.length) {
                    callback(paths.map(path => textsUnsorted[path]));
                };
            });
        }
    }

    async fetchFileAsText(path) {
        return await fetch(path).then(r => r.text());
    }

    async fetchFilesAsText(paths) {
        const texts = await Promise.all(paths.map(path => this.fetchFileAsText(path)));
        return texts;
    }

    async storeImports(imports) {
        const componentsArray = await Promise.all(
            imports.map(async i => {
                const base = `projects/${this.currentProject}/${this.currentProject}/`;
                const child = this.resolvePath("./src/", i).replace(/^\/+/, '');

                const relativePath = (base + child).replace(/\/\.\//g, '/');
                console.log(`Importing module from ${relativePath}`);
                return await window.fs.loadModule(relativePath);
            })
        );

        this.imports = Object.assign({}, ...componentsArray);
    }

    resolvePath(sourcePath, path) {
        if (path.charAt(0) === "/" || path.charAt(0) === ".") {
            return path;
        }
        return sourcePath + path;
    }

    getClassIcon(className) {
        if (FIRENEF[className]) {
            return FIRENEF[className].icon;
        } else if (this.imports[className]) {
            return this.imports[className].icon;
        } else {
            return null;
        }
    }

    getClassName(className) {
        if (FIRENEF[className]) {
            return this.getClassNameFromClass(FIRENEF[className]);
        } else if (this.imports[className]) {
            return this.getClassNameFromClass(this.imports[className]);
        } else {
            return className;
        }
    }

    getClassNameFromClass(classObject) {
        let temp = new classObject();
        const name = temp.name;
        temp = null;
        return name;
    }

    getClassDefaultAttributes(classObject) {
        let temp = new classObject();
        const attributes = temp.attributes;
        temp = null;
        return attributes;
    }

    getGlobalVariableFromClass(classObject) {
        const className = classObject.name;
        if (FIRENEF[className]) {
            return "FIRENEF";
        }
        if (THREE[className]) {
            return "THREE";
        }
    }
}