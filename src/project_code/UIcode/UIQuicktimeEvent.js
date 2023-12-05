import { ImageLoader } from '../../engine/loaders/ImageLoader.js'

export class UIQuicktimeEvent{

    constructor({
        name = "quicktimeEvent",
        position = [70, 240], // from bottom left
        imageUrl1 = "../../res/UI/barEmpty.png",
        imageUrl2 = "../../res/UI/barFull.png",
        imageUrl3 = "../../res/UI/buttonQPressed.png",
        imageUrl4 = "../../res/UI/buttonQ.png",
        imageUrl5 = "../../res/UI/buttonEPressed.png",
        imageUrl6 = "../../res/UI/buttonE.png",
        percentage = 1,
        playerLogic,
        canvas,
    }) {
        this.name = name;
        this.position = position;
        this.imageUrl1 = imageUrl1;
        this.imageUrl2 = imageUrl2;
        this.imageUrl3 = imageUrl3;
        this.imageUrl4 = imageUrl4;
        this.imageUrl5 = imageUrl5;
        this.imageUrl6 = imageUrl6;

        this.percentage = percentage;
        this.playerLogic = playerLogic;
        this.canvas = canvas;
    }

    async init() {
        const imageLoader = new ImageLoader();

        this.image1 = await imageLoader.load(this.imageUrl1)
        this.image2 = await imageLoader.load(this.imageUrl2)
        this.image3 = await imageLoader.load(this.imageUrl3)
        this.image4 = await imageLoader.load(this.imageUrl4)
        this.image5 = await imageLoader.load(this.imageUrl5)
        this.image6 = await imageLoader.load(this.imageUrl6)
    }

    update() {
        if(!this.playerLogic.monsterEvent)
            return;

        this.percentage = this.playerLogic.numPresses / this.playerLogic.quicktimeGoal;
    }

    render(context) {
        if(!this.playerLogic.monsterEvent)
            return;

        const position = [this.position[0], this.canvas.height - this.position[1]];


        const barPosition = [position[0] - 30 , position[1] + 140]
        context.drawImage(this.image1, barPosition[0], barPosition[1], this.image1.width, this.image1.height);
        context.drawImage(this.image2, 0, 0, this.image2.width * this.percentage, this.image2.height, barPosition[0], barPosition[1], this.image1.width * this.percentage, this.image2.height);

        const APosition = [position[0], position[1]];
        const DPosition = [position[0] + 140, position[1]];

        if(this.playerLogic.nextKey == "Q"){
            context.drawImage(this.image4, APosition[0], APosition[1], this.image4.width, this.image4.height);
            context.drawImage(this.image5, DPosition[0], DPosition[1], this.image5.width, this.image5.height);
        }
        else {
            context.drawImage(this.image3, APosition[0], APosition[1], this.image3.width, this.image3.height);
            context.drawImage(this.image6, DPosition[0], DPosition[1], this.image6.width, this.image6.height);
        }
    }

}