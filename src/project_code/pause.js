export class Pause {

    constructor(domElement){
        this.paused = false

        domElement.ownerDocument.addEventListener('keydown', e => {
            if(e.code == "KeyQ"){
                this.paused = !this.paused;
            }
        });
    }
}