import { _decorator, CCFloat, Component, Node, tween, EventTarget } from 'cc';
import { HeadComponent } from '../Tool/HeadComponent';
import { ProgressRadial } from './ProgressRadial';
import { GameGlobal } from '../GameGlobal';
// import { ProgressRadial } from './ProgressRadial';
// import { HeadComponent } from './HeadComponent';
// import { GameGlobal } from './GameGlobal';
const { ccclass, property } = _decorator;

@ccclass('CooltimeBar')
export class CooltimeBar extends HeadComponent {
    
    private processBar: ProgressRadial;

    @property({ group: { name: "冷却参数", id: "2" } })
    auto: boolean = false;

    @property({ type: CCFloat, group: { name: "冷却参数", id: "2" } })
    time: number = 1;

    get progress() {
        return this.processBar.progress;
    }
    set progress(v) {
        this.processBar && (this.processBar.progress = v);
        if (this.progress >= 1) {
            this.eventTarget.emit('finish')
        }
    }

    protected eventTarget = new EventTarget();


    start() {
        super.start();
        this.camera = GameGlobal.mainCamera;

        this.processBar = this.node.getChildByName('ProgressBar')?.getComponent(ProgressRadial);
    }


    used() {
        this.progress = 0;
    }


    protected update(dt: number) {
      
    }


    on(type, callback, thisArg?: any, once?: boolean): typeof callback {
        this.eventTarget.on(type, callback, thisArg, once);
    }


    once(type, callback, thisArg?: any): typeof callback {
        this.eventTarget.once(type, callback, thisArg);
    }

    
    off(type, callback?, thisArg?: any): void {
        this.eventTarget.off(type, callback, thisArg);
    }
}


