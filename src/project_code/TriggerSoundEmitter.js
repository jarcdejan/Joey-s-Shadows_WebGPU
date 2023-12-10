import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';

export class TriggerSoundEmitter {

    constructor({
        node,
        audioCtx,
        panningModel = "HRTF",
        distanceModel = "linear",
        maxDistance = 100,
        refDistance = 1,
        rollOff = 10,
        audioBuffer,
        gain = 1,
    } = {}) {

        this.node = node

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
    }

    update() {
        let position = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.node));

        this.panner.positionX.value = position[0];
        this.panner.positionY.value = position[1];
        this.panner.positionZ.value = position[2];
    }

    trigger() {
        if(navigator.userActivation.isActive){
            let source = this.audioCtx.createBufferSource();
            source.buffer = this.audioBuffer;
            source.connect(this.panner).connect(this.gain).connect(this.audioCtx.destination);
            source.start();
        }
    }

}