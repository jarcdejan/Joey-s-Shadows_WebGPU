import { UIBattery } from './UIBattery.js'

export class UILayoutLoader{

    constructor(canvas, light) {
        this.canvas = canvas;
        this.light = light;
    }

    async getLayout() {
        const layout = [
            new UIBattery({position: [this.canvas.width - 50, this.canvas.height - 25], percentage: 0.6, light: this.light})
        ]

        for(const element of layout){
            await element?.init()
        }

        return layout
    }
}