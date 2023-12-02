import { mat4 } from '../../../lib/gl-matrix-module.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';

const d = new Date();
const workingTime = 60 * 1000;

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
        domElement,
        node,

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
        this.node = node;

        this.percentage = 1;

        this.setIntensity = intensity;
        this.ambientOff = ambientOff;
        this.ambientOn = ambientOn;

        domElement.ownerDocument.addEventListener('keydown', e => {
            if(e.code == "KeyE"){
                this.node.getComponentOfType(TriggerSoundEmitter)?.trigger();
                if(this.percentage < 0)
                    return

                if(this.on){
                    this.on = false;
                    this.intensity = 0;
                    this.ambient = this.ambientOff;
                }
                else{
                    this.on = true;
                    this.intensity = this.setIntensity;
                    this.ambient = this.ambientOn;
                }
            }
        });

    }

    get perspectiveMatrix() {
        const { fovy, aspect, near, far } = this;
        return mat4.perspectiveZO(mat4.create(), fovy, aspect, near, far);
    }

    update() {
        const d = new Date();

        if(this.previousTime == null){
            this.previousTime = d.getTime();
        }

        let time = d.getTime();

        if(this.on && time - this.previousTime < 1000)
            this.percentage -= (time - this.previousTime) / workingTime

        this.previousTime = time;

        if(this.percentage < 0){
            this.on = false;
            this.ambient = this.ambientOff;
            this.intensity = 0;
        }
    }

}
