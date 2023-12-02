import { UIBattery } from './UIBattery.js'

export class UILayoutLoader{

    constructor(canvas, light) {
        this.canvas = canvas;
        this.light = light;
    }

    async getLayout() {
        const layout = [
            new UIBattery({percentage: 0.6, light: this.light, canvas: this.canvas})
        ]

        for(const element of layout){
            await element?.init()
        }

        return layout
    }
}