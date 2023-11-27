import { SoundListener } from './SoundListener.js'
import { RepeatingSoundEmitter } from './RepeatingSoundEmitter.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';
import { Tripwire } from './Tripwire.js';

import {
    Node,
    Transform,
} from '../engine/core.js';

export async function initScene(scene, camera) {
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

    const soundFile = await fetch('../../res/sounds/whispering.mp3');
    const arrayBuffer = await soundFile.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const soundNode = new Node();
    soundNode.addComponent(new RepeatingSoundEmitter({
        node: soundNode,
        audioCtx,
        audioBuffer,
    }));
    soundNode.addComponent(new Transform({
        translation: [5,0,5],
    }));
    scene.addChild(soundNode);

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

    const tripwireNode = new Node();
    tripwireNode.addComponent(new Transform({
        translation: [5,0,5],
    }));
    tripwireNode.addComponent(new Tripwire({
        tripwireNode: tripwireNode,
        playerNode: camera,
        triggerNodes: [soundNode1],
        repeat: false,
    }));
    scene.addChild(tripwireNode);
}