import { _decorator, BoxCollider, Node, Component, math, tween, Tween, Vec3, Prefab, instantiate, Quat } from "cc";
import { Utils } from "../Utils";
import { GameGlobal } from "../GameGlobal";

const { ccclass, property } = _decorator;

@ccclass("IceBox")
export class IceBox extends Component {
  @property(Node)
  public bodyList: Node;
  @property(Node)
  public iceLoader: Node;
  @property(Node)
  public tempBreakEffect: Node;
  @property(Prefab)
  public npcPfb: Prefab;

  public isCanShatter: boolean = true; //是否准备好被击碎了

  public npcIcePosArr: Vec3[] = [];
  start() {
    this.npcIcePosArr = [
      new Vec3(0.57, 0.97, -2.3),
      new Vec3(0.7, 0.4, -1.55),
      new Vec3(0.064, 1.3, -0.4),
      new Vec3(0, 1, 0.6),
      new Vec3(0.6, 0.2, 1.75),
      new Vec3(0.4, -0.4, 2.68),
      new Vec3(-0.7, 1, 1.9),
      new Vec3(0.7, 0, 0),
    ];
    this.init();
  }

  init() {
    let temp: Node = null;
    let idx = 0;
    for (idx = 0; idx < GameGlobal.iceNpcNum; idx++) {
      temp = instantiate(this.npcPfb);
      temp.setParent(this.bodyList);
      let tVe3 = this.npcIcePosArr[idx];
      temp.setPosition(tVe3);
      temp.setRotationFromEuler(new Vec3(0, 0, 0));
      let bodyMod = temp.getChildByName("bodyMod");
      bodyMod.setRotationFromEuler(new Vec3(Utils.randomRange(80, 100), 90, Utils.randomRange(0, 180)));
    }
    this.tempBreakEffect.active = false;
  }

  initNpc() {
    for (let i = 0; i < this.bodyList.children.length; i++) {
      let temp = this.bodyList.children[i];
      temp.active = true;
    }
  }

  /**碎冰特效 */
  public onPlayeIceBreakAni() {
    this.iceLoader.active = false;
    // this.tempBreakEffect.active = true;
    // this.scheduleOnce(() => {
    //   // this.destroy();
    //   // GameGlobal.iceBoxList.addPoolItem(this.node);
    //   this.tempBreakEffect.active = false;
    //   // this.iceLoader.active = true;
    //   // GameGlobal.isBodyReady = true;
    // }, 2);
  } 

  /**尸体 */
  public onPlaySaveAni() {
    for (let i = 0; i < this.bodyList.children.length; i++) {
      let temp = this.bodyList.children[i];
      temp.active = false;
    }
    // while (this.bodyList.children[0]) {
    //   let temp = this.bodyList.children[0];
    //   temp.removeFromParent();
    //   temp.destroy();
    // }
  }

  public doMove(arg0: math.Vec3, time: number, callBack?) {
    tween(this.node)
      .to(time, { position: arg0 })
      .call(() => {
        callBack && callBack();
      })
      .delay(0.1)
      .start();
  }
}
