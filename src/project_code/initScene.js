import { SoundListener } from './SoundListener.js'
import { RepeatingSoundEmitter } from './RepeatingSoundEmitter.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';
import { TriggerDeleteNode } from './TriggerDeleteNode.js';
import { TriggerPickupNode } from './TriggerPickupNode.js';
import { Tripwire } from './Tripwire.js';
import { WalkingSound } from './WalkingSound.js';
import { MonsterJumpscare } from './MonsterJumpscare.js';
import { quat } from '../../../lib/gl-matrix-module.js';

import {
    Node,
    Transform,
} from '../engine/core.js';
import { PlayerGameLogic } from './playerGameLogic.js';
import { ShakingAnimation } from './shakingAnimation.js';
import { OpenDoor } from './OpenDoor.js';
import { LoopSound } from './LoopSound.js';

export async function initScene(scene, audioCtx, camera, light, timer, document, pause) {


    //audio listener node
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

    //add voices to the player
    const soundFileWhisper = await fetch('../../res/sounds/whispering.mp3');
    const arrayBufferWhisper = await soundFileWhisper.arrayBuffer();
    const audioBufferWhisper = await audioCtx.decodeAudioData(arrayBufferWhisper);

    const voicesNode = new Node();
    voicesNode.addComponent(new Transform({
        translation: [0,0,2],
    }));
    voicesNode.addComponent(new LoopSound({
        node: voicesNode,
        audioCtx,
        audioBuffer: audioBufferWhisper,
        gain: 0,
        player: camera,
    }));
    voicesNode.getComponentOfType(LoopSound).start();
    camera.addChild(voicesNode);
    camera.getComponentOfType(PlayerGameLogic).voicesSoundNode = voicesNode;
    
    //create victory tripwire
    const tripwireNode2 = new Node();
    tripwireNode2.addComponent(new Transform({
        translation: [-20,0,40],
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

    //Load sound for keys pickup
    const soundFileKey1 = await fetch('../../res/sounds/pick-up-key.mp3');
    const arrayBufferKey1 = await soundFileKey1.arrayBuffer();
    const audioBufferKey1 = await audioCtx.decodeAudioData(arrayBufferKey1);
    
    //Load sound jumpscare
    const soundFileMonster = await fetch('../../res/sounds/jumpscare.mp3');
    const arrayBufferMonster = await soundFileMonster.arrayBuffer();
    const audioBufferMonster = await audioCtx.decodeAudioData(arrayBufferMonster);

    //monster encouter loop sound
    const soundFileMonsterLoop = await fetch('../../res/sounds/scaryviolins.mp3');
    const arrayBufferMonsterLoop = await soundFileMonsterLoop.arrayBuffer();
    const audioBufferMonsterLoop = await audioCtx.decodeAudioData(arrayBufferMonsterLoop);

    //Load sound for paper pickup
    const soundFilePaper = await fetch('../../res/sounds/handle-paper-foley-1.mp3');
    const arrayBufferPaper = await soundFilePaper.arrayBuffer();
    const audioBufferPaper = await audioCtx.decodeAudioData(arrayBufferPaper);
    
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

    //create key tripwire
    const key_mesh = scene.getChildByName("Key").mesh;
    const keyes = scene.getChildrenByMesh(key_mesh); //key mesh
    for(const item of keyes){
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
            audioBuffer: audioBufferKey1,
            gain: 2,
        }));
    }

    //create monster tripwires
    const monsters = scene.getChildrenByRegex(/Monster.*/i)
    for(const monsterNode of monsters){
        const transform = monsterNode.getComponentOfType(Transform)
        monsterNode.addComponent(new MonsterJumpscare({
            node: monsterNode,
            playerNode: camera,
            originalPos: transform.translation,
        }));
        //console.log(monsterNode.children)
        monsterNode.addComponent(new ShakingAnimation({
            node: monsterNode,
            timer: timer,
        }));

        monsterNode.addComponent(new TriggerSoundEmitter({
            node: monsterNode,
            audioCtx,
            audioBuffer: audioBufferMonster,
            gain: 0.3,
        }));

        monsterNode.addComponent(new LoopSound({
            node: monsterNode,
            audioCtx,
            audioBuffer: audioBufferMonsterLoop,
            gain: 2,
            pause: pause,
            player: camera,
        }));

        const tripwire = monsterNode.children[0]
        tripwire.addComponent(new Tripwire({
            tripwireNode: tripwire,
            playerNode: camera,
            marginX: 2,
            marginZ: 2,
            repeat: false,
            triggerNodes: [monsterNode, camera],
            passObject: {which: "monsterEvent"}
        }));
        transform.translation = [transform.translation[0], -10, transform.translation[2]];
    }

    //create paper tripwire
    const papers = scene.getChildrenByRegex(/Paper.*/i)
    for(const item of papers){
        item.addComponent(new Tripwire({
            tripwireNode: item,
            playerNode: camera,
            triggerNodes: [item],
            repeat: false,
        }));
        //Pickup node
        item.addComponent(new TriggerPickupNode({
            node: item,
            scene: scene,
            player: camera,
            document: document
        }));
        //Emmitting a sound
        item.addComponent(new TriggerSoundEmitter({
            node: item,
            audioCtx,
            audioBuffer: audioBufferPaper,
            gain: 2,
        }));
    }

    //unlock sound
    const soundFileUnlock = await fetch('../../res/sounds/keys-unlocking-door.mp3');
    const arrayBufferUnlock = await soundFileUnlock.arrayBuffer();
    const audioBufferUnlock = await audioCtx.decodeAudioData(arrayBufferUnlock);

    //init doors
    const doors = scene.getChildrenByRegex(/Door.*/i)
    //console.log(doors)
    for(const doorNode of doors){
        doorNode.addComponent(new Tripwire({
            tripwireNode: doorNode,
            playerNode: camera,
            marginX: 2,
            marginZ: 2,
            repeat: false,
            triggerNodes: [doorNode],
            checkForKey: true,
        }));
        doorNode.addComponent(new OpenDoor({
            node: doorNode,
            timer: timer,
            startRotation: [0,0,0,1],
            endRotation: quat.fromEuler(quat.create(), 0, 0, -90),
            duration: 1000,
        }));
        doorNode.addComponent(new TriggerSoundEmitter({
            node: doorNode,
            audioCtx,
            audioBuffer: audioBufferUnlock,
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

    //create node for keys pickup sound
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