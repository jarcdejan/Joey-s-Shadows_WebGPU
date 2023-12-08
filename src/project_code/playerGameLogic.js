import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";
import { TriggerSoundEmitter } from "./TriggerSoundEmitter.js";
import { Transform } from "../engine/core/Transform.js";
import { Light } from "./Light.js";
import { ShakingAnimation } from "./shakingAnimation.js";
import { WalkingSound } from "./WalkingSound.js";

export class PlayerGameLogic {

    constructor({
        node,
        light,
        domElement,
        timer,
        scene,
        maxSanity = 100,
        sanityLoss1 = 1,
        sanityLoss2 = 3,

        batteries = 1,
        pills = 0,
        keyes = 1,
    } = {}) {

        this.node = node;
        this.light = light;
        this.walkingSoundNode = null;
        this.itemSoundNodes = null;
        this.domElement = domElement;
        this.timer = timer;
        this.scene = scene;

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

        this.dead = false;
        this.won = false;

        this.initHandlers();

    }

    initHandlers() {
        this.keydownHandler = this.keydownHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);


        doc.addEventListener('keydown', e => {
            //console.log(e.code)

            //switch light
            if(e.code == "KeyF" && !e.repeat){
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

            if(e.code == "Digit1" && !e.repeat){
                if(this.batteries > 0){
                    this.batteries -= 1;
                    this.batteryPercentage = 1;
                    this.itemSoundNodes.batteryUse.getComponentOfType(TriggerSoundEmitter)?.trigger();
                }
                else {
                    this.itemSoundNodes.error.getComponentOfType(TriggerSoundEmitter)?.trigger();
                }
            }

            if(e.code == "Digit2" && !e.repeat){
                if(this.pills > 0){
                    this.pills -= 1;
                    this.sanity = this.maxSanity;
                    this.itemSoundNodes.pillsUse.getComponentOfType(TriggerSoundEmitter)?.trigger();
                }
                else {
                    this.itemSoundNodes.error.getComponentOfType(TriggerSoundEmitter)?.trigger();
                }
            }

        });
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    trigger({which}) {
        if(which == "monsterEvent"){
            this.monsterEvent = true;
            this.walkingSoundNode.getComponentOfType(WalkingSound).disabled = true;
            this.node.getComponentOfType(ShakingAnimation).start();
            this.sanityLossCooldown2 = 1000;
            this.node.getComponentOfType(FirstPersonController).rooted = true;
            this.numPresses = 0;
            this.nextKey = "Q";
        }
        else if(which == "victory") {
            this.won = true;
        }
    }

    update() {
        //console.log(this.node.getComponentOfType(Transform).translation)
        if(this.won)
            console.log("victory");
        if(this.dead)
            console.log("dead");
        

        //check for death
        if(this.sanity <= 0){
            this.dead = true;
        }

        if(this.monsterEvent){

            //loose sanity
            this.sanityLossCooldown2 -= this.timer.currTime - this.timer.lastTime;
            if(this.sanityLossCooldown2 < 0){
                this.sanity -= this.sanityLoss2;
                this.sanityLossCooldown2 = 1000
            }

            //check key presses
            if(this.nextKey == "Q" && this.keys["KeyQ"] && !this.keys["KeyE"]) {
                this.numPresses += 1;
                this.nextKey = "E";
            }
            if(this.nextKey == "E" && this.keys["KeyE"] && !this.keys["KeyQ"]) {
                this.numPresses += 1;
                this.nextKey = "Q";
            }


            //check if goal reached
            if(this.numPresses >= this.quicktimeGoal) {
                this.monsterEvent = false;
                this.node.getComponentOfType(FirstPersonController).rooted = false;
                this.walkingSoundNode.getComponentOfType(WalkingSound).disabled = false;
                this.node.getComponentOfType(ShakingAnimation).stop();
            }
        }

        if(this.lightOn)
            this.batteryPercentage -= (this.timer.currTime - this.timer.lastTime) / this.lightWorkingTime;

        if(this.lightOn && this.batteryPercentage < 0){
            this.lightOn = false;
            this.light.getComponentOfType(Light).turnOff();
            this.light.getComponentOfType(TriggerSoundEmitter)?.trigger();
        }


        //loose sanity if light off
        if(!this.lightOn || this.batteryPercentage < 0){
            this.sanityLossCooldown1 -= this.timer.currTime - this.timer.lastTime;
            if(this.sanityLossCooldown1 < 0){
                this.sanity -= this.sanityLoss1;
                this.sanityLossCooldown1 = 1000
            }
        }

        //reset all key states
        this.keys["KeyQ"] = false;
        this.keys["KeyE"] = false;
    }
}