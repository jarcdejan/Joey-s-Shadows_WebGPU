import { ImageLoader } from '../engine/loaders/ImageLoader.js'

export class UIBattery{

    constructor({
        name = "battery",
        position = [240, 120], //from bottom right
        size = [200, 75],
        imageUrl1 = "../../res/UI/battery.png",
        imageUrl2 = "../../res/UI/batteryFull.png",
        percentage = 1,
        playerLogic,
        canvas,
    }) {
        this.name = name;
        this.position = position;
        this.size = size;
        this.imageUrl1 = imageUrl1;
        this.imageUrl2 = imageUrl2;

        this.percentage = percentage;
        this.playerLogic = playerLogic;
        this.canvas = canvas;
    }

    async init() {
        const imageLoader = new ImageLoader();

        this.image1 = await imageLoader.load(this.imageUrl1)
        this.image2 = await imageLoader.load(this.imageUrl2)
    }

    update() {
        this.percentage = this.playerLogic.batteryPercentage;
        //console.log(this.percentage)
    }

    render(context) {
        context.drawImage(this.image1, this.canvas.width - this.position[0], this.canvas.height - this.position[1], this.size[0], this.size[1]);
        context.drawImage(this.image2, 0, 0, this.image2.width * this.percentage, this.image2.height, this.canvas.width - this.position[0], this.canvas.height - this.position[1], this.size[0] * this.percentage, this.size[1]);
    }

}