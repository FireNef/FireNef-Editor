import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import * as PIXI from "pixi";

export class Object2d extends Component {
    constructor(name = "Object 2d", allowTransform = true) {
        super(name);

        this.allowTransform = allowTransform;
        this.object2D = new PIXI.Container();
        this.object2D.name = name;

        if (allowTransform) {
            const transform = new Attribute("Transform");
            transform.addField("Position", "vec2", { x: 0, y: 0 });
            transform.addField("Rotation", "float", 0, { min: -180, max: 180 });
            transform.addField("Scale", "vec2", { x: 1, y: 1 });

            this.attributes.push(transform);

            this.forceRenderUpdate = false;

            this.prevTransform = {
                position: new PIXI.Point(),
                rotation: 0,
                scale: new PIXI.Point(1, 1)
            };

            this.currTransform = {
                position: new PIXI.Point(),
                rotation: 0,
                scale: new PIXI.Point(1, 1)
            };
        }
    }

    static group = "General 2D";
    static {
        this.hideInGroup = true;
    }

    static baseType = "object2D"
    static type = "object2D"

    static icon = ["object2d", ...super.icon]

    appendChild(child) {
        super.appendChild(child);

        if (!(child instanceof Object2d)) return;
        if (!(child.object2D instanceof PIXI.Container)) return;

        const parentSpatial = this.findNearestSpatialParent();
        if (!parentSpatial) return;

        parentSpatial.object2D.addChild(child.object2D);
    }

    removeChild(child) {
        super.removeChild(child);

        if (!(child instanceof Object2d)) return;
        if (!(child.object2D instanceof PIXI.Container)) return;

        child.object2D.parent?.removeChild(child.object2D);
    }

    visiblityChanged() {
        this.object2D.visible = this.visible;
    }

    findNearestSpatialParent(start = this) {
        let p = start;
        while (p) {
            if (p instanceof Object2d) return p;
            p = p.parent;
        }
        return null;
    }

    get pixiObject() {
        return this.object2D;
    }

    start() {
        if (!this.object2D.parent && this.object2D instanceof PIXI.Container) {
            const parentSpatial = this.findNearestSpatialParent(this.parent);
            if (parentSpatial) parentSpatial.object2D.addChild(this.object2D);
        }
    }

    updateTransform() {
        if (!this.allowTransform) return;

        this.prevTransform.position.copyFrom(this.currTransform.position);
        this.prevTransform.scale.copyFrom(this.currTransform.scale);
        this.prevTransform.rotation = this.currTransform.rotation;

        const p = this.getAttr("Transform", "Position");
        const r = this.getAttr("Transform", "Rotation");
        const s = this.getAttr("Transform", "Scale");

        this.currTransform.position.set(p.x, p.y);
        this.currTransform.scale.set(s.x, s.y);
        this.currTransform.rotation = r;
    }
    
    update() {
        this.updateTransform();
    }

    snapUpdateTransform() {
        this.forceRenderUpdate = true;
        this.updateTransform();
        this.forceRenderUpdate = false;
    }

    renderUpdate(alpha = 1.0) {
        if (!this.allowTransform) return;
        if (!this.object2D) return;

        if (this.forceRenderUpdate) alpha = 1.0;

        const prev = this.prevTransform;
        const curr = this.currTransform;

        this.object2D.position.x = prev.position.x + (curr.position.x - prev.position.x) * alpha;
        this.object2D.position.y = prev.position.y + (curr.position.y - prev.position.y) * alpha;

        this.object2D.scale.x = prev.scale.x + (curr.scale.x - prev.scale.x) * alpha;
        this.object2D.scale.y = prev.scale.y + (curr.scale.y - prev.scale.y) * alpha;

        let diff = curr.rotation - prev.rotation;
        
        diff = ((diff + 180) % 360);
        if (diff < 0) diff += 360;
        diff -= 180;

        const interpolatedDegrees = prev.rotation + diff * alpha;

        this.object2D.rotation = interpolatedDegrees * (Math.PI / 180);
    }

    set rotation(value = 0) {
        this.setAttr("Transform", "Rotation", value);
    }

    rotateBy(value = 0) {
        this.setAttr("Transform", "Rotation", this.rotation + value);
    }

    get rotation() {
        return this.getAttr("Transform", "Rotation");
    }

    set position({ x = 0, y = 0 } = {}) {
        this.setAttr("Transform", "Position", { x: x, y: y });
    }

    set positionX(position = 0) {
        const oldPosition = this.getAttr("Transform", "Position");
        this.setAttr("Transform", "Position", { x: position, y: oldPosition.y});
    }

    set positionY(position = 0) {
        const oldPosition = this.getAttr("Transform", "Position");
        this.setAttr("Transform", "Position", { x: oldPosition.x,  y: position});
    }

    moveXBy(amount = 0) {
        const oldPosition = this.getAttr("Transform", "Position");
        this.setAttr("Transform", "Position", { x: oldPosition.x + amount, y: oldPosition.y });
    }

    moveYBy(amount = 0) {
        const oldPosition = this.getAttr("Transform", "Position");
        this.setAttr("Transform", "Position", { x: oldPosition.x, y: oldPosition.y + amount });
    }

    moveForwardAlongRotationBy(amount = 0) {
        const oldPosition = this.getAttr("Transform", "Position");
        
        const radians = this.currTransform.rotation * (Math.PI / 180);

        const dx = Math.cos(radians) * amount;
        const dy = Math.sin(radians) * amount;

        this.setAttr("Transform", "Position", { x: oldPosition.x + dx, y: oldPosition.y + dy });
    }

    moveBackwardAlongRotationBy(amount = 0) {
        this.moveForwardAlongRotationBy(-amount);
    }

    moveRightAlongRotationBy(amount = 0) {
        const oldPosition = this.getAttr("Transform", "Position");
        
        const radians = (this.currTransform.rotation + 90) * (Math.PI / 180);

        const dx = Math.cos(radians) * amount;
        const dy = Math.sin(radians) * amount;

        this.setAttr("Transform", "Position", { x: oldPosition.x + dx, y: oldPosition.y + dy });
    }

    moveLeftAlongRotationBy(amount = 0) {
        this.moveRightAlongRotationBy(-amount);
    }

    get position() {
        return this.getAttr("Transform", "Position");
    }

    get positionX() {
        return this.getAttr("Transform", "Position").x;
    }

    get positionY() {
        return this.getAttr("Transform", "Position").y;
    }

    set scale({ x = 1, y = 1 } = {}) {
        this.setAttr("Transform", "Scale", { x: x, y: y });
    }

    set scaleX(scale = 1) {
        const oldScale = this.getAttr("Transform", "Scale");
        this.setAttr("Transform", "Scale", { x: scale, y: oldScale.y });
    }

    set scaleY(scale = 1) {
        const oldScale = this.getAttr("Transform", "Scale");
        this.setAttr("Transform", "Scale", { x: oldScale.x, y: scale });
    }

    get scale() {
        return this.getAttr("Transform", "Scale");
    }

    get scaleX() {
        return this.getAttr("Transform", "Scale").x;
    }

    get scaleY() {
        return this.getAttr("Transform", "Scale").y;
    }
}