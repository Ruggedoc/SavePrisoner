import { _decorator, CCBoolean, CCFloat, Component, misc, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ProgressRadial')
export class ProgressRadial extends Component {

    @property
    reverse: boolean = false;
    
    // private mask: Node;
    private maskSp: Sprite;

    @property
    private _progress: number = 1;
    @property({type: CCFloat})
    get progress() {
        return this._progress;
    }
    set progress(v) {
        this._progress = misc.clampf(v, 0, 1);
        this.updateProgress();
    }
    


    onLoad() {
        this.maskSp = this.node.getChildByName('mask')?.getComponent(Sprite);
        // this.progress = this.initProgress;
        this.progress = this._progress;
    }

    

    private updateProgress() {
        if (this.maskSp) {
            this.maskSp.fillRange = this.reverse ? (this._progress-1) : this._progress;
        }
    }


}


