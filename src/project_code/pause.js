export class Pause {

    constructor(domElement){
        this.paused = false

        domElement.ownerDocument.addEventListener('keydown', e => {
            console.log(e.code);
            if(e.code == "KeyQ"){
                this.paused = !this.paused;
            }
        });
    }
}