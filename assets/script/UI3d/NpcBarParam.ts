import { _decorator, Component, Node } from "cc";
import { CooltimeBar } from "./CooltimeBar";
const { ccclass, property } = _decorator;

@ccclass("NpcBarParam")
export class NpcBarParam extends Component {
  public parentNpcNode: Node = null;
  private coolitemBar: CooltimeBar = null;

  start() {
    this.coolitemBar = this.node.getComponent(CooltimeBar);
  }

  public setParentNpcNode(npcNode: Node) {
    this.parentNpcNode = npcNode;
  }

  public getParentNpcNode() {
    return this.parentNpcNode;
  }
}
