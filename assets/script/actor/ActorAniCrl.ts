import { _decorator, Component } from "cc";
import { GameGlobal } from "../GameGlobal";
import { MainGame } from "../MainGame";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("ActorAniCrl")
export class ActorAniCrl extends Component {
  onThrowOne() {
    // AudioManager.audioStop("move");
    // AudioManager.soundPlay("throwNpc");
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
    // GameGlobal.actor.isJump = false;
    // GameGlobal.iceBoxList.onTrggerStart();
    // GameGlobal.actor.onJumpFinish();
    GameGlobal.iceBoxList.onButtonAni();
  }

  public onjumpdown() {
    GameGlobal.actor.isJump = false;
    // GameGlobal.iceBoxList.onTrggerStay();
    // GameGlobal.actor.onJumpFinish();
  }

  public onjumpdown2() {
    // GameGlobal.actor.isJump = false;
    // GameGlobal.iceBoxList.onTrggerStay();
    // GameGlobal.actor.onJumpFinish2();
  }
}
