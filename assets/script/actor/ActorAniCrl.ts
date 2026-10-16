import { _decorator, Component } from "cc";
import { GameGlobal } from "../GameGlobal";
import { MainGame } from "../MainGame";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("ActorAniCrl")
export class ActorAniCrl extends Component {
  onThrowOne() {
    GameGlobal.watarRoom.onThrowBody();
  }
  onThrowOneAudio() {
    AudioManager.audioStop("move");
    AudioManager.soundPlay("throwNpc");
  }

  onThrowTwo() {
    // AudioManager.soundPlay("throwNpc");
    GameGlobal.watarRoom.onThrowBody();
  }

  onThrowTwoAudio() {
    AudioManager.soundPlay("throwNpc");
  }

  public tojump() {
    GameGlobal.actor.tojump();
  }

  public tojump2() {
    GameGlobal.actor.tojump();
  }
  public onfootdown() {
    // GameGlobal.actor.onFistJumpAni();
    GameGlobal.iceBoxList.onButtonAni();
    // GameGlobal.iceBoxList.onFistJumpAni();
  }

  public onjumpdown() {
    GameGlobal.actor.onJumpFinish();
  }

  public onjumpdown2() {
  }
}
