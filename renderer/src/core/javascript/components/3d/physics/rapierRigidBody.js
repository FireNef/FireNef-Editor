import { Component } from "../../component.js";
import { Attribute } from "../../attributes.js";
import { Object3d } from "../object3d.js";
import { RapierController } from "./rapierController.js";
import * as RAPIER from "rapier";
import * as THREE from "three";

export class RapierRigidBody extends Component {
    constructor(name = "Rapier Rigid Body") {
        super(name);

        const coreAttribute = new Attribute("Core");
        coreAttribute.addField("Type", "string", "Dynamic", { defaultValue: "Dynamic", options: ["Dynamic", "Fixed", "Kinematic"] });
        coreAttribute.addField("Gravity Scale", "number", 1.0);
        coreAttribute.addField("Linear Damping", "number", 0.0, { min: 0 });
        coreAttribute.addField("Angular Damping", "number", 0.0, { min: 0 });
        coreAttribute.addField("Can Sleep", "boolean", true);
        coreAttribute.addField("Start Awake", "boolean", true);
        coreAttribute.addField("CCD", "boolean", false);
        coreAttribute.addField("Auto Sync Transform", "boolean", true);

        this.attributes.push(coreAttribute);

        const velocityAttribute = new Attribute("Velocity");
        velocityAttribute.addField("Linear", "vec3", { x: 0.0, y: 0.0, z: 0.0 });
        velocityAttribute.addField("Angular", "vec3", { x: 0.0, y: 0.0, z: 0.0 });
        this.attributes.push(velocityAttribute);

        const lockAttribute = new Attribute("Lock");
        lockAttribute.addField("Linear X", "boolean", false);
        lockAttribute.addField("Linear Y", "boolean", false);
        lockAttribute.addField("Linear Z", "boolean", false);
        lockAttribute.addField("Angular X", "boolean", false);
        lockAttribute.addField("Angular Y", "boolean", false);
        lockAttribute.addField("Angular Z", "boolean", false);
        this.attributes.push(lockAttribute);

        this.desc = RAPIER.RigidBodyDesc.dynamic();
        this.rigidBody = null;

        this.world = null;
        this.host = null;
    }

    static baseType = "rapierRigidBody";
    static type = "rapierRigidBody";
    static group = "3D Physics";
    static icon = ["object3d", ...super.icon];

    start() {
        this.updateDescCore();

        this.world = this.getFirstParentOfType(RapierController).world;
        this.host = this.getFirstParentOfType(Object3d);

        if (!this.host || !this.world) return;

        this.rigidBody = this.world.createRigidBody(this.desc);

        this.rigidBody.setTranslation({x: this.host.position.x, y: this.host.position.y, z: this.host.position.z}, true);

        const rotation = this.host.rotation;
        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z),
            rotation.order
        );

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);

        this.rigidBody.setRotation({x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w}, true);

        const linear = this.getAttr("Velocity", "Linear");
        this.rigidBody.setLinvel(linear, true);

        const angular = this.getAttr("Velocity", "Angular");
        this.rigidBody.setAngvel(angular, true);

        if (!this.getAttr("Core", "Start Awake")) {
            this.rigidBody.sleep();
        }
    }

    update() {
        if (!this.rigidBody || !this.host) return;

        const type = this.getAttr("Core", "Type");
        const autoSync = this.getAttr("Core", "Auto Sync Transform");

        if (!autoSync) return;

        // 🟢 DYNAMIC → physics drives attributes
        if (type === "Dynamic") {
            const pos = this.rigidBody.translation();
            const rot = this.rigidBody.rotation();

            // position
            this.host.setNonAsyncAttr("Transform", "Position", {
                x: pos.x,
                y: pos.y,
                z: pos.z
            });

            // rotation (quat → euler)
            const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
            const euler = new THREE.Euler().setFromQuaternion(q, "XYZ");

            this.host.setNonAsyncAttr("Transform", "Rotation", {
                x: THREE.MathUtils.radToDeg(euler.x),
                y: THREE.MathUtils.radToDeg(euler.y),
                z: THREE.MathUtils.radToDeg(euler.z),
                order: "XYZ"
            });

            const vel = this.rigidBody.linvel();
            this.host.setNonAsyncAttr("Velocity", "Linear", vel);

            const ang = this.rigidBody.angvel();
            this.host.setNonAsyncAttr("Velocity", "Angular", ang);
        }

        // 🔵 KINEMATIC → attributes drive physics
        else if (type === "Kinematic") {
            const pos = this.host.position;
            const rot = this.host.rotation;

            // position
            this.rigidBody.setNextKinematicTranslation({
                x: pos.x,
                y: pos.y,
                z: pos.z
            });

            // rotation (euler → quat)
            const euler = new THREE.Euler(
                THREE.MathUtils.degToRad(rot.x),
                THREE.MathUtils.degToRad(rot.y),
                THREE.MathUtils.degToRad(rot.z),
                rot.order
            );

            const q = new THREE.Quaternion().setFromEuler(euler);

            this.rigidBody.setNextKinematicRotation({
                x: q.x,
                y: q.y,
                z: q.z,
                w: q.w
            });
        }

        // ⚪ FIXED → nothing
    }

    updateAllProperties() {
        this.updateCore();
    }

    updateDescCore() {
        switch(this.getAttr("Core", "Type")) {
            case "Dynamic": this.desc = RAPIER.RigidBodyDesc.dynamic(); break;
            case "Fixed": this.desc = RAPIER.RigidBodyDesc.fixed(); break;
            case "Kinematic": this.desc = RAPIER.RigidBodyDesc.kinematicPositionBased(); break;
        }

        this.desc.setGravityScale(this.getAttr("Core", "Gravity Scale"));
        this.desc.setLinearDamping(this.getAttr("Core", "Linear Damping"));
        this.desc.setAngularDamping(this.getAttr("Core", "Angular Damping"));
        this.desc.setCanSleep(this.getAttr("Core", "Can Sleep"));
        this.desc.setCcdEnabled(this.getAttr("Core", "CCD"));

        this.desc.restrictTranslations(
            !this.getAttr("Lock", "Linear X"),
            !this.getAttr("Lock", "Linear Y"),
            !this.getAttr("Lock", "Linear Z"),
            true
        );
        this.desc.restrictRotations(
            !this.getAttr("Lock", "Angular X"),
            !this.getAttr("Lock", "Angular Y"),
            !this.getAttr("Lock", "Angular Z"),
            true
        );
    }

    updateCore() {
        if (!this.rigidBody) return;
        this.rigidBody.setGravityScale(this.getAttr("Core", "Gravity Scale"));
        this.rigidBody.setLinearDamping(this.getAttr("Core", "Linear Damping"));
        this.rigidBody.setAngularDamping(this.getAttr("Core", "Angular Damping"));
        this.rigidBody.setCanSleep(this.getAttr("Core", "Can Sleep"));
        this.rigidBody.setCcdEnabled(this.getAttr("Core", "CCD"));
    }

    updateLock() {
        if (!this.rigidBody) return;

        this.rigidBody.restrictTranslations(
            !this.getAttr("Lock", "Linear X"),
            !this.getAttr("Lock", "Linear Y"),
            !this.getAttr("Lock", "Linear Z"),
            true
        );
        this.rigidBody.restrictRotations(
            !this.getAttr("Lock", "Angular X"),
            !this.getAttr("Lock", "Angular Y"),
            !this.getAttr("Lock", "Angular Z"),
            true
        );
    }

    destroy() {
        this.world.removeRigidBody(this.rigidBody);
    }

    async setAttributeFieldValue(attribute, field, value, type, inputs = {}) {
        await super.setAttributeFieldValue(attribute, field, value, type, inputs);
        if (attribute == "Core") this.updateCore();
        if (attribute == "Lock") this.updateLock();

        if (attribute == "Velocity") {
            if (!this.rigidBody) return;

            if (field == "Linear") {
                const v = this.getAttr("Velocity", "Linear");
                this.rigidBody.setLinvel(v, true);
            }

            if (field == "Angular") {
                const v = this.getAttr("Velocity", "Angular");
                this.rigidBody.setAngvel(v, true);
            }
        }
    }

    resetForces() {
        if (!this.rigidBody) return;
        this.rigidBody.resetForces(true);
    }

    resetTorques() {
        if (!this.rigidBody) return;
        this.rigidBody.resetTorques(true);
    }

    addForce(x, y, z) {
        if (!this.rigidBody) return;
        this.rigidBody.addForce({x: x, y: y, z: z}, true);
    }

    addTorque(x, y, z) {
        if (!this.rigidBody) return;
        this.rigidBody.addTorque({x: x, y: y, z: z}, true);
    }

    addForceAtPoint(x, y, z, px, py, pz) {
        if (!this.rigidBody) return;
        this.rigidBody.addForceAtPoint({x: x, y: y, z: z}, {x: px, y: py, z: pz}, true);
    }

    applyImpulse(x, y, z) {
        if (!this.rigidBody) return;
        this.rigidBody.applyImpulse({x: x, y: y, z: z}, true);
    }

    applyTorqueImpulse(x, y, z) {
        if (!this.rigidBody) return;
        this.rigidBody.applyTorqueImpulse({x: x, y: y, z: z}, true);
    }

    applyImpulseAtPoint(x, y, z, px, py, pz) {
        if (!this.rigidBody) return;
        this.rigidBody.applyImpulseAtPoint({x: x, y: y, z: z}, {x: px, y: py, z: pz}, true);
    }

    setVelocity(x, y, z) {
        if (!this.rigidBody) return;
        this.rigidBody.setLinvel({x, y, z}, true);
    }

    teleport(x, y, z) {
        if (!this.rigidBody) return;

        this.rigidBody.setTranslation({x, y, z}, true);
        this.rigidBody.setLinvel({x:0,y:0,z:0}, true);
    }

    getBody() {
        return this.rigidBody;
    }

    accelerate(ax, ay, az) {
        if (!this.rigidBody) return;
        const vel = this.rigidBody.linvel();
        this.rigidBody.setLinvel({
            x: vel.x + ax,
            y: vel.y + ay,
            z: vel.z + az
        }, true);
    }

    getPosition() {
        if (!this.rigidBody) return { x: 0, y: 0, z: 0 };
        return this.rigidBody.translation();
    }

    getRotation() {
        if (!this.rigidBody) return { x: 0, y: 0, z: 0, order: "XYZ" };
        const rot = this.rigidBody.rotation();
        const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
        const euler = new THREE.Euler().setFromQuaternion(q, "XYZ");
        return {
            x: THREE.MathUtils.radToDeg(euler.x),
            y: THREE.MathUtils.radToDeg(euler.y),
            z: THREE.MathUtils.radToDeg(euler.z),
            order: "XYZ"
        };
    }

    getLinearVelocity() {
        if (!this.rigidBody) return { x: 0, y: 0, z: 0 };
        return this.rigidBody.linvel();
    }

    getAngularVelocity() {
        if (!this.rigidBody) return { x: 0, y: 0, z: 0 };
        return this.rigidBody.angvel();
    }

    teleportRotation(rx, ry, rz) {
        if (!this.rigidBody) return;

        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(rx),
            THREE.MathUtils.degToRad(ry),
            THREE.MathUtils.degToRad(rz),
            "XYZ"
        );

        const q = new THREE.Quaternion().setFromEuler(euler);

        this.rigidBody.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);
        this.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    visiblityChanged() {
        if (this.rigidBody) this.rigidBody.setEnabled(this.visible);
        if (this.desc) this.desc.setEnabled(this.visible);
    }

    awake() {
        if (this.rigidBody) this.rigidBody.wakeUp();
    }

    sleep() {
        if (this.rigidBody) this.rigidBody.sleep();
    }
}