import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';

export class Tripwire {

    constructor({
        tripwireNode,
        playerNode,
        marginX = 1,
        marginZ = 1,
        repeat = true,
        cooldown = 0,
        triggerNodes,
    } = {}) {
        this.tripwireNode = tripwireNode;
        this.playerNode = playerNode;
        this.marginX = marginX;
        this.marginZ = marginZ;
        this.repeat = repeat;
        this.cooldown = cooldown;
        this.triggerNodes = triggerNodes;

        this.triggered = false;
        this.triggerTime = 0;
    }

    update() {
        const d = new Date();
        let time = d.getTime();

        if(this.repeat && time - this.triggerTime > this.cooldown)
            this.triggered = false;

        if(this.triggered)
            return;

        let tripwire = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.tripwireNode));
        let player = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(this.playerNode));

        if(Math.abs(tripwire[0]-player[0]) < this.marginX && Math.abs(tripwire[2]-player[2]) <this.marginZ){
            this.triggered = true;
            this.triggerTime = time;
            for(const node of this.triggerNodes){
                for (const component of node.components) {
                    component.trigger?.();
                }
            }
        }
    }

}