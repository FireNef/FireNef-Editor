import * as FIRENEF from "firenef";
import * as THREE from "three";

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

        this.onProjectLoaded = [];

        this.imports = {};

        this.contextMenu = {};

        this.drag = false;
        this.currentDrag = null;
        this.dragInputs = {};

        this.currentSelection = null;

        document.addEventListener("mouseup", () => { this.clearDrag(); });
        document.addEventListener("keydown", (e) => { 
            if (e.key == "Escape") {
                this.clearContextMenu(); 
                this.clearOverlay();
                this.clearDrag();
            }
        });
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

    setDrag(drag, hideFunction = null, inputs = {}) {
        this.currentDrag = drag;
        this.drag = true;
        this.dragInputs = inputs;

        if (hideFunction && typeof hideFunction == "function") this.dragInputs.hide = hideFunction;
    }

    clearDrag() {
        if (this.dragInputs.hide && typeof this.dragInputs.hide == "function") this.dragInputs.hide();

        this.currentDrag = null;
        this.drag = false;
        this.dragInputs = {};
    }

    setCurrentSelection(selection) {
        if (this.currentSelection?.deselect) this.currentSelection.deselect();
        this.currentSelection = selection;
    }

    async saveProject() {
        const projectName = this.currentProject;

        await this.saveModules(projectName);
    }

    async saveModules(projectName) {
        const projectPath = `projects/${projectName}/renderer`;

        const engineConfig = await this.getExternalJson(`${projectPath}/src/configs/config.json`);
        const projectModulePath = `${projectPath}/src/${engineConfig.mainModulePath}`;

        await window.fs.writeFile(projectModulePath, JSON.stringify(this.projectModules.project, null, 4));

        for (const modulePath in this.projectModules) {
            if (modulePath == "project") continue;

            const fullPath = `${projectPath}/src/${modulePath}`;

            await window.fs.writeFile(fullPath, JSON.stringify(this.projectModules[modulePath], null, 4));
        }
    }

    async createProject(name, successFunction) {
        if (name == "") return {error: "Name cannot be empty."};
        if (!this.isPathSafe(name)) return {error: "Name contains invalid characters."};
        if (await this.projectExists(name)) return {error: "Project already exists."};

        if (successFunction && typeof successFunction == "function") successFunction();

        try {
            await window.fs.mkdir(`projects/${name}`);
            await window.firenefEditorTools.installElectronPreset("presets/electronPreset", name);
            await window.firenefEditorTools.installMainPreset("presets/mainPreset", name, "https://github.com/FireNef/FireNef-Core");

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

        const path = `projects/${projectName}/renderer/assets/icon`;
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
        
        this.imports = {};
        await this.storeImports(this.projectModules.project.imports);
        await this.storeImportsAsPaths(this.projectModules.project.imports);

        this.projectGroups = await this.getProjectGroups(this.imports);

        const componentIconMapping = await this.fetchFileAsText("./src/workspace/data/json/componentIconMapping.json").then(text => JSON.parse(text));
        await this.fetchFilesAsText(Object.values(componentIconMapping)).then(texts => {
            this.projectComponentIcons = Object.keys(componentIconMapping).reduce((acc, key, index) => {
                acc[key] = texts[index];
                return acc;
            }, {});
        });

        this.page = "project";

        this.onProjectLoaded.forEach(e => e());
    }

    async getProjectGroups(imports) {
        const groups = {};
        for (const importName in imports) {
            const importModule = imports[importName];
            const componentObject = { classObject: importModule, path: importName };
            if (!importModule) continue;
            if (!importName.startsWith(".")) continue;
            if (importModule.hideInGroup == undefined || importModule.hideInGroup) continue;
            if (!importModule.group) {
                if (!groups["Others"]) groups["Others"] = [];
                groups["Others"].push(componentObject);
                continue;
            }

            if (!groups[importModule.group]) groups[importModule.group] = [];
            groups[importModule.group].push(componentObject);
        }

        for (const componentName in FIRENEF) {
            const componentModule = FIRENEF[componentName];
            const componentObject = { classObject: componentModule, className: componentName };
            if (!componentModule) continue;
            if (componentModule.hideInGroup == undefined || componentModule.hideInGroup) continue;
            if (!componentModule.group) {
                if (!groups["Others"]) groups["Others"] = [];
                groups["Others"].push(componentObject);
                continue;
            }

            if (!groups[componentModule.group]) groups[componentModule.group] = [];
            groups[componentModule.group].push(componentObject);
        }

        return groups;
    }

    async getProjectModules(projectName) {
        if (!await this.projectExists(projectName)) return;

        const modules = {};

        const projectPath = `projects/${projectName}/renderer`;

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
                const base = `projects/${this.currentProject}/renderer/`;
                const child = this.resolvePath("./src/", i).replace(/^\/+/, '');

                const relativePath = (base + child).replace(/\/\.\//g, '/');
                const path = `firenef://${relativePath}`;

                const module = await import(path);

                if (!module.default) return {};

                const type = module.default.type;

                return {
                    [type]: module.default
                };
            })
        );

        this.imports = Object.assign({}, this.imports, ...componentsArray);
    }

    async storeImportsAsPaths(imports) {
        const componentsArray = await Promise.all(
            imports.map(async i => {
                const base = `projects/${this.currentProject}/renderer/`;
                const child = this.resolvePath("./src/", i).replace(/^\/+/, '');

                const relativePath = (base + child).replace(/\/\.\//g, '/');
                const path = `firenef://${relativePath}`;

                const module = await import(path);

                if (!module.default) return {};

                return {
                    [child]: module.default
                };
            })
        );

        this.imports = Object.assign({}, this.imports, ...componentsArray);
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
        if (typeof className === "function") {
            const name = this.getClassNameFromClass(className);
            if (!name) return className.type;
            return name;
        }

        if (FIRENEF[className]) {
            return this.getClassNameFromClass(FIRENEF[className]);
        }
        return className;
    }

    getClassBaseType(className) {
        if (typeof className === "function") {
            return className.baseType;
        }


        if (FIRENEF[className]) {
            return FIRENEF[className].baseType;
        }
        return className
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

    getClassObjectFromComponentJson(componentJson) {
        if (componentJson.path) {
            return this.imports[this.resolvePath("./src/", componentJson.path).replace(/^\/+/, '')];
        } else if (FIRENEF[componentJson.class]) {
            return FIRENEF[componentJson.class];
        } else {
            return null;
        }
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

    isClass(v) {
        return v instanceof Object && v.constructor && v.constructor.name !== "Object";
    }

    createNewComponentJson(className, classObject) {
        const newComponent = {};
        if (className.startsWith("./")) {
            newComponent.path = className;
        } else {
            newComponent.class = className;
        }
        
        newComponent.type = "component";
        newComponent.name = this.getClassNameFromClass(classObject);

        newComponent.enable = true;
        newComponent.visible = true;
        newComponent.hidden = false;

        newComponent.variables = {};
        newComponent.params = [];
        newComponent.children = [];

        const defaultAttributes = this.getClassDefaultAttributes(classObject);
        const formatedAttributes = [];
        for (const attribute of defaultAttributes) {
            const defaultFields = attribute.fields;
            const formatedFields = [];
            for (const field of defaultFields) {
                const type = field.type;
                const setType = field.setType;
                const value = field.value;
                const inputs = field.inputs || {};
                
                const newField = {};

                newField.comment = field.name;
                
                newField.type = type;
                if (setType == "three") newField.type = "variable";
                if (setType == "component" || setType == "texture") newField.type = "reference";

                if (inputs.defaultValue) {
                    newField.value = inputs.defaultValue;
                } else {
                    if (this.isClass(value)) {
                        formatedFields.push({});
                        continue;
                    }
                    newField.value = value;
                }

                formatedFields.push(newField);
            }
            formatedAttributes.push(formatedFields);
        }

        newComponent.attributes = formatedAttributes;

        return newComponent;
    }
}