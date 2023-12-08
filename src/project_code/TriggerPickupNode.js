import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';
import { PlayerGameLogic } from './playerGameLogic.js';
import { Transform } from "../engine/core/Transform.js";


export class TriggerPickupNode {

    constructor({
        node,
        scene,
        player,
        document
    } = {}) {

        this.node = node;
        this.scene = scene;
        this.player = player;
        this.document = document;
    }

    trigger() {
        
        for (const paper of this.player.getChildrenByRegex(/Paper.*/i)){
            this.player.removeChild(paper);
        }

        const item = this.node;
        this.player.addChild(item);

        item.getComponentOfType(Transform).translation = [0,0,-1];
        item.isStatic = false;

        this.scene.removeChild(item);

        //Key listener
        document.addEventListener("mousedown", e => {
            this.player.removeChild(item)
        });

    }

}