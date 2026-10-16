import { _decorator, Component, Node } from "cc";
import { GameGlobal } from "../GameGlobal";
import { NpcBarParam } from "./NpcBarParam";
import { GamePool } from "../GamePool";
import { Npc } from "../actor/Npc";
import { CooltimeBar } from "./CooltimeBar";
const { ccclass, property } = _decorator;

@ccclass("NpcBarList")
export class NpcBarList extends Component {
  private clearList: Node[] = [];
  start() {
    GameGlobal.npcBarList = this;
  }

  public onAddBar(npcNode: Node) {
    // let barNode = GamePool.inst.poolGet("BiaoQing");
    this.scheduleOnce(() => {
      // npcSrc.setTopBarData(barNode);
      let npcSrc = npcNode.getComponent(Npc);
      npcSrc.setTopBarData();
    }, 1);
  }

  public onClearBar(target: Node) {
    let npcBarList = this.node.children;
    let isAdd = false;
    for (let i = 0; i < npcBarList.length; i++) {
      let child = npcBarList[i];
      let npcBarSrc = child.getComponent(NpcBarParam);
      let saveNode = npcBarSrc.getParentNpcNode();
      if (saveNode == null) {
        npcBarSrc.setParentNpcNode(null);
        this.clearList.push(child);
        continue;
      }
      if (!saveNode.isValid) {
        npcBarSrc.setParentNpcNode(null);
        this.clearList.push(child);
        continue;
      }
      if (saveNode.uuid == target.uuid) {
        npcBarSrc.setParentNpcNode(null);
        this.clearList.push(child);
        break;
      }
    }
    // if(isAdd)
    while (this.clearList[0]) {
      let child = this.clearList.shift();
      if (child != null) {
        if (GamePool.inst) {
          child.removeFromParent();
          GamePool.inst.poolPut("BiaoQing", child);
        } else {
          child.removeFromParent();
          child.destroy();
        }
      }
    }
  }
}
