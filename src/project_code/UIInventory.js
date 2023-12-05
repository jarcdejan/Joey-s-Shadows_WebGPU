import { ImageLoader } from '../engine/loaders/ImageLoader.js'

export class UIInventory{

    constructor({
        name = "inventory",
        position = [20, 20], //from top left
        imageUrl1 = "../../res/UI/batteryIcon.png",
        imageUrl2 = "../../res/UI/pillsIcon.png",
        imageUrl3 = "../../res/UI/keyIcon.png",
        imageUrl4 = "../../res/UI/crossIcon.png",
        playerLogic,
        canvas,
    }) {
        this.name = name;
        this.position = position;
        this.imageUrl1 = imageUrl1;
        this.imageUrl2 = imageUrl2;
        this.imageUrl3 = imageUrl3;
        this.imageUrl4 = imageUrl4;

        this.playerLogic = playerLogic;
        this.canvas = canvas;
    }

    async init() {
        const imageLoader = new ImageLoader();

        this.image1 = await imageLoader.load(this.imageUrl1)
        this.image2 = await imageLoader.load(this.imageUrl2)
        this.image3 = await imageLoader.load(this.imageUrl3)
        this.image4 = await imageLoader.load(this.imageUrl4)
    }

    update() {
    }

    render(context) {
        context.drawImage(this.image1, this.position[0], this.position[1], this.image1.width, this.image1.height);
        context.drawImage(this.image2, this.position[0], this.position[1] + 120, this.image2.width, this.image2.height);
        context.drawImage(this.image3, this.position[0], this.position[1] + 240, this.image3.width, this.image3.height);
        
        context.drawImage(this.image4, this.position[0] + 80, this.position[1] + 5, this.image4.width, this.image4.height);
        context.drawImage(this.image4, this.position[0] + 80, this.position[1] + 125, this.image4.width, this.image4.height);
        context.drawImage(this.image4, this.position[0] + 80, this.position[1] + 245, this.image4.width, this.image4.height);

        context.fillStyle = "white";
        context.font = "80px arial";
        context.fillText(this.playerLogic.batteries.toString(), this.position[0] + 170, this.position[1] + 80);
        context.fillText(this.playerLogic.pills.toString(), this.position[0] + 170, this.position[1] + 200);
        context.fillText(this.playerLogic.keyes.toString(), this.position[0] + 170, this.position[1] + 320);
    }

}