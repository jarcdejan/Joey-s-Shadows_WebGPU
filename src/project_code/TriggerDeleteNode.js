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
        const battery_mesh = this.scene.getChildByName("Battery").mesh;
        const pills_mesh = this.scene.getChildByName("Pills").mesh;

        switch(this.node.mesh){
            //batteries
            case battery_mesh: inventory.batteries += 1;
            break;
            
            //pills
            case pills_mesh: inventory.pills += 1;
            break;
        }

        this.scene.removeChild(this.node);
    }

}