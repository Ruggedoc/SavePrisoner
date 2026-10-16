import { _decorator, Component, Input, input, KeyCode, Node, Vec3 } from "cc";
import { GameGlobal } from "./GameGlobal";
import { GamePool } from "./GamePool";
import { Moeny } from "./builds/Moeny";
const { ccclass, property } = _decorator;

@ccclass("GameGM")
export class GameGM extends Component {
  //Q 清空背包 E 取消野外的道具
  start() {
    input.on(Input.EventType.KEY_PRESSING, this.onKeyDown, this);
  }

  onKeyDown(event) {
    if (!GameGlobal.isGM) return;
    if (event.keyCode == KeyCode.KEY_Q) {
      //清空背包
      if (GameGlobal.actor.bag2.children.length > 0) {
        let n = GameGlobal.actor.bag2.children[GameGlobal.actor.bag2.children.length - 1];
        n.removeFromParent();
        n.destroy();
        // GamePool.inst.poolPut("Money", n);
        GameGlobal.actor.checkBagPos();
        GameGlobal.actor.cleanBag();
        GameGlobal.mainGame.updateMoney();
      }
    } else if (event.keyCode == KeyCode.KEY_E) {
      //取消野外的道具
      if (GameGlobal.actor.PropListNode.children.length > 0) {
        let n = GameGlobal.actor.PropListNode.children[0];
        n.removeFromParent();
        // GamePool.inst.poolPut("Money", n);
        n.destroy();
      }
    }
  }
}
