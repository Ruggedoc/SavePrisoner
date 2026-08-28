import {
  _decorator, Collider,
  Component,
  Node,
  RigidBody, tween, Vec3
} from "cc";

const { ccclass, property } = _decorator;

@ccclass("SaveTrigger")
export class SaveTrigger extends Component {
  @property(Node)
  ball: Node;
  isMoveToDiTie: boolean;

  upY: Vec3 = new Vec3(0.047, 0.4, 0.02);
  downY: Vec3 = new Vec3(0.047, 0, 0.02);

  start() {}
  public onPlayerFootAni(col: Collider, isEnter: boolean) {
    let body: RigidBody = col.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.moveToDiTie();
      tween(this.ball)
        .to(0.2, { position: isEnter ? this.downY : this.upY })
        .start();
    }
  }

  moveToDiTie() {
  //   if (GameGlobal.yindao.ydid == 5) {
  //     GameGlobal.yindao.ydid = 6;
  //     GameGlobal.yindao.updateYD();
  //   }
  }
}
