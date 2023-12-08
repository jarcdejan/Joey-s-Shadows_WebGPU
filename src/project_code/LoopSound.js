import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';
import { PlayerGameLogic } from './playerGameLogic.js';

export class LoopSound {

    constructor({
        node,
        audioCtx,
        player,
        panningModel = "HRTF",
        distanceModel = "linear",
        maxDistance = 100,
        refDistance = 1,
        rollOff = 10,
        audioBuffer,
        gain = 1,
    } = {}) {

        this.node = node;
        this.playerNode = player;

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

        this.active = false;
    }

    update() {
        if(!this.active)
            return;

        this.gain.gain.value = this.gainVal

        if(this.playerNode.getComponentOfType(PlayerGameLogic).dead){
            this.source.stop();
        }
    }

    start() {
        this.source = this.audioCtx.createBufferSource();

        this.source.buffer = this.audioBuffer;
        this.source.connect(this.panner).connect(this.gain).connect(this.audioCtx.destination);
        this.source.loop = true;
        this.source.start();

        this.active = true;
    }

    stop() {
        this.source.stop();

        this.active = false;
    }

}