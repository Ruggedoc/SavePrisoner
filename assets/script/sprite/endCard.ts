import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
import { AudioManager } from '../AudioManager';
const { ccclass, property } = _decorator;

@ccclass('endCard')
export class endCard extends Component {

    public proplist: Node[] = [];
    public index = 0;
    start() {
        let listNode = this.node.getChildByName("bg").getChildByName("iconList");
        for (let index = 0; index < listNode.children.length; index++) {
            let prop = listNode.children[index];
            prop.scale = Vec3.ZERO;
            this.proplist.push(prop);
        }
        this.schedule(this.PlayProp,0.05,this.proplist.length);
    }

    update(deltaTime: number) {

    }

    public PlayProp() {
        if (this.index >= this.proplist.length) {
            return;
        }
        let prop = this.proplist[this.index];
        this.index++;
        AudioManager.soundPlay("prop", 0.3);
        tween(prop)
            .to(0.1, { scale: v3(1.2, 1.2, 1.2) })
            .to(0.05, { scale: Vec3.ONE })
            .start();
    }
}


