import { mat4 } from '../../../lib/gl-matrix-module.js';

export class Light {

    constructor({
        color = [255, 255, 255],
        intensity = 2,
        attenuation = [0.001, 0.1, 0.3],
        ambient = 0.002,
        fi = 0.3,
        fovy = Math.PI/2,
        aspect = 1,
        near = 0.1,
        far = 100,

    } = {}) {
        this.color = color;
        this.intensity = intensity;
        this.attenuation = attenuation;
        this.ambient = ambient;
        this.fi = fi;
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    get perspectiveMatrix() {
        const { fovy, aspect, near, far } = this;
        return mat4.perspectiveZO(mat4.create(), fovy, aspect, near, far);
    }

}
