import { Component } from "../component.js";
import { Attribute } from "../attributes.js";
import * as THREE from "#three";

export class Object3d extends Component {
    constructor(name = "Object 3D", allowTransform = true) {
        super(name);

        this.allowTransform = allowTransform
        this.object3D = new THREE.Object3D();
        this.object3D.name = name;

        if (allowTransform) {
            const transform = new Attribute("Transform");
            transform.addField("Position", "vec3", { x: 0, y: 0, z: 0 });
            transform.addField("Rotation", "euler", { x: 0, y: 0, z: 0, order: "XYZ" });
            transform.addField("Scale",    "vec3", { x: 1, y: 1, z: 1 });

            this.attributes.push(transform);

            this.forceRenderUpdate = false;

            this.prevTransform = {
                position: new THREE.Vector3(),
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(1, 1, 1)
            };

            this.currTransform = {
                position: new THREE.Vector3(),
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(1, 1, 1)
            };

            this.prevTransform.quaternion = new THREE.Quaternion();
            this.currTransform.quaternion = new THREE.Quaternion();
            this.renderQuaternion = new THREE.Quaternion();

        }
    }

    static group = "General 3D";
    static {
        this.hideInGroup = true;
    }

    appendChild(child) {
        super.appendChild(child);

        if (!(child instanceof Object3d)) return;

        const parentSpatial = this.findNearestSpatialParent();
        if (!parentSpatial) return;

        parentSpatial.object3D.add(child.object3D);
    }

    removeChild(child) {
        super.removeChild(child);

        if (!(child instanceof Object3d)) return;

        child.object3D.parent?.remove(child.object3D);
    }

    visiblityChanged() {
        this.object3D.visible = this.visible;
    }

    findNearestSpatialParent() {
        let p = this;
        while (p) {
            if (p instanceof Object3d) return p;
            p = p.parent;
        }
        return null;
    }

    get threeObject() {
        return this.object3D;
    }

    update() {
        if (!this.allowTransform) return;

        this.prevTransform.position.copy(this.currTransform.position);
        this.prevTransform.scale.copy(this.currTransform.scale);
        this.prevTransform.quaternion.copy(this.currTransform.quaternion);

        const p = this.getAttributeFieldValue(0, 0);
        const r = this.getAttributeFieldValue(0, 1);
        const s = this.getAttributeFieldValue(0, 2);

        this.currTransform.position.set(p.x, p.y, p.z);
        this.currTransform.scale.set(s.x, s.y, s.z);

        this.currTransform.rotation.set(
            THREE.MathUtils.degToRad(r.x),
            THREE.MathUtils.degToRad(r.y),
            THREE.MathUtils.degToRad(r.z),
            r.order
        );
        this.currTransform.quaternion.setFromEuler(this.currTransform.rotation);
    }

    renderUpdate(alpha = 1.0) {
        if (!this.allowTransform) return;
        if (!this.object3D) return;

        if (this.forceRenderUpdate) alpha = 1.0;

        this.object3D.position.lerpVectors(
            this.prevTransform.position,
            this.currTransform.position,
            alpha
        );

        this.renderQuaternion.slerpQuaternions(
            this.prevTransform.quaternion,
            this.currTransform.quaternion,
            alpha
        );

        this.object3D.quaternion.copy(this.renderQuaternion);

        this.object3D.scale.lerpVectors(
            this.prevTransform.scale,
            this.currTransform.scale,
            alpha
        );
    }

    set rotation({ x = 0, y = 0, z = 0, order = "XYZ" } = {}) {
        this.setAttributeFieldValue(0, 1, { x: x,  y: y, z: z, order: order });
    }

    set rotationOrder(order = "XYZ") {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: oldRotation.x, y: oldRotation.y, z: oldRotation.z, order: order });
    }

    set rotationX(rotation = 0) {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: rotation, y: oldRotation.y, z: oldRotation.z, order: oldRotation.order });
    }

    set rotationY(rotation = 0) {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: oldRotation.x, y: rotation, z: oldRotation.z, order: oldRotation.order });
    }

    set rotationZ(rotation = 0) {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: oldRotation.x, y: oldRotation.y, z: rotation, order: oldRotation.order });
    }

    rotateXBy(angle = 0) {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: oldRotation.x + angle, y: oldRotation.y, z: oldRotation.z, order: oldRotation.order });
    }

    rotateYBy(angle = 0) {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: oldRotation.x, y: oldRotation.y + angle, z: oldRotation.z, order: oldRotation.order });
    }

    rotateZBy(angle = 0) {
        const oldRotation = this.getAttributeFieldValue(0, 1);
        this.setAttributeFieldValue(0, 1, { x: oldRotation.x, y: oldRotation.y, z: oldRotation.z + angle, order: oldRotation.order });
    }

    get rotation() {
        return this.getAttributeFieldValue(0, 1);
    }

    get rotationX() {
        return this.getAttributeFieldValue(0, 1).x;
    }

    get rotationY() {
        return this.getAttributeFieldValue(0, 1).y;
    }

    get rotationZ() {
        return this.getAttributeFieldValue(0, 1).z;
    }

    get rotationOrder() {
        return this.getAttributeFieldValue(0, 1).order;
    }

    set position({ x = 0, y = 0, z = 0 } = {}) {
        this.setAttributeFieldValue(0, 0, { x: x, y: y, z: z });
    }

    set positionX(position = 0) {
        const oldPosition = this.getAttributeFieldValue(0, 0);
        this.setAttributeFieldValue(0, 0, { x: position, y: oldPosition.y, z: oldPosition.z });
    }

    set positionY(position = 0) {
        const oldPosition = this.getAttributeFieldValue(0, 0);
        this.setAttributeFieldValue(0, 0, { x: oldPosition.x,  y: position, z: oldPosition.z });
    }

    set positionZ(position = 0) {
        const oldPosition = this.getAttributeFieldValue(0, 0);
        this.setAttributeFieldValue(0, 0, { x: oldPosition.x, y: oldPosition.y, z: position });
    }

    moveXBy(amount = 0) {
        const oldPosition = this.getAttributeFieldValue(0, 0);
        this.setAttributeFieldValue(0, 0, { x: oldPosition.x + amount, y: oldPosition.y, z: oldPosition.z });
    }

    moveYBy(amount = 0) {
        const oldPosition = this.getAttributeFieldValue(0, 0);
        this.setAttributeFieldValue(0, 0, { x: oldPosition.x, y: oldPosition.y + amount, z: oldPosition.z });
    }

    moveZBy(amount = 0) {
        const oldPosition = this.getAttributeFieldValue(0, 0);
        this.setAttributeFieldValue(0, 0, { x: oldPosition.x, y: oldPosition.y, z: oldPosition.z + amount });
    }

    get position() {
        return this.getAttributeFieldValue(0, 0);
    }

    get positionX() {
        return this.getAttributeFieldValue(0, 0).x;
    }

    get positionY() {
        return this.getAttributeFieldValue(0, 0).y;
    }

    get positionZ() {
        return this.getAttributeFieldValue(0, 0).z;
    }

    set scale({ x = 1, y = 1, z = 1 } = {}) {
        this.setAttributeFieldValue(0, 2, { x: x, y: y, z: z });
    }

    set scaleX(scale = 1) {
        const oldScale = this.getAttributeFieldValue(0, 2);
        this.setAttributeFieldValue(0, 2, { x: scale, y: oldScale.y, z: oldScale.z });
    }

    set scaleY(scale = 1) {
        const oldScale = this.getAttributeFieldValue(0, 2);
        this.setAttributeFieldValue(0, 2, { x: oldScale.x, y: scale, z: oldScale.z });
    }

    set scaleZ(scale = 1) {
        const oldScale = this.getAttributeFieldValue(0, 2);
        this.setAttributeFieldValue(0, 2, { x: oldScale.x, y: oldScale.y, z: scale });
    }

    get scale() {
        return this.getAttributeFieldValue(0, 2);
    }

    get scaleX() {
        return this.getAttributeFieldValue(0, 2).x;
    }

    get scaleY() {
        return this.getAttributeFieldValue(0, 2).y;
    }

    get scaleZ() {
        return this.getAttributeFieldValue(0, 2).z;
    }
}
