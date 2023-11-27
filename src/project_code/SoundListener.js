import { vec3, vec4, mat3, mat4 } from '../../../lib/gl-matrix-module.js';
import {
    getLocalModelMatrix,
    getGlobalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
    getModels,
    getGlobalRotation,
} from '../engine/core/SceneUtils.js';

export class SoundListener {

    constructor({
        node,
        listener,
    } = {}) {
        this.node = node
        this.listener = listener
    }

    update() {
        let position = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.node));
        let direction = vec4.transformQuat(vec4.create(), vec4.fromValues(0,0,-1,1), getGlobalRotation(this.node))

        this.listener.positionX.value = position[0];
        this.listener.positionY.value = position[1];
        this.listener.positionZ.value = position[2];

        this.listener.forwardX.value = direction[0];
        this.listener.forwardY.value = direction[1];
        this.listener.forwardZ.value = direction[2];

        this.listener.upX.value = 0;
        this.listener.upY.value = 1;
        this.listener.upZ.value = 0;
    }
}