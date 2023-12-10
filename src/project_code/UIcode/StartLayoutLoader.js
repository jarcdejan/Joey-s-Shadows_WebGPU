import { ImageLoader } from '../../engine/loaders/ImageLoader.js'

export class StartLayoutLoader{

    constructor(canvas) {
        this.canvas = canvas;
    }

    async getLayout() {
        const layout = [
            new StartScreen({canvas: this.canvas})
        ]

        for(const element of layout){
            await element?.init()
        }

        return layout
    }
}

class StartScreen {

    constructor({
        canvas,
        imageUrl = "../../res/UI/start2.jpg",

    }) {
        this.imageUrl = imageUrl;
        this.canvas = canvas;
    }

    async init() {
        const imageLoader = new ImageLoader();

        this.image = await imageLoader.load(this.imageUrl)
    }

    render(context) {
        context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.canvas.width, this.canvas.height);
    }
}