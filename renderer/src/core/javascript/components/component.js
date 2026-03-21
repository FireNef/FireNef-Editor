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

        this.id = null;
    }

    static icon = ["component"];
    static group = "General";
    
    static baseType = "component";
    static type = "component";

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
        this.childAdded(child);
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index === -1) return console.warn("Cannot remove none existing child");
        if (child.parentRemoved && typeof child.parentRemoved === "function") child.parentRemoved();

        this.children.splice(index, 1);
        child.parent = null;
        this.childRemoved(child);
    }

    removeParent() {
        if (this.parent) {
            if (this.parent.removeChild && typeof this.parent.removeChild === "function") {
                this.parent.removeChild(this);
            } else {
                this.parentRemoved();
                if (this.parent.childRemoved && typeof this.parent.childRemoved === "function") this.parent.childRemoved(this);
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

    childRemoved(child) {

    }

    childAdded(child) {

    }

    hasChild(child) {
        return this.children.includes(child);
    }

    hasChildren() {
        return this.children.length !== 0;
    }

    namedChild(name) {
        return this.children.find(c => c.name === name);
    }

    get child() {
        const grouped = {};

        for (const instance of this.children) {
            const key = instance.constructor.baseType ?? instance.constructor.type;

            if (!key) continue;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(instance);
        }

        const result = {};

        for (const key in grouped) {
            result[key] = new Proxy(grouped[key], {
                set() {
                    throw new Error(`${key} children are read-only`);
                },
                get(target, prop) {
                    const blocked = [
                        "push",
                        "pop",
                        "shift",
                        "unshift",
                        "splice",
                        "sort",
                        "reverse"
                    ];

                    if (blocked.includes(prop)) {
                        return () => {
                            throw new Error(`${key} children are read-only`);
                        };
                    }

                    return target[prop];
                }
            });
        }

        return Object.freeze(result);
    }

    setID(id) {
        this.id = id;
        const componentController = this.getFirstParentOfType(ComponentController);
        componentController?.updateComponentID(this);
    }

    getComponentWithID(id) {
        if (this.id === id) return this;
        return this.getFirstParentOfType(ComponentController)?.getComponentWithID(id);
    }

    getChildrenRunOrder() {
        return this.children;
    }

    deepClone() {
        const cloned = new this.constructor(this.name);

        cloned.attributes = this.attributes.map(attr => attr.deepClone());

        for (const child of this.children) {
            const childClone = child.deepClone();
            childClone.parent = cloned;
            cloned.children.push(childClone);
        }

        cloned.updateAllProperties();

        return cloned;
    }

    updateAllProperties() {

    }

    async onRenderInit() {

    }

    async traverse(callback) {
        await callback(this);
        for (const child of this.children) {
            await child.traverse(callback);
        }
    }

    getAttributeFieldValue(attribute = 0, field = 0) {
        return this.attributes[attribute].fields[field].value;
    }

    attribute(name) {
        for (const attr of this.attributes) {
            if (attr.name.toLowerCase() === name.toLowerCase()) return attr;
        }
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}) {
        return await this.attributes[attribute].fields[field].setValue(value, type, { component: this, ...inputs });
    }

    setNonAsyncAttributeFieldValue(attribute = 0, field = 0, value, type, inputs = {}, disableComponent = false) {
        if (disableComponent) {
            this.enable = false;
            this.attributeDisableValue++;
        };
        this.attributes[attribute].fields[field].setValue(value, type, { component: this, ...inputs }).then(() => {
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

    getViewportCapableComponent() {
        if (!this.parent) return;
        if (!this.parent.getViewportCapableComponent) return;
        return this.parent.getViewportCapableComponent();
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

export class ComponentController extends Component {
    constructor(name = "Component Controller") {
        super(name);

        this.updateDepthLimit = 100000;

        this.idTable = {};
    }

    static icon = ["componentController", ...super.icon];

    static baseType = "componentController"
    static type = "componentController"

    update() {
        if (!this.enable) return;
        this.runChildrenCluster(this.children);
    }

    runChildrenCluster(children, depth = 0) {
        if (!children) return;
        if (children.length === 0) return;
        if (depth >= this.updateDepthLimit) return;

        for (const child of children) {
            if (!child.enable) continue;
            this.runChild(child);
            this.runChildrenCluster(child.getChildrenRunOrder(), depth + 1);
        }
    }

    runChild(child) {
        if (child.start && typeof child.start === "function") {
            if (!child.started) {
                try { child.start(); } catch (e) { console.error(e); }
                child.started = true;
            }
        }
        if (child.update && typeof child.update === "function") {
            try { child.update(); } catch (e) { console.error(e); }
        }
    }

    updateComponentID(component) {
        if (Object.values(this.idTable).includes(component)) {
            delete this.idTable[component.id];
        }
        this.idTable[component.id] = component;
    }

    getComponentWithID(id) {
        return this.idTable[id] ?? null;
    }
}