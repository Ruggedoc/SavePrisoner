import { _decorator, Component, Node } from "cc";
import { Npc } from "./Npc";
const { ccclass, property } = _decorator;

@ccclass("NpcAttackPoint")
export class NpcAttackPoint extends Component {
  public onAttackPoint() {
    this.node.parent.parent.getComponent(Npc).onAttakPoint();
  }
}
