import { mat4 } from '../../../lib/gl-matrix-module.js';

export class Light {

    constructor({
        color = [255, 255, 255],
        intensity = 2,
        attenuation = [0.001, 0.1, 0.3],
        ambient = 0.01,
        fi = 0.3,
        fovy = Math.PI/2,
        aspect = 1,
        near = 0.1,
        far = 100,
        domElement,

    } = {}) {
        this.color = color;
        this.intensity = intensity;
        this.setIntensity = intensity;
        this.attenuation = attenuation;
        this.ambient = ambient;
        this.fi = fi;
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.on = true;

        domElement.ownerDocument.addEventListener('keydown', e => {
            console.log(e.code)
            if(e.code == "KeyQ"){
                if(this.on){
                    this.on = false;
                    this.intensity = 0;
                }
                else{
                    this.on = true;
                    this.intensity = this.setIntensity;
                }
            }
        });

    }

    get perspectiveMatrix() {
        const { fovy, aspect, near, far } = this;
        return mat4.perspectiveZO(mat4.create(), fovy, aspect, near, far);
    }

}
