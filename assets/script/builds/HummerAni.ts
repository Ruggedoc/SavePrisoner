import { _decorator, Component, Node } from "cc";
import { GameGlobal } from "../GameGlobal";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("HummerAni")
export class HummerAni extends Component {
  onHummerDown() {
    if (GameGlobal.actor.issnakeMap) {
      if (!GameGlobal.actor.isFirstJump) {
        GameGlobal.CameraControl.cameraShock(false);
      }
    }
    GameGlobal.iceBoxList.onPlayBreak();
  }

  onNpcCreate() {
    GameGlobal.iceBoxList.onNpcCreate();
  }

  onPlayHummerDown() {
    if (GameGlobal.actor.issnakeMap) AudioManager.soundPlay("hummer");
  }
  onPlayIceBreak() {
    if (GameGlobal.actor.issnakeMap) AudioManager.soundPlay("iceBreak");
  }
}
