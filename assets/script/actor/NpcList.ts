import { _decorator, Component, Node, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { Utils } from "../Utils";
import { Npc } from "./Npc";
import { NpcState, NpcWorkStage } from "../EnumDefine";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("NpcList")
export class NpcList extends Component {
  /**正在排队的人坐标 */
  public mansPos: Vec3[] = [];
  /**进入排队点 */
  public listEnterPosArr: Vec3[] = [];
  /**等待加入排队的人 */
  public npcWaitEnterArr: Node[] = [];

  /**正在排队的人 */
  public npcListArr: Node[] = [];
  /**当前第一个 */
  public equipNode: Node;
  /**换装点 */
  public equipPos: Vec3;
  checkTime: number = 2;
  timeDown: number = 0;
  dieCount: number = 0;
  attackCount: number = 0;
  start() {
    GameGlobal.npcList = this;
    for (let i = 0; i < 3; i++) {
      this.listEnterPosArr.push(GameGlobal.mainGame.GamePosNode.getChildByName("npcListEnterPos" + i).worldPosition.clone());
    }
    this.equipPos = GameGlobal.mainGame.GamePosNode.getChildByName("npcListPos").worldPosition.clone();
    for (let idx = 0; idx < GameGlobal.waitManMax - 1; idx++) {
      this.mansPos.push(new Vec3(this.equipPos.x, 0, this.equipPos.z + 0.6 * (idx + 1)));
    }
  }

  update(deltaTime: number) {
    if (GameGlobal.isOver || GameGlobal.isStop) return;
    // this.timeDown += deltaTime;
    // if (this.timeDown < this.checkTime) return;
    // this.timeDown = 0;
    this.updateAllNpcAudio();
  }

  updateAllNpcAudio() {
    if (GameGlobal.isOver || GameGlobal.isStop) return;
    if (!GameGlobal.actor.isattMap) return;
    if (GameGlobal.bHaveNpcDie && this.dieCount < GameGlobal.audioPlayMax) {
      GameGlobal.bHaveNpcDie = false;
      // AudioManager.soundPlay("npcDeath");
      this.dieCount++;
      this.scheduleOnce(() => {
        this.dieCount--;
      }, Math.random() * 2);
    }
    if (GameGlobal.bHaveNpcAttack && this.attackCount < GameGlobal.audioPlayMax) {
      GameGlobal.bHaveNpcAttack = false;
      // AudioManager.soundPlay("attack");
      this.attackCount++;
      this.scheduleOnce(() => {
        this.attackCount--;
      }, Math.random() * 2);
    }
  }

  /**进入点 */
  getListEnterPos(checkPos: Vec3) {
    let dis: number = -1;
    let enterPos: Vec3 = null;
    for (let i: number = 0; i < this.listEnterPosArr.length; i++) {
      let tempDis = Vec3.distance(this.listEnterPosArr[i], checkPos);
      if (dis == -1) {
        dis = tempDis;
        enterPos = this.listEnterPosArr[i];
      } else {
        if (tempDis < dis) {
          dis = tempDis;
          enterPos = this.listEnterPosArr[i];
        }
      }
    }
    return enterPos;
  }

  /**是否是第一个NPC */
  onCheckIsFistNpc(n: Node) {
    if (this.equipNode != null) {
      return n.uuid == this.equipNode.uuid;
    } else {
      return this.npcListArr.length <= 0;
    }
  }

  /**新NPC加入 */
  public onNewEnjoy() {
    if (this.npcListArr.length > 0) {
      for (let i = 0; i < this.npcListArr.length; i++) {
        let npdNode = this.npcListArr[i];
        npdNode.getComponent(Npc).moveToNext(this.mansPos[i]);
      }
    }
  }

  /**第一个人扔钱结束 */
  public onEquipEnd() {
    this.equipNode = null;
    if (this.npcListArr.length > 0) {
      let secondNode: Node = this.npcListArr.shift();
      secondNode.getComponent(Npc).moveToEquip();
    }
    if (this.npcListArr.length > 0) {
      for (let i = 0; i < this.npcListArr.length; i++) {
        let npdNode = this.npcListArr[i];
        npdNode.getComponent(Npc).moveToNext(this.mansPos[i]);
      }
    }
    this.updateNpcEnter();
  }

  public checkAndEnterList(n: Node) {
    let npcSrc: Npc = null;
    if (
      this.npcListArr.length >= GameGlobal.cunterListMax ||
      (this.npcWaitEnterArr.length > 0 && this.npcListArr.length < GameGlobal.cunterListMax)
    ) {
      npcSrc = n.getComponent(Npc);
      let npcWaitPos = GameGlobal.mainGame.GamePosNode.getChildByName("NpcWaitPos");
      let maxWaitPos = Utils.localToWorld(npcWaitPos.parent, GameGlobal.npcWaitAreaMaxPos);
      let waitPos = new Vec3(
        Utils.randomRange(npcWaitPos.worldPosition.x, maxWaitPos.x),
        0,
        Utils.randomRange(npcWaitPos.worldPosition.z, maxWaitPos.z),
      );
      npcSrc.curMovePos = waitPos;
      npcSrc.workStage = NpcWorkStage.waitList;
      npcSrc.state = NpcState.move;
      this.npcWaitEnterArr.push(n);
    } else {
      npcSrc = n.getComponent(Npc);
      npcSrc.curMovePos = GameGlobal.npcList.getListEnterPos(this.node.worldPosition.clone());
      npcSrc.workStage = NpcWorkStage.enterNpcList;
      npcSrc.state = NpcState.move;
    }
  }

  public updateNpcEnter() {
    if (this.npcWaitEnterArr.length <= 0) return;
    if (this.npcListArr.length >= GameGlobal.cunterListMax) return;
    let npcNode = this.npcWaitEnterArr.shift();
    if (npcNode != null) {
      let npcSrc: Npc = npcNode.getComponent(Npc);
      npcSrc.curMovePos = GameGlobal.npcList.getListEnterPos(this.node.worldPosition.clone());
      npcSrc.workStage = NpcWorkStage.enterNpcList;
      npcSrc.state = NpcState.move;
    }
  }
}
