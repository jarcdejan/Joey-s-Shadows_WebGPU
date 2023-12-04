import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from '../engine/renderers/UnlitRenderer.js';
import { FirstPersonController } from '../engine/controllers/FirstPersonController.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from '../engine/core/MeshUtils.js';

import { Physics } from '../engine/Physics.js';

import { Renderer } from './Renderer.js';

import { Light } from './Light.js';

import { UILayoutLoader } from './UILayoutLoader.js';
import { UIRenderer } from './UIRenderer.js';

import {
    Camera,
    Material,
    Model,
    Node,
    Primitive,
    Sampler,
    Texture,
    Transform,
} from '../engine/core.js';
import { initScene } from './initScene.js';
import { Pause } from './pause.js';
import { PauseLayoutLoader } from './PauseLayoutLoader.js';
import { Timer } from './timer.js';

const canvas = document.getElementById('webgpuCanvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('../../res/scene/test3.gltf');

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');

camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.2, -0.2, -0.2],
    max: [0.4, 0.2, 0.2],
};

const physics = new Physics(scene);

scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
    
    node.isStatic = true;
});

const pauseCheck = new Pause(canvas);
let globalTimer = new Timer();

const light = new Node();
light.addComponent(new Transform({
    translation: [0.4,-0.8,0],
}));
light.addComponent(new Light({
    domElement: canvas,
    node: light,
    timer: globalTimer,
}));
camera.addChild(light);

await initScene(scene, camera, light, globalTimer);


const canvas2d = document.getElementById("2dCanvas")
const uiLayoutLoader = new UILayoutLoader(canvas, light.getComponentOfType(Light));
const uiLayout = await uiLayoutLoader.getLayout();
const pauseLayoutLoader = new PauseLayoutLoader(canvas);
const pauseLayout = await pauseLayoutLoader.getLayout();
const uiRenderer = new UIRenderer(canvas2d);
uiRenderer.init();

//set timer before first loop
globalTimer.update();

function update(t, dt) {

    globalTimer.update();

    if(pauseCheck.paused)
        return;


    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });

    physics.update(t, dt);

    for(const element of uiLayout){
        element?.update();
    }
}

function render() {
    if(!pauseCheck.paused){
        renderer.render(scene, camera, light);
        uiRenderer.render(uiLayout);
    }
    else{
        uiRenderer.render(pauseLayout);
    }
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

window.addEventListener("resize", (event) => {
    canvas2d.width = window.innerWidth;
    canvas2d.height = window.innerHeight;
    console.log("aaa")
});

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();