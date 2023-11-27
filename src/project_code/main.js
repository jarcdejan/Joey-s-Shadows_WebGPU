import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from '../engine/renderers/UnlitRenderer.js';
import { Renderer } from './Renderer.js';
import { FirstPersonController } from '../engine/controllers/FirstPersonController.js';

import { Light } from './Light.js';
import { SoundListener } from './SoundListener.js'
import { RepeatingSoundEmitter } from './RepeatingSoundEmitter.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';
import { Tripwire } from './Tripwire.js';

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

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('../../res/scene/scene.gltf');

const scene = loader.loadScene(loader.defaultScene);

const camera = loader.loadNode('Camera');
camera.addComponent(new FirstPersonController(camera, canvas));

const light = new Node();
light.addComponent(new Transform({
    translation: [0.8,-0.8,0],
}));
light.addComponent(new Light());
camera.addChild(light);

await initScene(scene, camera)

console.log(scene)


function update(t, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
}

function render() {
    renderer.render(scene, camera, light);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();