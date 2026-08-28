import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { Spr } from "./Spr";
import { MonsterState, StateSpr } from "../EnumDefine";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("sprlist")
export class sprlist extends Component {
  @property(Prefab)
  sprfab: Prefab;

  public zidanPanList: Node;
  public isoneb = true;

  public sprMax = 32; //同屏怪物上限

  private dieCount: number = 0;
  private hitCount: number = 0;
  onLoad() {
    GameGlobal.sprlist = this;
  }

  start() {
    GameGlobal.npcToBattlePos.push(GameGlobal.mainGame.GamePosNode.getChildByName("findRoadPos1").worldPosition.clone());
    GameGlobal.npcToBattlePos.push(GameGlobal.mainGame.GamePosNode.getChildByName("findRoadPos2").worldPosition.clone());
    for (let i = 0; i < 5; i++) {
      GameGlobal.npcBattlePos.push(GameGlobal.mainGame.GamePosNode.getChildByName("battlePos" + i).worldPosition.clone());
    }
    this.initMonsterPos();
    this.initSpr();
  }

  update(dt: number) {
    if (GameGlobal.isOver) {
      return;
    }
    if (GameGlobal.actor == null) {
      return;
    }
    if (GameGlobal.monsterDeathArr.length > 0) {
      this.addSpr(GameGlobal.monsterDeathArr.shift());
    }
    this.updateAllMonsterAudio();
  }

  updateAllMonsterAudio() {
    if (GameGlobal.isOver || GameGlobal.isStop) return;
    if (!GameGlobal.actor.isattMap) return;
    if (GameGlobal.bHaveMonsterDie && this.dieCount < GameGlobal.audioPlayMax) {
      GameGlobal.bHaveMonsterDie = false;
      AudioManager.soundPlay("sprDeath");
      this.dieCount++;
      this.scheduleOnce(() => {
        this.dieCount--;
      }, Math.random() * 2);
    }
    if (GameGlobal.bHaveMonsterHit && this.hitCount < GameGlobal.audioPlayMax) {
      GameGlobal.bHaveMonsterHit = false;
      AudioManager.soundPlay("sprHit");
      this.dieCount++;
      this.scheduleOnce(() => {
        this.dieCount--;
      }, Math.random() * 2);
    }
  }

  //初始第一次刷怪
  public initSpr() {
    for (let i = 0; i < GameGlobal.monsterIdlePosArr.length; i++) {
      let SprNode = instantiate(this.sprfab);
      let sprSrc = SprNode.getComponent(Spr);
      SprNode.parent = this.node;
      SprNode.worldPosition = GameGlobal.monsterIdlePosArr[i];
      sprSrc.idlePos = SprNode.worldPosition.clone();
      sprSrc.init(1);
      // this.scheduleOnce(() => {
      //   sprSrc.state = MonsterState.idle;
      // }, Math.random());
    }
  }

  //添加刷怪
  public addSpr(pos: Vec3) {
    let SprNode = instantiate(this.sprfab);
    let sprSrc = SprNode.getComponent(Spr);
    SprNode.parent = this.node;
    SprNode.worldPosition = this.getinitPos(pos);
    sprSrc.idlePos = pos;
    sprSrc.init(1);
    sprSrc.state = MonsterState.idle;
    this.scheduleOnce(() => {
      sprSrc.animPlay(StateSpr.move);
    }, Math.random());
  }

  //获取最近的出生坐标
  public getinitPos(pos: Vec3): Vec3 {
    let resultPos: Vec3 = null;
    let minDis: number = -1;
    for (let i: number = 0; i < GameGlobal.monsterBirthPosArr.length; i++) {
      if (resultPos == null) {
        resultPos = GameGlobal.monsterBirthPosArr[i];
        minDis = Vec3.distance(pos, resultPos);
      } else {
        let dis = Vec3.distance(pos, GameGlobal.monsterBirthPosArr[i]);
        if (dis < minDis) {
          minDis = dis;
          resultPos = GameGlobal.monsterBirthPosArr[i];
        }
      }
    }
    return resultPos;
  }

  initMonsterPos() {
    for (let i = 0; i < this.sprMax; i++) {
      GameGlobal.monsterIdlePosArr.push(GameGlobal.mainGame.GamePosNode.getChildByName("monsterPos" + i).worldPosition.clone());
    }
    for (let i = 0; i < 6; i++) {
      GameGlobal.monsterBirthPosArr.push(
        GameGlobal.mainGame.GamePosNode.getChildByName("monsterBirthPos" + i).worldPosition.clone(),
      );
    }
  }
}
