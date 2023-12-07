import { SoundListener } from './SoundListener.js'
import { RepeatingSoundEmitter } from './RepeatingSoundEmitter.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';
import { TriggerDeleteNode } from './TriggerDeleteNode.js';
import { Tripwire } from './Tripwire.js';
import { WalkingSound } from './WalkingSound.js';

import {
    Node,
    Transform,
} from '../engine/core.js';
import { PlayerGameLogic } from './playerGameLogic.js';

export async function initScene(scene, camera, light, timer) {

    //init audio components
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const listener = audioCtx.listener;

    const listenerNode = new Node();
    listenerNode.addComponent(new SoundListener({
        node: listenerNode,
        listener: listener,
    }))
    listenerNode.addComponent(new Transform());
    camera.addChild(listenerNode);


    //create light switch sound
    const soundFileSwitch = await fetch('../../res/sounds/switch.mp3');
    const arrayBufferSwitch = await soundFileSwitch.arrayBuffer();
    const audioBufferSwitch = await audioCtx.decodeAudioData(arrayBufferSwitch);

    light.addComponent(new TriggerSoundEmitter({
        node: light,
        audioCtx,
        audioBuffer: audioBufferSwitch,
        gain: 0.5,
    }))

    //create random whispering node
    const soundFile = await fetch('../../res/sounds/whispering.mp3');
    const arrayBuffer = await soundFile.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const soundNode = new Node();
    soundNode.addComponent(new RepeatingSoundEmitter({
        node: soundNode,
        audioCtx,
        audioBuffer,
        timer,
    }));
    soundNode.addComponent(new Transform({
        translation: [5,0,5],
    }));
    scene.addChild(soundNode);

    //create jumpscare sound node
    const soundFile1 = await fetch('../../res/sounds/jumpscare.mp3');
    const arrayBuffer1 = await soundFile1.arrayBuffer();
    const audioBuffer1 = await audioCtx.decodeAudioData(arrayBuffer1);
    const soundNode1 = new Node();
    soundNode1.addComponent(new TriggerSoundEmitter({
        node: soundNode1,
        audioCtx,
        audioBuffer: audioBuffer1,
        gain: 0.1,
    }));
    soundNode1.addComponent(new Transform({
        translation: [5,0,5],
    }));
    scene.addChild(soundNode1);

    //create tripwire for the jumpscare sound node
    const tripwireNode = new Node();
    tripwireNode.addComponent(new Transform({
        translation: [5,0,5],
    }));
    tripwireNode.addComponent(new Tripwire({
        tripwireNode: tripwireNode,
        playerNode: camera,
        triggerNodes: [soundNode1],
        timer,
        cooldown: 10 * 1000,
    }));
    scene.addChild(tripwireNode);

    //create tripwire for monster event
    const tripwireNode1 = new Node();
    tripwireNode1.addComponent(new Transform({
        translation: [0,0,-5],
    }));
    tripwireNode1.addComponent(new Tripwire({
        tripwireNode: tripwireNode1,
        playerNode: camera,
        triggerNodes: [soundNode1, camera],
        passObject: {which: "monsterEvent"},
        timer,
        repeat: false,
    }));
    scene.addChild(tripwireNode1);

    //create victory tripwire
    const tripwireNode2 = new Node();
    tripwireNode2.addComponent(new Transform({
        translation: [12,0,14],
    }));
    tripwireNode2.addComponent(new Tripwire({
        tripwireNode: tripwireNode2,
        playerNode: camera,
        triggerNodes: [camera],
        passObject: {which: "victory"},
        timer,
        repeat: false,
    }));
    scene.addChild(tripwireNode2);

    //Load sound for battery pickup
    const soundFileBattery1 = await fetch('../../res/sounds/pick-up-battery.mp3');
    const arrayBufferBattery1 = await soundFileBattery1.arrayBuffer();
    const audioBufferBattery1 = await audioCtx.decodeAudioData(arrayBufferBattery1);

    //Load sound for pills pickup
    const soundFilePills1 = await fetch('../../res/sounds/pick-up-pills.mp3');
    const arrayBufferPills1 = await soundFilePills1.arrayBuffer();
    const audioBufferPills1 = await audioCtx.decodeAudioData(arrayBufferPills1);

    //create battery tripwire
    const battery_mesh = scene.getChildByName("Battery").mesh;
    const batteries = scene.getChildrenByMesh(battery_mesh); //battery mesh
    for(const item of batteries){
        item.addComponent(new Tripwire({
            tripwireNode: item,
            playerNode: camera,
            triggerNodes: [item],
            repeat: false,
        }));
        //Deleting scene node
        item.addComponent(new TriggerDeleteNode({
            node: item,
            scene: scene,
            player: camera,
        }));
        //Emmitting a sound
        item.addComponent(new TriggerSoundEmitter({
            node: item,
            audioCtx,
            audioBuffer: audioBufferBattery1,
            gain: 2,
        }));
    }

    //create pills tripwire
    const pills_mesh = scene.getChildByName("Pills").mesh;
    const pills = scene.getChildrenByMesh(pills_mesh); //pills mesh
    for(const item of pills){
        item.addComponent(new Tripwire({
            tripwireNode: item,
            playerNode: camera,
            triggerNodes: [item],
            repeat: false,
        }));
        //Deleting scene node
        item.addComponent(new TriggerDeleteNode({
            node: item,
            scene: scene,
            player: camera,
        }));
        //Emmitting a sound
        item.addComponent(new TriggerSoundEmitter({
            node: item,
            audioCtx,
            audioBuffer: audioBufferPills1,
            gain: 2,
        }));
    }


    //position of item interaction sounds in relation to player
    const itemSoundTranslation = [0, -0.2, -0.2];

    //create node for battery pickup sound
    const soundNodeBattery1 = new Node();
    soundNodeBattery1.addComponent(new TriggerSoundEmitter({
        node: soundNodeBattery1,
        audioCtx,
        audioBuffer: audioBufferBattery1,
        gain: 2,
    }));
    soundNodeBattery1.addComponent(new Transform({
        translation: itemSoundTranslation,
    }));
    camera.addChild(soundNodeBattery1);

    //create node for battery use sound
    const soundFileBattery2 = await fetch('../../res/sounds/insert-battery.mp3');
    const arrayBufferBattery2 = await soundFileBattery2.arrayBuffer();
    const audioBufferBattery2 = await audioCtx.decodeAudioData(arrayBufferBattery2);
    const soundNodeBattery2 = new Node();
    soundNodeBattery2.addComponent(new TriggerSoundEmitter({
        node: soundNodeBattery2,
        audioCtx,
        audioBuffer: audioBufferBattery2,
        gain: 1.5,
    }));
    soundNodeBattery2.addComponent(new Transform({
        translation: itemSoundTranslation,
    }));
    camera.addChild(soundNodeBattery2);

    //create node for pills pickup sound
    const soundNodePills1 = new Node();
    soundNodePills1.addComponent(new TriggerSoundEmitter({
        node: soundNodePills1,
        audioCtx,
        audioBuffer: audioBufferPills1,
        gain: 2,
    }));
    soundNodePills1.addComponent(new Transform({
        translation: itemSoundTranslation,
    }));
    camera.addChild(soundNodePills1);

    //create node for pills use sound
    const soundFilePills2 = await fetch('../../res/sounds/opening-pill-bottle.mp3');
    const arrayBufferPills2 = await soundFilePills2.arrayBuffer();
    const audioBufferPills2 = await audioCtx.decodeAudioData(arrayBufferPills2);
    const soundNodePills2 = new Node();
    soundNodePills2.addComponent(new TriggerSoundEmitter({
        node: soundNodePills2,
        audioCtx,
        audioBuffer: audioBufferPills2,
        gain: 2.5,
    }));
    soundNodePills2.addComponent(new Transform({
        translation: itemSoundTranslation,
    }));
    camera.addChild(soundNodePills2);

    //create node for pills use sound
    const soundFileKey1 = await fetch('../../res/sounds/pick-up-key.mp3');
    const arrayBufferKey1 = await soundFileKey1.arrayBuffer();
    const audioBufferKey1 = await audioCtx.decodeAudioData(arrayBufferKey1);
    const soundNodeKey1 = new Node();
    soundNodeKey1.addComponent(new TriggerSoundEmitter({
        node: soundNodeKey1,
        audioCtx,
        audioBuffer: audioBufferKey1,
        gain: 2,
    }));
    soundNodeKey1.addComponent(new Transform({
        translation: itemSoundTranslation,
    }));
    camera.addChild(soundNodeKey1);

    //create node for error sound
    const soundFileError = await fetch('../../res/sounds/error.mp3');
    const arrayBufferError = await soundFileError.arrayBuffer();
    const audioBufferError = await audioCtx.decodeAudioData(arrayBufferError);
    const soundNodeError = new Node();
    soundNodeError.addComponent(new TriggerSoundEmitter({
        node: soundNodeError,
        audioCtx,
        audioBuffer: audioBufferError,
        gain: 0.5,
    }));
    soundNodeError.addComponent(new Transform({
        translation: itemSoundTranslation,
    }));
    camera.addChild(soundNodeError);

    //add item sound nodes to player game logic
    camera.getComponentOfType(PlayerGameLogic).itemSoundNodes = {
        batteryPickup: soundNodeBattery1,
        batteryUse: soundNodeBattery2,
        pillsPickup: soundNodePills1,
        pillsUse: soundNodePills2,
        keyPickup: soundNodeKey1,
        error: soundNodeError,
    };


    //add walking sounds
    const soundFileStep1 = await fetch('../../res/sounds/step01.mp3');
    const arrayBufferStep1 = await soundFileStep1.arrayBuffer();
    const audioBufferStep1 = await audioCtx.decodeAudioData(arrayBufferStep1);

    const soundFileStep2 = await fetch('../../res/sounds/step02.mp3');
    const arrayBufferStep2 = await soundFileStep2.arrayBuffer();
    const audioBufferStep2 = await audioCtx.decodeAudioData(arrayBufferStep2);

    const soundFileStep3 = await fetch('../../res/sounds/step03.mp3');
    const arrayBufferStep3 = await soundFileStep3.arrayBuffer();
    const audioBufferStep3 = await audioCtx.decodeAudioData(arrayBufferStep3);

    const soundFileStep4 = await fetch('../../res/sounds/step04.mp3');
    const arrayBufferStep4 = await soundFileStep4.arrayBuffer();
    const audioBufferStep4 = await audioCtx.decodeAudioData(arrayBufferStep4);

    const walkingSoundNode = new Node();
    walkingSoundNode.addComponent(new Transform({
        translation: [0,-2,0],
    }));
    walkingSoundNode.addComponent(new WalkingSound({
        node: walkingSoundNode,
        audioCtx,
        audioBufferList: [audioBufferStep1, audioBufferStep2, audioBufferStep3, audioBufferStep4],
        gain: 0.4,
    }));
    camera.addChild(walkingSoundNode)
    camera.getComponentOfType(PlayerGameLogic).walkingSoundNode = walkingSoundNode;

}