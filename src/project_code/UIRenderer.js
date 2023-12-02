export class UIRenderer{

    constructor(canvas) {
        this.canvas = canvas;
    }

    init() {
        const context = this.canvas.getContext('2d');
        this.context = context;
    }

    render(layout) {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height)
        for(const element of layout){
            element?.render(this.context)
        }
    }


}