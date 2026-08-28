import { _decorator, Component, Node, SkeletalAnimation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("mapMonsterAniCtrl")
export class mapMonsterAniCtrl extends Component {
  private runAni: SkeletalAnimation;
  start() {
    this.runAni = this.getComponent(SkeletalAnimation);
    if (this.runAni) {
      this.scheduleOnce(() => {
        this.runAni.play("move");
      }, Math.random());
    }
  }
}
