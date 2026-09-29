import { _decorator, BoxCollider, Component, Node, RigidBody, tween, Vec3, Animation, v3 } from "cc";
import { GameGlobal } from "../GameGlobal";
const { ccclass, property } = _decorator;

@ccclass("JumpTrigger")
export class JumpTrigger extends Component {
  @property(Node)
  bgNode: Node;
  @property(Node)
  bgWhite: Node;
  @property(Node)
  bgGreen: Node;
  @property(BoxCollider)
  jumpTrigger: BoxCollider;
  @property(Node)
  normalNode: Node;
  @property(Node)
  grayNode: Node;

  anim: Animation;
  start() {
    this.jumpTrigger.on("onTriggerEnter", this.onTriggerEnter, this);
    this.jumpTrigger.on("onTriggerExit", this.onTriggerExit, this);
    this.anim = this.node.getComponent(Animation);
  }

  protected onEnable(): void {
    this.normalNode.scale = Vec3.ZERO;
    tween(this.normalNode)
      .to(0.15, { scale: v3(0.22, 1.2, 0.22) })
      .to(0.1, { scale: v3(0.18, 0.9, 0.18) })
      .to(0.05, { scale: v3(0.2, 1, 0.2) })
      .start();
  }

  update(dt) {
    if (GameGlobal.isOver) return;
    const isGray = !GameGlobal.bIceReady || GameGlobal.actor.getCarShowState() || GameGlobal.actor.getIsTakeNpc2();
    this.onSetGray(isGray);
  }

  //#region 设置灰度
  public onSetGray(gray: boolean) {
    this.normalNode.active = !gray;
    this.grayNode.active = gray;
  }

  onTriggerEnter(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.bgWhite.active = false;
      this.bgGreen.active = true;

      if (GameGlobal.isOver) return;
      if (GameGlobal.actor.isJump) return;
      if (!GameGlobal.bIceReady) return;
      if (GameGlobal.actor.getCarShowState()) return;
      if (GameGlobal.actor.bag3.children.length > 0 || GameGlobal.actor.bag4.children.length > 0) return;
      GameGlobal.iceBoxList.isTriggerOpen = true;
      //   GameGlobal.iceBoxList.onJumpTrggerStart(self);
      GameGlobal.actor.onJumpButton();
    }
  }
  onTriggerExit(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.bgWhite.active = true;
      this.bgGreen.active = false;
    }
  }

  diTieMove() {
    let initScale = this.node.scale.clone();
    let targetScale = initScale.clone().multiplyScalar(1.1);
    tween(this.node)
      .repeatForever(
        tween(this.node)
          .to(0.8, { scale: targetScale }, { easing: "quadInOut" })
          .to(0.8, { scale: initScale }, { easing: "quadInOut" }),
      )
      .start();
  }

  playClose(callback?) {
    let initScale = this.node.scale.clone();
    let targetScale = initScale.clone().multiplyScalar(1.2);
    // this.node.getChildByName("Node").getChildByName("hei").active = false;
    tween(this.node)
      .to(0.3, { scale: targetScale }, { easing: "quadInOut" })
      .to(0.1, { scale: Vec3.ZERO }, { easing: "quadInOut" })
      .call(() => {
        callback && callback();
      })
      .start();
  }
}
