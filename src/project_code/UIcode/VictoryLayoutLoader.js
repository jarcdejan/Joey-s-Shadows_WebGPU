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
        text = "YOU ESCAPED",
        audioSrc = '../../../res/sounds/musicBox.mp3',

    }) {
        this.canvas = canvas;
        this.timer = timer;
        this.text = text;
        this.audioSrc = audioSrc;
    }

    async init() {
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
        context.fillStyle = "black";
        context.fillRect(0 ,0 ,this.canvas.width, this.canvas.height)

        context.fillStyle = "aqua";
        context.font = "200px arial";
        context.globalAlpha = this.alpha;

        const textWidth = context.measureText(this.text).width;
        const textHeight = 100;

        context.fillText(this.text, (this.canvas.width / 2 - textWidth / 2), (this.canvas.height / 2 - textHeight / 2));

        context.globalAlpha = 1;
    }
}