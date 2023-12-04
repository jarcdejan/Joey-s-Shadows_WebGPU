import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from '../engine/renderers/UnlitRenderer.js';
import { FirstPersonController } from '../engine/controllers/FirstPersonController.js';

import { Camera, Model } from '../engine/core.js';
import { transformMesh } from '../engine/core.js';
import { RayCast } from '../engine/core/RayCast.js';

const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('../../res/scene/scene.gltf');

const scene = loader.loadScene(loader.defaultScene);
console.log(scene)

const camera = loader.loadNode('Camera');
camera.addComponent(new FirstPersonController(camera, canvas));

const raysCast = new RayCast();

var posVec = renderer.getCameraPosition(camera);

var dirVec = renderer.getCameraViewDirection(camera);

const fov = Math.PI / 4;

const canWidth = canvas.width;
const canHeight = canvas.height;

function update(t, dt) {
    posVec = renderer.getCameraPosition(camera);
    dirVec = renderer.getCameraViewDirection(camera);

    var rays = raysCast.generateRays(canWidth, canHeight, fov, dirVec, posVec);
    // console.log('Generated Rays:', rays);

    scene.traverse(node => {
        // console.log('Node:', node);

        if (node.mesh && node.transformationMatrix) {
            transformMesh(node.mesh, node.transformationMatrix);
            
            if (node.mesh.vertices && node.mesh.vertices.length > 0) {
                // console.log('Mesh Vertices Exist:', node.mesh.vertices);
                if (raysCast.rayIntersectsObjects(rays, node)) {
                    // console.log("Intersection detected with node:", node);
                    console.log(node.name);
                } else {
                    // console.log("No intersection with node:", node);
                }
            } else {
                // console.log('Mesh Vertices are Missing or Empty');
            }
        } else {
            // console.log('Mesh or TransformationMatrix is Missing');
        }

        for (const component of node.components) {
            component.update?.(t, dt);
        }
    });
}


function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();