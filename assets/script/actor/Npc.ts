import {
  _decorator,
  Collider,
  Component,
  CylinderCollider,
  instantiate,
  Label,
  math,
  Node,
  Prefab,
  ProgressBar,
  Quat,
  RigidBody,
  SkeletalAnimation,
  Animation,
  tween,
  v3,
  Vec3,
  EffectAsset,
  BoxCollider,
  CapsuleCollider,
} from "cc";
import { Utils } from "../Utils";
import { GameGlobal } from "../GameGlobal";
import { CooltimeBar } from "../UI3d/CooltimeBar";
import { Spr } from "../sprite/Spr";
import { NpcAniState, NpcFashion, NpcState, NpcWorkStage } from "../EnumDefine";
import { Moeny } from "../builds/Moeny";
import { DissolveController } from "./DissolveController";
import { AudioManager } from "../AudioManager";

const { ccclass, property } = _decorator;

@ccclass("Npc")
export class Npc extends Component {
  @property(CylinderCollider)
  public c_collider: CylinderCollider;

  @property(Prefab)
  public moneyPfb: Prefab;
  @property(Node)
  public coinPosNode: Node;

  @property(Node)
  headPos: Node;
  @property(Node)
  attTriggerNode: Node;

  @property(Node)
  saveEfc: Node;
  @property(Node)
  equipEfc: Node;
  @property(Node)
  attackEfc: Node;
  @property(Node)
  weaponShader: Node;
  @property(Node)
  hitEfc: Node;
  @property(Prefab)
  biaoq: Prefab;

  public BGback: Node;
  uiCoolBar: Node;
  smileBGNode: Node;
  smileNode: Node;

  selfCollider: CapsuleCollider;
  selfRigidBody: RigidBody;

  private smileAni: Animation;

  /**当前衣服(模型)状态 */
  public currShowNpc: number = 0; //0冰人 1浴巾 2囚服
  equipMod: Node; //囚服模型
  equipWeapon: Node; //囚服模型武器
  towelMod: Node; //浴巾模型
  iceMod: Node; //冰冻模型

  public isready = false; //是否可以拾取
  public timeDownBar: ProgressBar;
  public progressTween = null;

  /**当前跳出水池的目标点 做判断处理*/
  public curJumpPos: Vec3 = new Vec3(0, 0, 0);
  /**当前跳出水池的目标点下标 做判断处理*/
  public inWaterIdx: number = -1;

  //血量
  public curHp: number = 2;
  //状态机
  public state: number = NpcState.Ice; //0待机 ,1寻路到柜台,2寻敌,3攻击,4死亡
  //工作步骤
  public workStage: number = NpcWorkStage.ice;

  //移动、朝向相关
  tempPos: Vec3 = new Vec3();
  currForward: Vec3 = new Vec3();
  tempV3: Vec3 = new Vec3();
  destForward: Vec3 = new Vec3();
  targetQuat: Quat = new Quat();
  /**视觉朝向（用于平滑旋转，与移动方向分离） */
  private _visualForward: Vec3 = new Vec3(0, 0, -1);
  /**移动速度 */
  public speed: number = 4.5;
  moveDis = 0.1;
  /**转向速度（值越大转向越快） */
  public turnSpeed: number = 5;

  /**多个攻击目标 */
  public enemyList: Node[] = [];
  /**当前移动的目标点 */
  public curMovePos: Vec3 = null;
  /**到达战斗区域 */
  public isBattle: boolean = false;
  /**已死亡 */
  public isDeath: boolean = false;
  /**去战斗区域经过的下标 */
  public toBattleIdx: number = 0;
  /**去战斗区域经过的点 */
  public toBattleArr: Vec3[];

  public coinNum: number = 0; //金币数计数
  public takeOffTime: number = 0.02; //扔钱间隔时间
  public coinTime: number = 0; //时间计数

  private attCd: number = 0.5; //攻击冷却时间
  private attCdTime: number = 0.5; //攻击冷却时间计数
  private isAttacking: boolean = false; //攻击动画播放中，禁止被移动打断

  //动画
  currAnim: string;
  anim0: SkeletalAnimation;
  anim1: SkeletalAnimation;
  anim2: SkeletalAnimation;

  /**正在挨打 */
  public isHit: boolean = false;

  start() {
    this.equipMod = this.node.getChildByName("bodyMod").getChildByName("equip");
    this.towelMod = this.node.getChildByName("bodyMod").getChildByName("towel");
    this.iceMod = this.node.getChildByName("bodyMod").getChildByName("ice");
    this.equipWeapon = this.equipMod.getChildByName("langyabang Socket");

    this.attTriggerNode.getComponent(BoxCollider).on("onTriggerEnter", this.onAttTriggerEnter, this);
    this.attTriggerNode.getComponent(BoxCollider).on("onTriggerStay", this.onAttTriggerStay, this);
    this.attTriggerNode.getComponent(BoxCollider).on("onTriggerExit", this.onAttTriggerExit, this);

    this.anim0 = this.iceMod.getComponent(SkeletalAnimation);
    this.anim1 = this.towelMod.getComponent(SkeletalAnimation);
    this.anim2 = this.equipMod.getComponent(SkeletalAnimation);
    this.selfCollider = this.node.getComponent(CapsuleCollider);
    this.selfRigidBody = this.node.getComponent(RigidBody);
    this.selfCollider.isTrigger = true;
    this.selfRigidBody.enabled = false;
    this.attTriggerNode.active = false;

    let biaoqNode = instantiate(this.biaoq);
    biaoqNode.parent = GameGlobal.mainGame.node.getChildByName("iconList");
    biaoqNode.getComponent(CooltimeBar).target = this.node.getChildByName("HeadAnchor");
    this.BGback = biaoqNode.getChildByName("BG");
    this.smileBGNode = biaoqNode.getChildByName("smileBg");
    this.smileNode = biaoqNode.getChildByName("smile");
    this.smileAni = this.smileNode.getComponent(Animation);
    this.timeDownBar = this.BGback.getChildByName("ProgressBar").getComponent(ProgressBar);
    this.BGback.active = false;
    this.timeDownBar.progress = 0;

    this.smileBGNode.active = false;
    this.smileNode.active = false;
  }

  //#region 触发器相关
  onAttTriggerEnter(self) {
    if (this.workStage == NpcWorkStage.battle && this.state == NpcState.attack) {
      let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
      if (body.getGroup() == 8) {
        let sprSrc = body.node.getComponent(Spr);
        if (sprSrc && sprSrc.hp > 0 && sprSrc.attackerNode == null) {
          sprSrc.attackerNode = this.node;
          this.enemyList.push(body.node);
        }
      }
    }
  }

  onAttTriggerStay(self) {}

  onAttTriggerExit(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 8) {
      let sprSrc = body.node.getComponent(Spr);
      if (sprSrc && sprSrc.attackerNode != null && sprSrc.attackerNode.uuid == this.node.uuid) {
        this.onRemoveEnmey(body.node);
        sprSrc.attackerNode = null;
      }
    }
  }

  //#region Update
  protected update(dt: number): void {
    if (GameGlobal.isOver) {
      this.animPlay(NpcAniState.Idle);
      return;
    }

    if (this.isBattle) {
      if (!this.attTriggerNode.active) {
        this.attTriggerNode.active = true;
      }
    }
    switch (this.state) {
      case NpcState.Idle: //待机
        this.onIdle(dt);
        break;
      case NpcState.Ice: //冰人
        break;
      case NpcState.move: //移动
        this.stateMove(dt);
        break;
      case NpcState.coin: //投钱
        this.onPayCoin(dt);
        break;
      case NpcState.attack: //攻击
        this.onAttack(dt);
        break;
      case NpcState.death: //死亡
        this.onDeath();
        break;
    }
    this.onHit(dt);
  }

  //#region 状态控制中心
  public onStateCenter() {
    if (this.workStage == NpcWorkStage.enterNpcList) {
      if (GameGlobal.npcList.onCheckIsFistNpc(this.node)) {
        this.moveToEquip();
      } else {
        GameGlobal.npcList.npcListArr.push(this.node);
        GameGlobal.npcList.onNewEnjoy();
      }
    } else if (this.workStage == NpcWorkStage.toListFrist) {
      this.state = NpcState.Idle;
      this.scheduleOnce(() => {
        GameGlobal.npcList.equipNode = this.node;
        this.curMovePos = null;
        this.workStage = NpcWorkStage.payMoney;
        this.state = NpcState.coin;
      }, 0.25);

      this.lookAt(GameGlobal.mainGame.GamePosNode.getChildByName("conterPos").worldPosition.clone());
    } else if (this.workStage == NpcWorkStage.waitList) {
      this.curMovePos = null;
      this.state = NpcState.Idle;
      this.lookAt(GameGlobal.mainGame.GamePosNode.getChildByName("conterPos").worldPosition.clone());
    } else if (this.workStage == NpcWorkStage.payMoney) {
    } else if (this.workStage == NpcWorkStage.toBattle) {
      this.moveToBattle();
    } else if (this.workStage == NpcWorkStage.findEnemy) {
      this.findEnmey();
    } else if (this.workStage == NpcWorkStage.battle) {
      if (this.checkCanAttack()) {
        if (this.state != NpcState.attack) {
          this.attCdTime = this.attCd;
        }
        this.state = NpcState.attack;
      } else {
        this.workStage = NpcWorkStage.findEnemy;
        this.findEnmey();
      }
    } else if (this.workStage == NpcWorkStage.die) {
    }
  }

  //#region 检查范围内有没有敌人
  private checkCanAttack() {
    let haveEnemy = false;
    if (this.enemyList.length) {
      for (let i = 0; i < this.enemyList.length; i++) {
        let enemy = this.enemyList[i];
        if (enemy == null) continue;
        if (!enemy.components) continue;
        if (enemy.components.length <= 0) continue;
        if (enemy.isValid == false) continue;
        let sprSrc = enemy.getComponent(Spr);
        if (sprSrc && sprSrc.hp > 0) {
          let checkePos = new Vec3(enemy.worldPosition.x, 0, enemy.worldPosition.z);
          let dis = Vec3.distance(this.node.worldPosition, checkePos);
          if (dis < 2) {
            return true;
          }
        }
      }
    }
    return false;
  }

  //#region 获取跳出池子的落点
  private getThrowTargetPos(): Vec3 {
    let inPosArr: Vec3[] = [];
    let toPosArr: Vec3[] = [];
    if (GameGlobal.bOpenPool) {
      inPosArr = GameGlobal.inWaterPos6Arr;
      toPosArr = GameGlobal.toWaterPos6Arr;
    } else {
      inPosArr = GameGlobal.inWaterPos2Arr;
      toPosArr = GameGlobal.toWaterPos2Arr;
    }
    for (let i = 0; i < inPosArr.length; i++) {
      if (this.curJumpPos.equals(inPosArr[i])) return toPosArr[i];
    }

    return toPosArr[0];
  }

  //#region NPC待机
  onIdle(dt) {
    this.animPlay(NpcAniState.Idle);
  }

  //#region 角色移动
  stateMove(dt) {
    if (this.curMovePos == null) {
      return;
    }
    // 战斗下使用更小的到达阈值，确保 NPC 真正靠近目标
    const threshold = this.isBattle ? 2 : this.moveDis;
    this.doMove(dt, threshold, this.curMovePos, () => {
      if (!this.isBattle) {
        this.node.worldPosition = this.curMovePos;
      }
      this.onStateCenter();
    });
  }

  public doMove(deltaTime, value, topos, call?) {
    this.animPlay(NpcAniState.Move);
    let s = deltaTime * this.speed;

    if (this.isBattle) {
      let dx = topos.x - this.node.worldPosition.x;
      let dz = topos.z - this.node.worldPosition.z;
      let len = Math.sqrt(dx * dx + dz * dz);
      if (len > 0.001) {
        this.currForward.set(dx / len, 0, dz / len);
      }
      Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
      this.avoidOverlap(this.tempPos);
      this.lookAt2(topos, deltaTime);
    } else {
      Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
      this.lookAt(topos);
    }

    this.node.setPosition(this.tempPos);
    let dis = Vec3.distance(this.tempPos, topos);
    if (dis < value) {
      call && call();
      return;
    }
  }

  /**
   * 战斗模式下避开与无关精灵重叠（不避开当前攻击目标）
   */
  private avoidOverlap(pos: Vec3) {
    const sprChildren = GameGlobal.sprlist?.node?.children;
    if (!sprChildren) return;
    const minDist = 1.5;
    for (let sprNode of sprChildren) {
      if (!sprNode || !sprNode.isValid) continue;
      const spr = sprNode.getComponent(Spr);
      if (!spr || spr.hp <= 0) continue;
      // 不推开自己正在追击的目标
      if (this.enemyList.indexOf(sprNode) !== -1) continue;
      const sprPos = sprNode.worldPosition;
      const dx = pos.x - sprPos.x;
      const dz = pos.z - sprPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        if (dist > 0.01) {
          pos.set(sprPos.x + (dx / dist) * minDist, pos.y, sprPos.z + (dz / dist) * minDist);
        }
      }
    }
  }

  /**
   * @zh
   * 设置当前节点旋转为面向目标位置，默认前方为 -z 方向
   * @param pos 目标位置
   */
  lookAt(pos: Vec3) {
    let a1 = v3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    let a2 = v3(pos.x, 0, pos.z);
    Vec3.subtract(this.tempV3, a2, a1);
    this.tempV3.normalize();
    Quat.rotationTo(this.targetQuat, GameGlobal.actor.ActorDirection, this.tempV3);
    this.destForward.set(this.tempV3);
    this.currForward.set(this.tempV3);
    this._visualForward.set(this.tempV3);
    this.node.setWorldRotation(this.targetQuat);
  }

  /**
   * @zh
   * 带差值平滑转向目标位置，默认前方为 -z 方向
   * @param pos 目标位置
   * @param dt 帧间隔时间
   */
  lookAt2(pos: Vec3, dt: number) {
    let a1 = v3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    let a2 = v3(pos.x, 0, pos.z);
    Vec3.subtract(this.tempV3, a2, a1);
    this.tempV3.normalize();
    this.destForward.set(this.tempV3);

    // 平滑插值视觉朝向到目标朝向
    Vec3.lerp(this._visualForward, this._visualForward, this.destForward, dt * this.turnSpeed);
    this._visualForward.normalize();

    Quat.rotationTo(this.targetQuat, GameGlobal.actor.ActorDirection, this._visualForward);
    this.node.setWorldRotation(this.targetQuat);
  }

  //移动去柜台排队第一位
  moveToEquip() {
    GameGlobal.npcList.equipNode = this.node;
    this.curMovePos = GameGlobal.npcList.equipPos;
    this.workStage = NpcWorkStage.toListFrist;
    this.state = NpcState.move;
  }

  //柜台排队向前移动
  moveToNext(targetPos: Vec3) {
    this.curMovePos = targetPos;
    this.workStage = NpcWorkStage.waitList;
    this.state = NpcState.move;
  }

  //离开柜台去往战斗区域
  moveToBattle() {
    if (this.toBattleArr == null) {
      this.toBattleArr = [].concat(GameGlobal.npcToBattlePos);
      if (GameGlobal.battlePosIdx >= 5) GameGlobal.battlePosIdx = 0;
      this.toBattleArr.push(GameGlobal.npcBattlePos[GameGlobal.battlePosIdx]);
      GameGlobal.battlePosIdx++;
    }
    if (this.toBattleArr.length > this.toBattleIdx) {
      this.curMovePos = this.toBattleArr[this.toBattleIdx];
      this.toBattleIdx++;
      this.state = NpcState.move;
    } else {
      this.isBattle = true;
      this.workStage = NpcWorkStage.findEnemy;
      this.selfRigidBody.enabled = true;
      this.selfCollider.isTrigger = false;
      this.moveDis = 2;
    }
  }

  //#region  到达战斗区域寻怪
  findEnmey() {
    //理论上不会没有怪
    // if (GameGlobal.sprlist.node.children.length == 0) {
    //   return;
    // }
    let tarSpr: Node = null;
    let tardis = 0;
    for (let index = 0; index < GameGlobal.sprlist.node.children.length; index++) {
      let sprNode = GameGlobal.sprlist.node.children[index];
      let distance = Vec3.distance(this.node.worldPosition, sprNode.worldPosition);
      //新加条件：找没有被某个NPC定为目标的怪
      if (sprNode.getComponent(Spr) && sprNode.getComponent(Spr).hp > 0 && sprNode.getComponent(Spr).attackerNode == null) {
        if (tardis == 0) {
          tardis = distance;
          tarSpr = sprNode;
        } else {
          if (distance < tardis) {
            tardis = distance;
            tarSpr = sprNode;
          }
        }
      }
    }
    // if (tardis < 15) {
    //找到一个最近的作为移动目标
    if (tarSpr == null) return;
    this.enemyList.push(tarSpr);
    this.curMovePos = tarSpr.worldPosition;
    //应该是玩家找到了攻击目标，而怪物的目标应该有个范围自己找,这里新加一个攻击者的标记
    tarSpr.getComponent(Spr).attackerNode = this.node;
    // }
    if (this.enemyList.length > 0) {
      this.workStage = NpcWorkStage.battle;
      this.state = NpcState.move;
    } else {
      this.state = NpcState.Idle;
    }
  }

  //敌人死亡从NPC的目标里移除
  public onRemoveEnmey(n: Node) {
    let idx: number = this.enemyList.indexOf(n);
    if (idx != -1) {
      this.enemyList.splice(idx, 1);
    }
  }

  /** 清理enemyList中已死亡的敌人 */
  private cleanDeadEnemies() {
    for (let i = this.enemyList.length - 1; i >= 0; i--) {
      const spr = this.enemyList[i];
      if (!spr || !spr.isValid) {
        this.enemyList.splice(i, 1);
        continue;
      }
      const sprSrc = spr.getComponent(Spr);
      if (!sprSrc || sprSrc.hp <= 0) {
        this.enemyList.splice(i, 1);
      }
    }
  }

  //#region npc攻击
  onAttack(dt) {
    if (this.curHp <= 0) return;

    // 每帧清理死敌并找到最近的敌人
    this.cleanDeadEnemies();

    let tempArr = [...this.enemyList];
    let targetSprPos: Vec3 = null;
    let targetSprNode: Node = null;
    let tempDis: number = -1;
    for (let spr of tempArr) {
      let sprSrc: Spr = null;
      if (spr && spr.components) sprSrc = spr.getComponent(Spr);
      if (sprSrc && sprSrc.hp > 0) {
        let dis = Vec3.distance(spr.worldPosition, this.node.worldPosition);
        if (tempDis == -1) {
          tempDis = dis;
          targetSprPos = spr.worldPosition.clone();
          targetSprNode = spr;
        } else {
          if (dis < tempDis) {
            tempDis = dis;
            targetSprPos = spr.worldPosition.clone();
            targetSprNode = spr;
          }
        }
      }
    }

    // 没有有效敌人，重新寻怪
    if (targetSprPos == null) {
      if (!this.isAttacking) {
        this.workStage = NpcWorkStage.findEnemy;
        this.findEnmey();
      }
      return;
    }

    // 目标超出攻击范围，切回追击（攻击动画播放中不打断）
    if (tempDis > 2 && !this.isAttacking) {
      this.lookAt2(targetSprPos, dt);
      this.curMovePos = targetSprNode.worldPosition.clone();
      this.state = NpcState.move;
      return;
    }

    // 每帧持续面向最近的敌人
    this.lookAt2(targetSprPos, dt);

    // 攻击冷却控制，冷却未到则只朝向不攻击
    this.attCdTime += dt;
    if (this.attCdTime < this.attCd) {
      if (!this.isAttacking) {
        this.animPlay(NpcAniState.Idle);
      }
      return;
    }
    this.attCdTime = 0;

    this.isAttacking = true;
    this.animPlay(NpcAniState.Attack, () => {
      this.isAttacking = false;
      if (!this.isDeath) this.animPlay(NpcAniState.Idle);
    });
  }

  /**攻击动画帧事件调用 */
  onAttakPoint() {
    let tempArr = [...this.enemyList];
    for (let spr of tempArr) {
      let sprSrc: Spr = null;
      if (spr && spr.components) sprSrc = spr.getComponent(Spr);
      if (sprSrc && sprSrc.hp > 0 && sprSrc.attackerNode !== null && sprSrc.attackerNode.uuid == this.node.uuid) {
        sprSrc.onNpcHit(this.node);
      }
    }
    // if (!GameGlobal.actor.isattMap) return;
    // AudioManager.soundPlay("sprHit3");
    GameGlobal.bHaveNpcAttack = true;
  }

  //#region npc受击
  hitCd: number = 1;
  hitTime: number = 0;

  public applyDamage(damage: number) {
    if (this.isDeath || this.curHp <= 0) return;

    this.curHp -= damage;
    if (GameGlobal.actor.isattMap) AudioManager.soundPlay("npcHit");
    this.hitEfc.active = true;
    this.scheduleOnce(() => {
      if (this.node && this.node.isValid) {
        this.hitEfc.active = false;
      }
    }, 0.7);
    if (this.curHp <= 0) {
      this.curHp = 0;
      this.state = NpcState.death;
    }
  }

  onHit(dt) {
    if (!this.isBattle || this.isDeath) return;
    if (!this.isHit) {
      this.hitTime = 0;
      return;
    }
    this.hitTime += dt;
    if (this.hitTime < this.hitCd) return;
    this.hitTime = 0;
    this.isHit = false;
  }

  //#region npc死亡
  onDeath() {
    if (this.curHp > 0 || this.isDeath) return;
    this.isHit = false;
    this.isDeath = true;
    this.isAttacking = false;
    this.anim2.stop();
    this.animPlay(NpcAniState.Death, () => {
      this.equipMod.getComponent(DissolveController).dissolveAllMat(2, () => {
        // if (this.targetAtt != null) this.targetAtt.getComponent(Spr).targetNode = null;
        this.clearTarget();
        this.node.removeFromParent();
        this.node.destroy();
      });
      this.weaponShader.getComponent(DissolveController).dissolveAllMat(2);
    });
    if (!GameGlobal.actor.isattMap) return;
    AudioManager.soundPlay("npcDeath");
    GameGlobal.bHaveNpcDie = true;
  }

  //#region  死亡后清理NPC的敌人和通知攻击我的怪换目标
  //清理所有
  public clearTarget() {
    while (this.enemyList.length > 0) {
      let spr = this.enemyList.shift();
      if (spr && spr.isValid && spr.components && spr.components.length > 0) {
        let sprSrc = spr.getComponent(Spr);
        if (sprSrc) {
          sprSrc.targetNode = null;
          sprSrc.attackerNode = null;
        }
      }
    }
  }
  //清理指定敌人
  public clearTargetByNode(t: Node) {
    let idx = this.enemyList.indexOf(t);
    if (idx != -1) {
      this.enemyList.splice(idx, 1);
    }
  }

  //#region 向目标移动（带曲线跳跃）
  /**
   * 向目标移动（带曲线跳跃）
   */
  moveToPos(
    n: Node,
    pos: Vec3,
    time: number,
    delay: number,
    isJelly: boolean = false,
    isEuler: boolean = false,
    eulerAngles?: Vec3,
    callback?,
    midPos = new Vec3(0, 2.5, 0),
    halfRatio = 0.8,
    halfCallBack?,
  ) {
    let isHalfRun = false;
    let startPos = n.position.clone();
    let tempVec3 = new Vec3(0, 0, 0);
    let controlPos = new Vec3(0, 0, 0);
    Vec3.add(controlPos, startPos, pos);
    controlPos.multiplyScalar(0.5);
    controlPos.add3f(midPos.x, midPos.y, midPos.z);

    let tweenAttribute = {};
    if (isEuler) {
      tweenAttribute = { position: pos, eulerAngles: eulerAngles };
    } else {
      tweenAttribute = { position: pos };
    }
    tween(n)
      .to(time, tweenAttribute, {
        onUpdate: (target, ratio) => {
          Utils.bezierCurve(ratio, n.position, controlPos, pos, tempVec3);
          n.setPosition(tempVec3);
          if (!isHalfRun && ratio >= halfRatio) {
            halfCallBack && halfCallBack();
            isHalfRun = true;
          }
        },
      })
      .call(() => {
        if (isJelly) {
          let initScale = n.scale.clone();
          Utils.jellyEffect(n, initScale.x, () => {
            n.setWorldScale(Vec3.ONE);
          });
        }
        callback && callback();
      })
      .delay(delay)
      .start();
  }

  //#region 向目标移动（带曲线跳跃）
  /**
   * 向目标移动（带曲线跳跃）
   */
  moveToPos2(n: Node, pos: Vec3, time: number, eulerAngles?: Vec3, callback?) {
    const startPos = n.position.clone();
    const startEuler = n.eulerAngles.clone();
    const jumpHeight = 0.5;

    tween({ t: 0 })
      .to(
        time,
        { t: 1 },
        {
          easing: "smooth",
          onUpdate: (target: any) => {
            const t = target.t;
            const x = startPos.x + (pos.x - startPos.x) * t;
            const z = startPos.z + (pos.z - startPos.z) * t;
            const y = startPos.y + (pos.y - startPos.y) * t + 4 * jumpHeight * t * (1 - t);
            n.setPosition(x, y, z);

            if (eulerAngles) {
              const rx = startEuler.x + this.shortestAngleDelta(startEuler.x, eulerAngles.x) * t;
              const ry = startEuler.y + this.shortestAngleDelta(startEuler.y, eulerAngles.y) * t;
              const rz = startEuler.z + this.shortestAngleDelta(startEuler.z, eulerAngles.z) * t;
              n.setRotationFromEuler(rx, ry, rz);
            }
          },
        },
      )
      .call(() => {
        callback && callback();
      })
      .start();
  }

  private shortestAngleDelta(from: number, to: number): number {
    let delta = to - from;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
  }

  //#region 人物解冻后跳出水池
  /**
   * 播放人物在水池解锁的动画和进度条
   */
  onPlayDefrostAni(n: Node, func?) {
    this.saveEfc.active = true;
    this.BGback.active = true;
    this.smileNode.active = true;
    let npcSrc = n.getComponent(Npc);

    this.towelMod.active = true;
    npcSrc.anim0.play(NpcAniState.ice2);
    npcSrc.anim1.play(NpcAniState.ice2);
    n.getChildByName("bodyMod").eulerAngles = Vec3.ZERO;
    n.getChildByName("bodyMod").position = new Vec3(0, 1, 0);

    npcSrc.iceMod.getComponent(DissolveController).initValue();
    npcSrc.iceMod.getComponent(DissolveController).dissolve(3);

    if (GameGlobal.actor.isWarterAduioMap) {
      AudioManager.soundPlay("npcSign");
    }
    this.smileAni.play("emojiS");
    this.smileAni.once(Animation.EventType.FINISHED, () => {
      this.smileNode.active = false;
      this.smileBGNode.active = false;
    });

    this.progressTween = tween(this.timeDownBar)
      .to(GameGlobal.throwingBodyTime, { progress: 1 })
      .call(() => {
        //生成解救出来的人;
        this.isready = false;
        this.saveEfc.active = false;
        this.BGback.active = false;
        this.smileBGNode.active = true;
        let targetPos = new Vec3(0, 0, 0);
        let pos = this.getThrowTargetPos();
        let tempPos = n.worldPosition.clone();
        targetPos = Utils.localToWorld(n.parent, pos);
        n.setParent(GameGlobal.mainGame.SprListNode.getChildByName("npcList"));
        n.worldPosition = tempPos;
        npcSrc.setNpcFashion(NpcFashion.towel);

        let targetVec3 = new Vec3(0, 0, 0);
        if (!GameGlobal.bOpenPool) {
          targetVec3 = npcSrc.inWaterIdx == 0 ? new Vec3(0, 270, 0) : new Vec3(0, -90, 0);
        }

        this.moveToPos(n, targetPos, 0.3, 0, false, true, targetVec3, () => {
          //人物行走？
          GameGlobal.curWaterBody--;
          // this.smileNode.parent.active = true;
          // this.smileAni.play("hot");
          // this.smileAni.play("emojiS");
          // this.smileAni.once(Animation.EventType.FINISHED, () => {
          //   this.smileNode.parent.active = false;
          // });
          GameGlobal.npcList.checkAndEnterList(this.node);
          // this.curMovePos = GameGlobal.npcList.getListEnterPos(this.node.worldPosition.clone());
          // this.workStage = NpcWorkStage.enterNpcList;
          // this.state = NpcState.move;
        });
      })
      .call(() => {
        func && func();
      })
      .start();
  }

  //#region 扔钱到柜台
  public onPayCoin(dt) {
    this.animPlay(NpcAniState.Idle);
    if (this.coinNum >= GameGlobal.saveMoney) {
      this.coinNum = 0;
      this.coinTime = 0;
      this.setNpcFashion(NpcFashion.equip);
      if (!GameGlobal.actor.isattMap) AudioManager.soundPlay("npcEquip");
      this.equipWeapon.active = true;
      this.equipEfc.active = true;
      this.scheduleOnce(() => {
        GameGlobal.npcList.onEquipEnd();
      }, 0.15);
      this.workStage = NpcWorkStage.toBattle;
      this.onStateCenter();
      return;
    }
    this.coinTime += dt;
    if (this.coinTime < this.takeOffTime) return;
    this.coinTime = 0;
    let curAdd = GameGlobal.saveMoney - this.coinNum;
    if (curAdd > 2) curAdd = 2;
    this.coinNum += curAdd;

    //一次扔两个钱
    let startPos1 = this.coinPosNode.worldPosition.clone();
    let propNode1 = instantiate(this.moneyPfb);
    propNode1.worldPosition = new Vec3(0, -1, 0);
    let moneySrc1 = propNode1.getComponent(Moeny);
    moneySrc1.isready = false;
    moneySrc1.isMoveb = true;
    propNode1.worldPosition = startPos1;
    propNode1.setParent(GameGlobal.moneyFlyList);
    propNode1.eulerAngles = new Vec3(0, 90, 0);

    moneySrc1.isConterEnter = true;
    moneySrc1.cunterStartPos = startPos1;
    moneySrc1.cunterProgress = 0;
    GameGlobal.equipConter.npcPayMoneyArr.push(propNode1);

    // let oldWorlPos1 = propNode1.worldPosition;

    //有可能扔多了，做个检查
    if (curAdd > 1) {
      let propNode2 = instantiate(this.moneyPfb);
      propNode2.worldPosition = new Vec3(0, -1, 0);
      let moneySrc2 = propNode2.getComponent(Moeny);
      moneySrc2.isready = false;
      moneySrc2.isMoveb = true;

      propNode2.worldPosition = startPos1;
      propNode2.setParent(GameGlobal.moneyFlyList);
      propNode2.eulerAngles = new Vec3(0, 90, 0);

      moneySrc2.isConterEnter = true;
      moneySrc2.cunterStartPos = startPos1;
      moneySrc2.cunterProgress = 0;
      GameGlobal.equipConter.npcPayMoneyArr.push(propNode2);
    }
  }

  //#region 设置NPC显示模型
  setNpcFashion(tag: NpcFashion) {
    this.currShowNpc = tag;
    this.iceMod.active = tag == NpcFashion.ice;
    this.towelMod.active = tag == NpcFashion.towel;
    this.equipMod.active = tag == NpcFashion.equip;
  }

  //#region 动画播放方法
  animPlay(name: string, call?) {
    if (this.currAnim == name) {
      return;
    }
    // if (name == NpcAniState.Attack) {
    //   console.log("攻击");
    //   console.log(this.curHp);
    //   if (this.curHp <= 0) {
    //     this.test.active = true;
    //   }
    // }
    if (name == NpcAniState.Attack && GameGlobal.actor.isattMap) AudioManager.soundPlay("attack", 0.5);
    this.currAnim = name;
    if (this.currShowNpc == 0) {
      this.anim0.play(name);
      if (call) {
        this.anim0.once(
          Animation.EventType.FINISHED,

          () => {
            call();
          },
          this,
        );
      }
    } else if (this.currShowNpc == 1) {
      this.anim1.play(name);
      if (call) {
        this.anim1.once(
          Animation.EventType.FINISHED,

          () => {
            call();
          },
          this,
        );
      }
    } else {
      this.anim2.play(name);
      if (call) {
        this.anim2.once(
          Animation.EventType.FINISHED,
          () => {
            call();
          },
          this,
        );
      }
    }
  }
}
