import * as FIRENEF from "firenef";

export class SelectProjectItemScript extends FIRENEF.Script {
    constructor(name = "Select Project Item Script") {
        super(name);

        const projectAttribute = new FIRENEF.Attribute("Project");
        projectAttribute.addField("String", "name", "");
        this.attributes.push(projectAttribute);

        this.element = null;
        this.editor = null;
        
        this.nameElement = null;
        this.iconElement = null;
        this.creationDateElement = null;
        this.modifiedDateElement = null;
        this.sizeElement = null;
        this.pathElement = null;
        this.deleteButton = null;
        this.openButton = null;
    }

    start() {
        this.editor = window.firenefEditor;
        this.element = this.parent.element;

        this.nameElement = this.element.querySelector("#name");
        this.iconElement = this.element.querySelector("#icon");
        this.creationDateElement = this.element.querySelector("#createDate");
        this.modifiedDateElement = this.element.querySelector("#modifiedDate");
        this.sizeElement = this.element.querySelector("#size");
        this.pathElement = this.element.querySelector("#path");
        this.deleteButton = this.element.querySelector("#deleteButton");
        this.openButton = this.element.querySelector("#openButton");

        this.deleteButton.addEventListener("click", () => this.editor.deleteProject(this.getAttributeFieldValue(0, 0)));
        this.openButton.addEventListener("click", () => this.editor.openProject(this.getAttributeFieldValue(0, 0)));

        this.parent.visible = false;

        this.editor.getProjectInfo(this.getAttributeFieldValue(0, 0)).then((data) => {
            this.nameElement.textContent = data.name;
            this.creationDateElement.textContent = `Created: ${this.convertToReadableDate(data.createdAt)}`;
            this.modifiedDateElement.textContent = `Modified: ${this.convertToReadableDate(data.modifiedAt)}`;
            this.sizeElement.textContent = `${Math.floor(data.size / (1024 * 1024))} MB`;
            this.pathElement.textContent = `documents/firenef/${data.path}`;
            this.parent.visible = true;
        });

        this.editor.getProjectIconAsUrl(this.getAttributeFieldValue(0, 0)).then((data) => {
            this.iconElement.src = data; 
        });
    }

    convertToReadableDate(timestamp) {
        const date = new Date(timestamp);
        
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        };

        return date.toLocaleString(undefined, options);
    }
}