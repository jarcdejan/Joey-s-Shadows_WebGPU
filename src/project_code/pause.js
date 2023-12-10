export class Pause {

    constructor(domElement){
        this.paused = true;

        /*domElement.ownerDocument.addEventListener('keydown', e => {
            if(e.code == "KeyQ"){
                this.paused = !this.paused;
            }
        });*/
        const doc = domElement.ownerDocument

        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === domElement) {
                this.paused = false;
            } else {
                this.paused = true;
            }
        });
    }
}