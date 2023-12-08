import { mat4, mat3, vec3, quat } from "../../lib/gl-matrix-module.js";
import { Transform } from "../engine/core.js";
import { PlayerGameLogic } from "./playerGameLogic.js"; 
import { getGlobalModelMatrix } from "../engine/core/SceneUtils.js";
import { ShakingAnimation } from "./shakingAnimation.js";
import { LoopSound } from "./LoopSound.js";


export class MonsterJumpscare {

    constructor({
        node,
        playerNode,
        originalPos,
    } = {}) {

        this.node = node;
        this.playerNode = playerNode;
        this.originalPos = originalPos;
    }

    update() {
        if(this.active){
            if(!this.playerNode.getComponentOfType(PlayerGameLogic).monsterEvent){
                const transform = this.node.getComponentOfType(Transform)
                transform.translation = [transform.translation[0], -10, transform.translation[2]];
                this.node.getComponentOfType(ShakingAnimation)?.stop();
                this.node.getComponentOfType(LoopSound)?.stop();
                this.active = false;
            }
        } 
    }

    trigger() {
        this.node.getComponentOfType(Transform).translation = this.originalPos;

        //point moster in the direction of player
        const monsterPos = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.node));
        const playerPos = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.playerNode));
        const direct = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), playerPos, monsterPos));
        const rotation = quat.fromEuler(quat.create(), 0, Math.asin(direct[0]) * 180/Math.PI, 0);
        this.node.getComponentOfType(Transform).rotation = rotation;

        this.node.getComponentOfType(ShakingAnimation)?.start();
        this.node.getComponentOfType(LoopSound)?.start();

        this.active = true;
    }

}