import { ImageLoader } from '../../engine/loaders/ImageLoader.js'

export class PauseLayoutLoader{

    constructor(canvas) {
        this.canvas = canvas;
    }

    async getLayout() {
        const layout = [
            new PauseScreen({canvas: this.canvas})
        ]

        for(const element of layout){
            await element?.init()
        }

        return layout
    }
}

class PauseScreen {

    constructor({
        canvas,
        imageUrl = "../../res/UI/instructions_1.jpg",

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