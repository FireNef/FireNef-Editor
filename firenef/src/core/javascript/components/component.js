export class Component {
    constructor (name = "component") {
        this.name = name;

        this.children = [];
        this.parent = null;

        this.started = false;

        this._enable = true;
        this.targetEnable = true;

        this._visible = true;
        this.targetVisible = true;
        this._hidden = false;

        this.attributes = [];
        this.attributeDisableValue = 0;
    }

    static icon = ["component"];
    static group = "General";
    
    static #HIDE = Symbol("hideInGroup");

    static get hideInGroup() {
        if (this === Component) return true;
        return Object.hasOwn(this, Component.#HIDE)
            ? this[Component.#HIDE]
            : false;
    }

    static set hideInGroup(value) {
        this[Component.#HIDE] = Boolean(value);
    }

    appendChild(child) {
        if (this.children.includes(child)) return console.warn("Cannot add same child to Component twice.");
        if (child.parent) return console.warn("Cannot add component to multiple parents.");
        if (this === child) return console.warn("Cannot add itself as child.");

        this.children.push(child);
        child.parent = this;

        if (child.parentAdded && typeof child.parentAdded === "function") child.parentAdded();
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index === -1) return console.warn("Cannot remove none existing child");
        if (child.parentRemoved && typeof child.parentRemoved === "function") child.parentRemoved();

        this.children.splice(index, 1);
        child.parent = null;
    }

    removeParent() {
        if (this.parent) {
            if (this.parent.removeChild && typeof this.parent.removeChild === "function") {
                this.parent.removeChild(this);
            } else {
                this.parentRemoved();
                this.parent = null;
            }
        }
    }

    addParent(parent) {
        if (parent.appendChild && typeof parent.appendChild === "function") parent.appendChild(this);
    }

    parentRemoved() {

    }

    parentAdded() {

    }

    hasChild(child) {
        return this.children.includes(child);
    }

    hasChildren() {
        return this.children.length !== 0;
    }

    getChildrenRunOrder() {
        return this.children;
    }

    getAttributeFieldValue(attribute = 0, field = 0) {
        return this.attributes[attribute].fields[field].value;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        return await this.attributes[attribute].fields[field].setValue(value, type);
    }

    setNonAsyncAttributeFieldValue(attribute = 0, field = 0, value, type, disableComponent = false) {
        if (disableComponent) {
            this.enable = false;
            this.attributeDisableValue++;
        };
        this.attributes[attribute].fields[field].setValue(value, type).then(() => {
            if (disableComponent) {
                this.attributeDisableValue--;
                if (this.attributeDisableValue <= 0) {
                    this.attributeDisableValue = 0;
                    this.enable = true;
                }
            };
        });
    }

    get highestParent() {
        return this.parent ? (this.parent?.highestParent ?? this.parent) : this;
    }

    getFirstParentOfType(type) {
        let p = this.parent;
        while (p) {
            if (p instanceof type) return p;
            p = p.parent;
        }
        return null;
    }

    set visible(visible = true) {
        if (this._visible === visible) return;
        this.targetVisible = visible;
        this.updateVisiblity();
    }

    get visible() {
        return this._visible && this._enable && !this.hidden;
    }

    set hidden(hidden = false) {
        if (this._hidden === hidden) return;
        this._hidden = hidden;
        this.updateVisiblity();
    }

    get hidden() {
        return this._hidden;
    }

    updateVisiblity() {
        if (this.targetVisible && (!this.parent || this.parent._visible)) {
            this._visible = true;
            this.visiblityChanged();
            if (this.children.length > 0) this.children.forEach(c => c.updateVisiblity());
        } else {
            this._visible = false;
            this.visiblityChanged();
            if (this.children.length > 0) this.children.forEach(c => c.updateVisiblity());
        }
    }

    updateEnable() {
        if (this.targetEnable && (!this.parent || this.parent._enable)) {
            this._enable = true;
            this.enableChanged();
            this.visiblityChanged();
            if (this.children.length > 0) this.children.forEach(c => c.updateEnable());
        } else {
            this._enable = false;
            this.enableChanged();
            this.visiblityChanged();
            if (this.children.length > 0) this.children.forEach(c => c.updateEnable());
        }
    }

    visiblityChanged() {

    }

    enableChanged() {

    }

    set enable(enable = true) {
        if (this._enable === enable) return;
        this.targetEnable = enable;
        this.updateEnable();
    }

    get enable() {
        return this._enable;
    }

    start() {

    }

    update() {

    }
}