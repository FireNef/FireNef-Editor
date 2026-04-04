import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import { RapierController } from "./rapierController.js";
import { RapierRigidBody } from "./rapierRigidBody.js";
import * as RAPIER from "rapier";
import * as THREE from "three";

export class RapierCollider extends Component {
    constructor(name = "Rapier Collider") {
        super(name);

        const coreAttribute = new Attribute("Core");
        coreAttribute.addField("Density", "number", 1.0, { min: 0 });
        coreAttribute.addField("Friction", "number", 1.0, { min: 0 });
        coreAttribute.addField("Restitution", "number", 0.0, { min: 0, max: 1 });
        coreAttribute.addField("Is Sensor", "boolean", false);
        coreAttribute.addField("Collision Group", "number", 1, { min: 0, max: 65535, noRange: true });
        coreAttribute.addField("Collision Mask", "number", 65535, { min: 0, max: 65535, noRange: true });
        this.attributes.push(coreAttribute);

        const transformOffsetAttribute = new Attribute("Transform Offset");
        transformOffsetAttribute.addField("Position Offset", "vec3", { x: 0, y: 0, z: 0 });
        transformOffsetAttribute.addField("Rotation Offset", "euler", { x: 0, y: 0, z: 0, order: "XYZ" });
        this.attributes.push(transformOffsetAttribute);

        this.desc = null;
        this.collider = null;

        this.world = null;
        this.host = null;
    }

    static type = "rapierCollider";
    static baseType = "rapierCollider";
    static group = "3D Physics";
    static {
        this.hideInGroup = true;
    }

    static icon = ["object3d", ...super.icon];

    updateAllProperties() {
        this.updateDesc();
        this.updateCore();
        this.updateTransform();
    }
    
    start() {
        this.world = this.getFirstParentOfType(RapierController)?.world;

        this.updateDesc();

        if (!this.world) return;

        if (!this.desc) {
            console.warn(`${this.name}: ColliderDesc not set. Did you forget to define shape?`);
            return;
        }

        this.host = this.getFirstParentOfType(RapierRigidBody)?.rigidBody;

        if (this.host) {
            this.collider = this.world.createCollider(this.desc, this.host);
        } else {
            this.collider = this.world.createCollider(this.desc);
        }
    }

    updateDescCore() {
        if (!this.desc) return;

        this.desc.setDensity(this.getAttr("Core", "Density"));
        this.desc.setFriction(this.getAttr("Core", "Friction"));
        this.desc.setRestitution(this.getAttr("Core", "Restitution"));
        this.desc.setSensor(this.getAttr("Core", "Is Sensor"));

        const group = this.getAttr("Core", "Collision Group");
        const mask  = this.getAttr("Core", "Collision Mask");

        const packed = (group << 16) | mask;

        this.desc.setCollisionGroups(packed);
    }

    updateDescTransform() {
        if (!this.desc) return;

        const translation = this.getAttr("Transform Offset", "Position Offset");
        this.desc.setTranslation(translation.x, translation.y, translation.z);

        const rotation = this.getAttr("Transform Offset", "Rotation Offset");
        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z),
            rotation.order
        );

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);
        this.desc.setRotation({x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w});
    }

    updateDesc() {
        this.updateDescCore();
        this.updateDescTransform();
    }

    updateCore() {
        if (!this.collider) return;

        this.collider.setDensity(this.getAttr("Core", "Density"));
        this.collider.setFriction(this.getAttr("Core", "Friction"));
        this.collider.setRestitution(this.getAttr("Core", "Restitution"));
        this.collider.setSensor(this.getAttr("Core", "Is Sensor"));

        const group = this.getAttr("Core", "Collision Group");
        const mask  = this.getAttr("Core", "Collision Mask");

        const packed = (group << 16) | mask;

        this.collider.setCollisionGroups(packed);
    }

    updateTransform() {
        if (!this.collider) return;

        const translation = this.getAttr("Transform Offset", "Position Offset");
        this.collider.setTranslation(translation.x, translation.y, translation.z);

        const rotation = this.getAttr("Transform Offset", "Rotation Offset");
        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z),
            rotation.order
        );

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);
        this.collider.setRotation({x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w});
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Core") this.updateCore();
        if (attribute == "Transform Offset") this.updateTransform();
    }

    visiblityChanged() {
        if (this.collider) this.collider.setEnabled(this.visible);
        if (this.desc) this.desc.setEnabled(this.visible);
    }

    rebuildCollider() {
        if (!this.started) return;
        if (!this.world) return;

        if (this.collider) {
            this.world.removeCollider(this.collider, true);
            this.collider = null;
        }

        this.updateDesc();

        this.collider = this.host
            ? this.world.createCollider(this.desc, this.host)
            : this.world.createCollider(this.desc);

        this.updateCore();
        this.updateTransform();

        this.collider.setEnabled(this.visible);
    }
}