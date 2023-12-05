import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";
import { TriggerSoundEmitter } from "./TriggerSoundEmitter.js";
import { Transform } from "../engine/core.js";
import { Light } from "./Light.js";
import { ShakingAnimation } from "./shakingAnimation.js";

export class PlayerGameLogic {

    constructor({
        node,
        light,
        domElement,
        timer,
        maxSanity = 100,
        sanityLoss1 = 1,
        sanityLoss2 = 3,
        batteries = 2,
        pills = 4,
        keyes = 1,
    } = {}) {

        this.node = node;
        this.light = light;
        this.domElement = domElement;
        this.timer = timer;

        this.keys = {};

        this.maxSanity = maxSanity;
        this.sanity = maxSanity;
        this.sanityLoss1 = sanityLoss1;
        this.sanityLoss2 = sanityLoss2;
        this.sanityLossCooldown1 = 1000;
        this.sanityLossCooldown2 = 1000;

        this.batteryPercentage = 1;
        this.lightOn = true;
        this.lightWorkingTime = 60 * 1000;

        this.batteries = batteries;
        this.pills = pills;
        this.keyes = keyes;

        this.monsterEvent = false;
        this.quicktimeGoal = 100;

        this.initHandlers();

    }

    initHandlers() {
        this.keydownHandler = this.keydownHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);

        doc.addEventListener('keydown', e => {
            if(e.code == "KeyE" && !e.repeat){
                this.light.getComponentOfType(TriggerSoundEmitter)?.trigger();
                if(this.batteryPercentage > 0)
                    if(this.lightOn){
                        this.light.getComponentOfType(Light).turnOff();
                        this.lightOn = false;
                    }
                    else {
                        this.light.getComponentOfType(Light).turnOn();
                        this.lightOn = true;
                    }
            }
        });
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    trigger() {
        this.monsterEvent = true;
        this.node.getComponentOfType(ShakingAnimation).start();
        this.sanityLossCooldown2 = 1000;
        this.node.getComponentOfType(FirstPersonController).rooted = true;
        this.numPresses = 0;
        this.nextKey = "A";
    }

    update() {
        //console.log(this.node.getComponentOfType(Transform).translation)

        if(this.monsterEvent){

            //loose sanity
            this.sanityLossCooldown2 -= this.timer.currTime - this.timer.lastTime;
            if(this.sanityLossCooldown2 < 0){
                this.sanity -= this.sanityLoss2;
                this.sanityLossCooldown2 = 1000
            }

            //check for death
            if(this.sanity == 0){
                //die
            }

            //check key presses
            if(this.nextKey == "A" && this.keys["KeyA"] && !this.keys["KeyD"]) {
                this.numPresses += 1;
                this.nextKey = "D";
            }
            if(this.nextKey == "D" && this.keys["KeyD"] && !this.keys["KeyA"]) {
                this.numPresses += 1;
                this.nextKey = "A";
            }

            console.log(this.numPresses)

            //check if goal reached
            if(this.numPresses >= this.quicktimeGoal) {
                this.monsterEvent = false;
                this.node.getComponentOfType(FirstPersonController).rooted = false;
                this.node.getComponentOfType(ShakingAnimation).stop();
            }
        }

        if(this.lightOn)
            this.batteryPercentage -= (this.timer.currTime - this.timer.lastTime) / this.lightWorkingTime;

        if(this.lightOn && this.batteryPercentage < 0)
            this.light.getComponentOfType(Light).turnOff();


        //loose sanity if light off
        if(!this.lightOn || this.batteryPercentage < 0){
            this.sanityLossCooldown1 -= this.timer.currTime - this.timer.lastTime;
            if(this.sanityLossCooldown1 < 0){
                this.sanity -= this.sanityLoss1;
                this.sanityLossCooldown1 = 1000
            }
        }

        //reset all key states
        this.keys["KeyA"] = false;
        this.keys["KeyD"] = false;
    }
}