export class Timer {

    constructor() {
        const date = new Date();
        this.lastTime = date.getTime();
        this.currTime = date.getTime();
    }

    update() {
        const date = new Date();
        this.lastTime = this.currTime;
        this.currTime = date.getTime();
    }
}