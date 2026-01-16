export class FirenefEditor {
    constructor() {
        this.overlay = false;
        this.currentOverlay = null;
        this.overlayInputs = {};
        
        this.projectAmount = 0;
        this.getProjects().then((projects) => this.projectAmount = projects.length);

        this.page = "start";
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
        if (!this.projectExists(projectName)) return;

        const path = `projects/${projectName}`;
        if (!await window.fs.exists(path)) return;
        const data = await window.fs.pathInfo(path);
        data.path = path;
        return data;
    }

    async getProjectIconAsUrl(projectName) {
        if (!this.projectExists(projectName)) return;

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
}