import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';

export class WalkingSound {

    constructor({
        node,
        audioCtx,
        panningModel = "HRTF",
        distanceModel = "linear",
        maxDistance = 100,
        refDistance = 1,
        rollOff = 10,
        audioBufferList,
        gain = 1,
        stepDistance = 2,
    } = {}) {

        this.node = node;

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

        this.gain = new GainNode(audioCtx, {gain: this.gainVal});

        this.audioBufferList = audioBufferList;
        this.audioCtx = audioCtx;

        this.stepDistance = stepDistance;
        this.distance = 0;
        this.lastPosition = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.node));
        this.audioIndex = 0;

        this.disabled = false;
    }

    update() {
        if(this.disabled)
            return;
        
        let position = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.node));

        this.panner.positionX.value = position[0];
        this.panner.positionY.value = position[1];
        this.panner.positionZ.value = position[2];

        this.distance += Math.sqrt(Math.pow(position[0]-this.lastPosition[0], 2) + Math.pow(position[2]-this.lastPosition[2], 2));
        this.lastPosition = position;

        if(navigator.userActivation.isActive && this.distance >= this.stepDistance){

            this.distance = 0;
            let source = this.audioCtx.createBufferSource();
            source.buffer = this.audioBufferList[this.audioIndex];

            this.audioIndex += 1;
            if(this.audioIndex >= this.audioBufferList.length)
                this.audioIndex = 0;

            source.connect(this.panner).connect(this.gain).connect(this.audioCtx.destination);
            source.start();
        }
    }

}