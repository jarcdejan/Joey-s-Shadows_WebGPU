import { UIBattery } from './UIBattery.js'
import { UIInventory } from './UIInventory.js';
import { UIQuicktimeEvent } from './UIQuicktimeEvent.js';
import { UISanity } from './UISanity.js';

export class UILayoutLoader{

    constructor(canvas, playerLogic, timer) {
        this.canvas = canvas;
        this.playerLogic = playerLogic;
        this.timer = timer;
    }

    async getLayout() {
        const layout = [
            new UIBattery({percentage: 1, playerLogic: this.playerLogic, canvas: this.canvas}),
            new UIQuicktimeEvent({playerLogic: this.playerLogic, canvas: this.canvas}),
            new UIInventory({playerLogic: this.playerLogic, canvas: this.canvas}),
            new UISanity({playerLogic: this.playerLogic, canvas: this.canvas}),
        ]

        for(const element of layout){
            await element?.init()
        }

        return layout
    }
}