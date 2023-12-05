import { Transform } from "../engine/core.js";

export class ShakingAnimation{

    constructor({
        node,
        timer,
        shakeInterval = 20,
        shakeIntensity = 0.1,
    }) {
        this.node = node;
        this.timer = timer;
        this.shakeInterval = shakeInterval;
        this.shakeIntensity = shakeIntensity;

        this.shaking = false;
    }

    start() {
        const translation = this.node.getComponentOfType(Transform).translation;
        this.startX = translation[0];
        this.startZ = translation[2];
        this.timeUntilMove = this.shakeInterval;
        this.shaking = true;
    }

    stop() {
        this.node.getComponentOfType(Transform).translation[0] = this.startX;
        this.node.getComponentOfType(Transform).translation[2] = this.startZ;
        this.shaking = false;
    }

    update() {
        if(!this.shaking)
            return;

        this.timeUntilMove -= this.timer.currTime - this.timer.lastTime;
        if(this.timeUntilMove < 0){
            this.timeUntilMove = this.shakeInterval;

            const min = -this.shakeIntensity
            const max = this.shakeIntensity
            const dx = Math.random() * (max - min) + min;
            const dz = Math.random() * (max - min) + min;

            this.node.getComponentOfType(Transform).translation[0] = this.startX + dx;
            this.node.getComponentOfType(Transform).translation[2] = this.startZ + dz;
        }
    }


}