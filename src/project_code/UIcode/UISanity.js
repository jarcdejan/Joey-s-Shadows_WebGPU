import { ImageLoader } from '../../engine/loaders/ImageLoader.js'

export class UISanity{

    constructor({
        name = "inventory",
        position = [240, 320], //from bottom right
        imageUrl1 = "../../res/UI/brain.png",
        imageUrl2 = "../../res/UI/brainFull.png",
        playerLogic,
        canvas,
    }) {
        this.name = name;
        this.position = position;
        this.imageUrl1 = imageUrl1;
        this.imageUrl2 = imageUrl2;

        this.playerLogic = playerLogic;
        this.canvas = canvas;
    }

    async init() {
        const imageLoader = new ImageLoader();

        this.image1 = await imageLoader.load(this.imageUrl1)
        this.image2 = await imageLoader.load(this.imageUrl2)
    }

    update() {
        this.percentage = this.playerLogic.sanity / this.playerLogic.maxSanity
    }

    render(context) {
        const position = [this.canvas.width - this.position[0], this.canvas.height - this.position[1]];

        const height = this.image2.height * this.percentage;
        const notHeight = this.image2.height - height;

        context.drawImage(this.image1, position[0], position[1], this.image1.width, this.image1.height);
        context.drawImage(this.image2, 0, notHeight, this.image2.width, height, position[0], position[1] + notHeight, this.image2.width, height);
    }

}