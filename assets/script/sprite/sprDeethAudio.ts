import { _decorator, Component, Node } from "cc";
import { AudioManager } from "../AudioManager";
import { GameGlobal } from "../GameGlobal";
const { ccclass, property } = _decorator;

@ccclass("sprDeethAudio")
export class sprDeethAudio extends Component {
  onDeathAudio() {
    if (!GameGlobal.actor.isattMap) return;
    GameGlobal.bHaveMonsterDie = true;
  }
}
