import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from "cc";
import { PlayableSDK } from "./Tool/PlayableSDK";
import { PlayerAction } from "./Tool/PrintComponent";
const { ccclass, property } = _decorator;

@ccclass("GameOverUI")
export class GameOverUI extends Component {
  start() {
    this.node.active = false;
    this.node.scale = new Vec3(0, 0, 0);
    this.node.getComponent(UIOpacity).opacity = 0;
  }

  onClickJump() {
    PlayableSDK.download(PlayerAction.automatic_jump);
  }
}
