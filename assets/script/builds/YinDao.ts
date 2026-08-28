import { _decorator, Component, math, Node, Animation, v3, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { ShopTrigger } from "./ShopTrigger";
const { ccclass, property } = _decorator;

@ccclass("YinDao")
export class YinDao extends Component {
  @property(Node)
  public yd: Node[] = []; //0踩锤子地贴 1拿尸体 2解冻尸体 3柜台拿钱 4野外拿钱

  public target_YD_Node: Node;
  public initb = false;
  public ydid = 0;

  onLoad() {
    GameGlobal.yindao = this;
  }

  init() {
    this.target_YD_Node = this.yd[0];
    this.initb = true;
    this.ydid = 0;
  }

  update(deltaTime: number) {
    if (!this.initb) {
      return;
    }
    this.updateYD();
  }

  //更新引导目标
  updateYD() {
    //有钱
    if (GameGlobal.actor.bag2.children.length > 0) {
      if (GameGlobal.nextBuyDitie != null && GameGlobal.nextBuyDitie.active) {
        if (
          GameGlobal.actor.bag2.children.length >= GameGlobal.nextBuyDitie.getComponent(ShopTrigger).num / 10 ||
          GameGlobal.actor.bag2.children.length >= GameGlobal.moneyBagMax
        ) {
          this.target_YD_Node = GameGlobal.nextBuyDitie;
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        }
      }
    }

    //柜台有钱
    // if (GameGlobal.isFirstGetGold && (GameGlobal.mainGame.getNpcByType() || GameGlobal.watarRoom.pan.children.length > 0)) {
    //   this.target_YD_Node = this.yd[3];
    //   let tray = 1.3 + GameGlobal.equipConter.goldPos.children.length * 0.1;
    //   GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
    //   return;
    // } else {
    if (GameGlobal.equipConter.goldPos.children.length > 0) {
      this.target_YD_Node = this.yd[3];
      let curlen = GameGlobal.equipConter.goldPos.children.length;
      if (curlen > GameGlobal.moneyConterMax) curlen = GameGlobal.moneyConterMax;
      let tray = 1.3 + curlen * 0.1;
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
      return;
    }
    // }

    //野外地图有钱
    if (GameGlobal.actor.PropListNode.children.length > 0) {
      this.target_YD_Node = this.yd[4];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }
    //身上带着NPC
    if (GameGlobal.actor.getIsTakeNpc()) {
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }

    //捡NPC
    if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
      this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }
    //去踩锤子按钮
    if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
      this.target_YD_Node = this.yd[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }
  }
}
