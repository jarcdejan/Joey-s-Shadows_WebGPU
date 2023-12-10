import { ImageLoader } from '../../engine/loaders/ImageLoader.js'

export class VictoryLayoutLoader{

    constructor(canvas, timer) {
        this.canvas = canvas;
        this.timer = timer;
    }

    async getLayout() {
        const layout = [
            new VictoryScreen({canvas: this.canvas, timer: this.timer}),
        ]

        for(const element of layout){
            await element?.init()
        }

        return layout
    }
}

class VictoryScreen {

    constructor({
        canvas,
        timer,
        url = "../../../res/UI/winScreen.png",
        audioSrc = '../../../res/sounds/musicBox.mp3',

    }) {
        this.canvas = canvas;
        this.timer = timer;
        this.url = url;
        this.audioSrc = audioSrc;
    }

    async init() {
        const imageLoader = new ImageLoader();

        this.image = await imageLoader.load(this.url)
        this.keepTextFor = 5000;
        this.reduceOpacityFor = 0.001;
        this.reduceOpacityEvery = 10;

        this.timeUntilReduceAlpha = this.reduceOpacityEvery;
        this.alpha = 1;

        const doc = this.canvas.ownerDocument;
        this.soundFile = doc.createElement("audio");
        this.soundFile.preload = "auto";

        var src = doc.createElement("source");
        src.src = this.audioSrc;
        this.soundFile.appendChild(src);

        this.soundFile.load();
        this.soundFile.volume = 1.0;

        this.soundPlaying = false;
    }

    update() {
        if(!this.soundPlaying){
            this.soundFile.play();
        }
        
        const dt = this.timer.currTime - this.timer.lastTime;

        if(this.keepTextFor > 0){
            this.keepTextFor -= dt;
        }
        else if(this.alpha > 0){
            this.timeUntilReduceAlpha -= dt;
            if(this.timeUntilReduceAlpha <= 0){
                this.alpha -= this.reduceOpacityFor;
                this.timeUntilReduceAlpha = this.reduceOpacityEvery;
            }
        }

        if(this.alpha < 0)
            this.alpha = 0
    }

    render(context) {
        context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.canvas.width, this.canvas.height);
    }
}