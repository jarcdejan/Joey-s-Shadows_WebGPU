import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';
import { PlayerGameLogic } from './playerGameLogic.js';

export class TriggerDeleteNode {

    constructor({
        node,
        scene,
        player
    } = {}) {

        this.node = node;
        this.scene = scene;
        this.player = player;
    }

    trigger() {

        const inventory =  this.player.getComponentOfType(PlayerGameLogic);
        
        if(this.node.name.match(/Battery.*/i)){
            inventory.batteries += 1;
        }else if(this.node.name.match(/Pills.*/i)){
            inventory.pills += 1;
        }

        this.scene.removeChild(this.node);
    }

}