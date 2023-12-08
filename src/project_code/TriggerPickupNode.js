import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';
import { PlayerGameLogic } from './playerGameLogic.js';
import { Transform } from "../engine/core/Transform.js";
import { quat } from '../../../lib/gl-matrix-module.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';


export class TriggerPickupNode {

    constructor({
        node,
        scene,
        player,
        document,
        audioCtx,
        audioBufferPutDown,
    } = {}) {

        this.node = node;
        this.scene = scene;
        this.player = player;
        this.document = document;
        this.audioCtx = audioCtx;
        this.audioBufferPutDown = audioBufferPutDown;
    }

    trigger() {
        
        for (const paper of this.player.getChildrenByRegex(/Paper.*/i)){
            this.player.removeChild(paper);
        }

        const item = this.node;
        this.player.addChild(item);

        item.getComponentOfType(Transform).translation = [0, 0, -1];
        item.getComponentOfType(Transform).rotation = quat.fromEuler(quat.create(), 90, 0, 0),
        item.isStatic = false;

        this.scene.removeChild(item);

        //Key listener
        document.addEventListener("mousedown", e => {
            const triggerSound = new TriggerSoundEmitter({
                node: item,
                audioCtx: this.audioCtx,
                audioBuffer: this.audioBufferPutDown,
                gain: 1,
            });

            item.addComponent(triggerSound);

            triggerSound.trigger();
            
            this.player.removeChild(item);
            
            item.removeComponent(triggerSound);
        }, { once: true });

    }

}