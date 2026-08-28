import { _decorator, Component } from "cc";
import { GameGlobal } from "../GameGlobal";
import { MainGame } from "../MainGame";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("ActorAniCrl")
export class ActorAniCrl extends Component {
  start() {}

  update(deltaTime: number) {}

  onThrowOne() {
    GameGlobal.watarRoom.onThrowBody();
    AudioManager.soundPlay("throwNpc");
    AudioManager.audioStop("move");
    // if (GameGlobal.isFirstThrow) {
    //   let muNode = MainGame.mymain.mainNode
    //     .getChildByName("GamePos")
    //     .getChildByName("waterPool1");
    //   GameGlobal.CameraControl.cameraMoveToPosPingPong(muNode, () => {
    //     GameGlobal.isFirstThrow = false;
    //   });
    // }
  }

  onThrowTwo() {
    GameGlobal.watarRoom.onThrowBody();
    AudioManager.soundPlay("throwNpc");
    // if (GameGlobal.isFirstThrow) {
    //   let muNode = MainGame.mymain.mainNode
    //     .getChildByName("GamePos")
    //     .getChildByName("waterPool1");
    //   GameGlobal.CameraControl.cameraMoveToPosPingPong(muNode, () => {
    //     GameGlobal.isFirstThrow = false;
    //   });
    // }
  }
}
