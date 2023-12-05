import { mat4 } from '../../../lib/gl-matrix-module.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';

export class Light {

    constructor({
        color = [255, 255, 255],
        intensity = 2,
        attenuation = [0.001, 0.1, 0.3],
        ambientOff = 0.01,
        ambientOn = 0.04,
        fi = 0.3,
        fovy = Math.PI/2,
        aspect = 1,
        near = 0.1,
        far = 100,

    } = {}) {
        this.color = color;
        this.intensity = intensity;
        this.attenuation = attenuation;
        this.ambient = ambientOn;
        this.fi = fi;
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.on = true;

        this.setIntensity = intensity;
        this.ambientOff = ambientOff;
        this.ambientOn = ambientOn;
    }

    get perspectiveMatrix() {
        const { fovy, aspect, near, far } = this;
        return mat4.perspectiveZO(mat4.create(), fovy, aspect, near, far);
    }

    turnOn() {
        this.on = true;
        this.intensity = this.setIntensity;
        this.ambient = this.ambientOn;
    }

    turnOff() {
        this.on = false;
        this.intensity = 0;
        this.ambient = this.ambientOff;
    }

}
