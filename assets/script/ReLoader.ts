import { _decorator, Component, MeshRenderer, Node } from "cc";
import { DissolveController } from "./actor/DissolveController";
const { ccclass, property } = _decorator;

@ccclass("ReLoader")
export class ReLoader extends Component {
  start() {
    this.scheduleOnce(() => {
      this.onReLoad();
    }, 0.1);
  }
  private onReLoad() {
    const npc = this.node.getChildByName("npc");
    const bodyMod = npc.getChildByName("bodyMod");
    const dissolve1 = bodyMod.getChildByName("equip").getComponent(DissolveController);
    dissolve1.initValue();
    dissolve1.dissolveAllMat(1);

    const dissolve2 = bodyMod.getChildByName("equip").getChildByName("langyabang Socket").getComponent(DissolveController);
    dissolve2.initValue();
    dissolve2.dissolveAllMat(1);

    const dissolve3 = bodyMod.getChildByName("ice").getComponent(DissolveController);
    dissolve3.initValue();
    dissolve3.dissolveAllMat(1);

    const spr = this.node.getChildByName("spr");
    const dissolve4 = spr.getChildByName("老鼠").getComponent(DissolveController);
    dissolve4.initValue();
    dissolve4.dissolveAllMat(1);
  }
}
