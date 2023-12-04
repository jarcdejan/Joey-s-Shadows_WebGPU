import { mat4 } from '../../../lib/gl-matrix-module.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';

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
        timer,

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

        this.timer = timer;

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
        let time = this.timer.currTime;
        let previousTime = this.timer.lastTime;

        if(this.on)
            this.percentage -= (time - previousTime) / workingTime;

        if(this.percentage < 0){
            this.on = false;
            this.ambient = this.ambientOff;
            this.intensity = 0;
        }
    }

}
