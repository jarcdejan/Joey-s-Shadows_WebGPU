import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { FirstPersonController } from '../engine/controllers/FirstPersonController.js';

import { Light } from './Light.js';
import { SoundListener } from './SoundListener.js';
import { RepeatingSoundEmitter } from './RepeatingSoundEmitter.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';
import { Tripwire } from './Tripwire.js';


import { 
    Camera, 
    Model,
    Material,
    Node,
    Primitive,
    Sampler,
    Texture,
    Transform,
} from '../engine/core.js';
import { initScene } from './initScene.js';
import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from '../engine/core/MeshUtils.js';

import { transformMesh } from '../engine/core.js';
import { RayCast } from '../engine/core/RayCast.js';
import { Physics } from '../engine/Physics.js';
import { vec3 } from '../../lib/gl-matrix-module.js';

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('../../res/scene/test4.gltf');

const scene = loader.loadScene(loader.defaultScene);
// console.log(scene)

const camera = loader.loadNode('Camera');
camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.4, -0.2, -0.2],
    max: [0.4, 0.2, 0.2],
};

const physics = new Physics(scene);

const raysCast = new RayCast();

const light = new Node();
light.addComponent(new Transform({
    translation: [0.4,-0.8,0],
}));
light.addComponent(new Light({
    domElement: canvas,
}));
camera.addChild(light);

await initScene(scene, camera);

const fov = Math.PI / 4;
const canWidth = canvas.width;
const canHeight = canvas.height;

scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);

    // console.log(node.aabb);
    node.isStatic = true;
});

var isRemoved = false;

function update(t, dt) {
    var posVec = renderer.getCameraPosition(camera);
    var dirVec = renderer.getCameraViewDirection(camera);

    var rays = raysCast.generateRays(canWidth, canHeight, fov, dirVec, posVec);
    // console.log(rays[0]);

    const nodes = scene.linearize();
    var closestNode = null;
    var minDist = Infinity;

    for (const node of nodes) {
        if (node.mesh && node.transformationMatrix) {
            transformMesh(node.mesh, node.transformationMatrix);
            if (node.mesh.vertices && node.mesh.vertices.length > 0) {
                var pointOfIntersection = raysCast.rayIntersectsObjects(rays, node);
                if (!isNaN(pointOfIntersection[0]) && pointOfIntersection != false) {  
                    var vector = vec3.subtract(vec3.create(), posVec, pointOfIntersection);

                    if (Math.sign(vector[0]) == Math.sign(dirVec[0]) && Math.sign(vector[1]) == Math.sign(dirVec[1]) && Math.sign(vector[2]) == Math.sign(dirVec[2])) {
                        var lenVec = vec3.dist(posVec, pointOfIntersection);
                        if ((lenVec < minDist) && (node.getComponentOfType(Camera) == null) && (node.getComponentOfType(Light) == null)) {
                            minDist = lenVec;
                            console.log(node);
                            closestNode = node;
                        }
                    }
                } 
            }
        }
    }
    // console.log(closestNode);

    if (closestNode != null && !isRemoved) {
        //console.log(node);
        // console.log(scene.children);
        document.addEventListener('keydown', e => {
            if (e.code == "KeyE") {
                console.log(closestNode);
                isRemoved = true;
                loader.removeObjectFromScene(scene, closestNode.name);
                renderer.removeNodeFromGpuObjects(closestNode);
                renderer.render(scene, camera, light);
                //console.log(scene.children);
            }
        });
    }

    scene.traverse(node => {        
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
    physics.update(t, dt);
}


function render() {
    renderer.render(scene, camera, light);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();