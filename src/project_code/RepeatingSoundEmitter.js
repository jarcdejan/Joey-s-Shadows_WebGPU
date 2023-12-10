import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';

export class RepeatingSoundEmitter {

    constructor({
        node,
        audioCtx,
        timer,
        panningModel = "HRTF",
        distanceModel = "linear",
        maxDistance = 100,
        refDistance = 1,
        rollOff = 10,
        audioBuffer,
        minCooldown = 10 * 1000,
        maxCooldown = 60 * 1000,
        gain = 1,
    } = {}) {

        this.node = node;
        this.minCooldown = minCooldown;
        this.maxCooldown = maxCooldown;
        this.remainingTime = Math.floor(Math.random() * (maxCooldown - minCooldown + 1) + minCooldown)
        this.timer = timer;

        this.panner = new PannerNode(audioCtx, {
            panningModel,
            distanceModel,
            positionX : 0,
            positionY : 0,
            positionZ : 0,
            orientationX : 0,
            orientationY : 0,
            orientationZ : 0,
            refDistance,
            maxDistance,
            rolloffFactor: rollOff,
        });

        this.gainVal = gain;

        this.gain = new GainNode(audioCtx, {gain: this.gainVal})

        this.audioBuffer = audioBuffer
        this.audioCtx = audioCtx

        this.playing = false
        this.enabled = true
    }

    update() {
        let position = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.node));

        this.panner.positionX.value = position[0];
        this.panner.positionY.value = position[1];
        this.panner.positionZ.value = position[2];

        this.remainingTime -= this.timer.currTime - this.timer.lastTime;

        if(this.playing == false && navigator.userActivation.isActive && this.remainingTime < 0 && this.enabled){
            let source = this.audioCtx.createBufferSource();
            source.buffer = this.audioBuffer;
            source.connect(this.panner).connect(this.gain).connect(this.audioCtx.destination);
            source.start();
            this.playing = true;
            this.remainingTime = Math.floor(Math.random() * (this.maxCooldown - this.minCooldown + 1) + this.minCooldown);
            source.addEventListener("ended", e =>{
                this.playing = false;
            });
        }
    }

}