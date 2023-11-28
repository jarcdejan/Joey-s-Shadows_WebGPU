import { SoundListener } from './SoundListener.js'
import { RepeatingSoundEmitter } from './RepeatingSoundEmitter.js';
import { TriggerSoundEmitter } from './TriggerSoundEmitter.js';
import { Tripwire } from './Tripwire.js';
import { WalkingSound } from './WalkingSound.js';

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
    }));
    scene.addChild(tripwireNode);


    const soundFileStep1 = await fetch('../../res/sounds/step01.wav');
    const arrayBufferStep1 = await soundFileStep1.arrayBuffer();
    const audioBufferStep1 = await audioCtx.decodeAudioData(arrayBufferStep1);

    const soundFileStep2 = await fetch('../../res/sounds/step02.wav');
    const arrayBufferStep2 = await soundFileStep2.arrayBuffer();
    const audioBufferStep2 = await audioCtx.decodeAudioData(arrayBufferStep2);

    const soundFileStep3 = await fetch('../../res/sounds/step03.wav');
    const arrayBufferStep3 = await soundFileStep3.arrayBuffer();
    const audioBufferStep3 = await audioCtx.decodeAudioData(arrayBufferStep3);

    const soundFileStep4 = await fetch('../../res/sounds/step04.wav');
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
}