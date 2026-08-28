import { _decorator, Component, Node } from "cc";
import { GameGlobal } from "../GameGlobal";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("HummerAni")
export class HummerAni extends Component {
  start() {}

  update(deltaTime: number) {}

  onHummerDown() {
    // if (!GameGlobal.iceBoxList.isFristAni) return;
    GameGlobal.CameraControl.triggerShake(0.2, 0.1);
    GameGlobal.iceBoxList.onPlayBreak();
  }

  onNpcCreate() {
    GameGlobal.iceBoxList.onNpcCreate();
  }
  
  onPlayHummerDown() {
    AudioManager.soundPlay("hummer");
  }
  onPlayIceBreak() {
    AudioManager.soundPlay("iceBreak");
  }
}
