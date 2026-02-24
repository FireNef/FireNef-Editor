import setupEngine from "../loader/setup.js";

import { Engine } from "./mainEngine.js";
import { Component } from "./components/component.js";
import { ComponentController } from "./components/componentController.js";
import { Script } from "./components/script.js";
import { Attribute, Field } from "./components/attributes.js";
import { UiController } from "./components/ui/uiController.js";
import { UiElement } from "./components/ui/uiElement.js";
import { SvgElement } from "./components/ui/svgElement.js";
import { Object3d } from "./components/3d/object3d.js";
import { TextureComponent } from "./components/3d/texture.js";
import { SceneComponent } from "./components/3d/scene.js";
import { SceneController } from "./components/3d/sceneController.js";
import { StorageComponent } from "./components/storage.js";
import { GroupComponent } from "./components/group.js";
import { PerspectiveCameraComponent } from "./components/3d/camera.js";
import { MeshComponent } from "./components/3d/mesh.js";
import { DirectionalLightComponent, SpotLightComponent, PointLightComponent, AmbientLightComponent, HemisphereLightComponent } from "./components/3d/light.js";
import { Group3d } from "./components/3d/group3d.js";

import { CubeMeshComponent } from "./components/3d/meshes/cubeMesh.js";
import { SphereMeshComponent } from "./components/3d/meshes/sphereMesh.js";
import { PlaneMeshComponent } from "./components/3d/meshes/planeMesh.js";
import { ConeMeshComponent } from "./components/3d/meshes/coneMesh.js";
import { CylinderMeshComponent } from "./components/3d/meshes/cylinderMesh.js";
import { TorusMeshComponent } from "./components/3d/meshes/torusMesh.js";
import { RingMeshComponent } from "./components/3d/meshes/ringMesh.js";
import { CapsuleMeshComponent } from "./components/3d/meshes/capsuleMesh.js";
import { CircleMeshComponent } from "./components/3d/meshes/circleMesh.js";

import { StandardMaterialComponent } from "./components/3d/materials/standardMaterial.js";
import { PhysicalMaterialComponent } from "./components/3d/materials/physicalMaterial.js";
import { PhongMaterialComponent } from "./components/3d/materials/phongMaterial.js";
import { ToonMaterialComponent } from "./components/3d/materials/toonMaterial.js";
import { BasicMaterialComponent } from "./components/3d/materials/basicMaterial.js";
import { LambertMaterialComponent } from "./components/3d/materials/lambertMaterial.js";
import { MapcapMaterialComponent } from "./components/3d/materials/matcapMaterial.js";
import { NormalMaterialComponent } from "./components/3d/materials/normalMaterial.js";
import { DepthMaterialComponent } from "./components/3d/materials/depthMaterial.js";

export {
    setupEngine,

    Engine, Component, ComponentController, Script, Attribute, Field,

    StorageComponent, GroupComponent,
    UiController, UiElement, SvgElement,

    TextureComponent, Object3d, SceneComponent, SceneController,
    PerspectiveCameraComponent, Group3d,

    DirectionalLightComponent, SpotLightComponent, PointLightComponent, AmbientLightComponent, HemisphereLightComponent,

    MeshComponent, 
    CubeMeshComponent, SphereMeshComponent, PlaneMeshComponent, ConeMeshComponent,
    CylinderMeshComponent, TorusMeshComponent, RingMeshComponent, CapsuleMeshComponent, CircleMeshComponent,

    StandardMaterialComponent, PhysicalMaterialComponent, PhongMaterialComponent, ToonMaterialComponent,
    BasicMaterialComponent, LambertMaterialComponent, MapcapMaterialComponent, NormalMaterialComponent, DepthMaterialComponent
};