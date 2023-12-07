import { Transform } from "../engine/core/Transform.js";
import * as EasingFunctions from '../engine/animators/EasingFunctions.js'
import { quat } from '../../../lib/gl-matrix-module.js';
export class OpenDoor {

    constructor({
        node,
        timer,
        startRotation = [0, 0, 0, 1],
        endRotation = [0, 0, 0, 1],
        duration = 1000,
    } = {}) {
        this.node = node;
        this.timer = timer;
        this.duration = duration;
        this.startRotation = quat.multiply(quat.create(), node.getComponentOfType(Transform).rotation, startRotation);
        this.endRotation = quat.multiply(quat.create(), node.getComponentOfType(Transform).rotation, endRotation);
    }

    update() {
        if(this.t != undefined && this.t <= this.duration){
            this.t += this.timer.currTime - this.timer.lastTime;

            const time = this.t / this.duration;
            const transform = this.node.getComponentOfType(Transform);

            quat.slerp(transform.rotation, this.startRotation, this.endRotation, EasingFunctions.polyEaseInOut(time));
            console.log("aaa")

        }
    }

    trigger() {
        this.t = 0;
    }

}