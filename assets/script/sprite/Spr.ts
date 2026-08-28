import {
  _decorator,
  Component,
  Animation,
  Node,
  SkeletalAnimation,
  Quat,
  Vec3,
  v3,
  ProgressBar,
  Prefab,
  instantiate,
  math,
  tween,
  v2,
  CapsuleCollider,
  RigidBody,
  Collider,
} from "cc";
import { GameGlobal } from "../GameGlobal";
import { MonsterState, NpcFashion, StateSpr } from "../EnumDefine";
import { Moeny } from "../builds/Moeny";
import { Npc } from "../actor/Npc";
import { Utils } from "../Utils";
import { AudioManager } from "../AudioManager";
import { DissolveController } from "../actor/DissolveController";
const { ccclass, property } = _decorator;

@ccclass("Spr")
export class Spr extends Component {
  @property(Prefab)
  hitfab: Prefab;
  @property(ProgressBar)
  bloodBarComp: ProgressBar;
  @property(Prefab)
  moneyfab: Prefab;
  @property(Node)
  normalMode: Node;
  @property(Node)
  redMode: Node;
  @property(Collider)
  findTrigger: Collider;
  @property(Node)
  shaderNod: Node;

  anim: SkeletalAnimation;
  currAnim: string;

  targetPos: Vec3 = new Vec3();
  tempV3 = new Vec3();
  targetQuat: Quat;
  destForward: Vec3 = new Vec3(); //归一化的向量
  currForward: Vec3 = new Vec3(); //当前方向，归一化的向量
  tempPos = new Vec3();
  moveSpeed: number = 6;

  public state = 0; //怪物行为 0移动 1攻击 2死亡
  /**打我的NPC 目前只有一个 */
  public attackerNode: Node = null;
  /**我要打的NPC 目前只有一个 */
  public targetNode: Node = null; //攻击目标
  public moveTempPos: Vec3 = new Vec3();
  public idlePos: Vec3 = new Vec3(0, 0, 0);

  public hp = 0;
  public hpmax = 2;
  public bjjilv = 40; //暴击几率
  public propjilv = 100; //道具掉落几率

  public attNode = null; //攻击的目标，用于闪红
  public attcdTime = 0; //攻击间隔
  public attTime = 0;
  public isHit: boolean = false;
  public isDeath: boolean = false;
  public firstRun: boolean = true;

  start() {
    this.bloodBarComp.node.active = false;
    this.targetQuat = new Quat();
    this.destForward.set(0, 0, 0); //归一化的向量
    this.currForward.set(0, 0, -1);
    this.anim = this.node.getChildByName("老鼠").getComponent(SkeletalAnimation);
    this.scheduleOnce(() => {
      this.animPlay("move");
    }, Math.random());

    this.findTrigger.on("onTriggerEnter", this.onNpcTriggerEnter, this);
    this.findTrigger.on("onTriggerExit", this.onNpcTriggerExit, this);
    this.lookAt(GameGlobal.mainGame.GamePosNode.getChildByName("monsterLookPos").worldPosition.clone());
  }

  onNpcTriggerEnter(self) {
    if (this.targetNode != null) return;
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 2 ** 6) {
      let npcSrc = body.node.getComponent(Npc);
      let isParent = false;
      if (npcSrc == null && body.node.name == "attTrigger") {
        npcSrc = body.node.parent.getComponent(Npc);
        isParent = true;
      }
      if (npcSrc == null || npcSrc.currShowNpc != NpcFashion.equip || npcSrc.curHp <= 0) return;
      if (!isParent) {
        this.targetNode = body.node;
      } else {
        this.targetNode = body.node.parent;
      }
    }
  }

  onNpcTriggerExit(self) {
    //仇恨范围？
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 2 ** 6) {
      // let npcSrc = null;
      let npcNode = body.node.parent.parent;
      if (this.targetNode != null && npcNode.uuid == this.targetNode.uuid) this.targetNode = null;
      if (this.attackerNode != null && npcNode.uuid == this.attackerNode.uuid) this.attackerNode = null;
      // npcSrc = body.node.getComponent(Npc);
      // if (body.node)
      //   if (npcSrc) {
      //     this.targetNode = body.node;
      //   } else {
      //     if (npcSrc == null && body.node.name == "attTrigger") npcSrc = body.node.parent.getComponent(Npc);
      //     this.targetNode = body.node.parent;
      //   }
    }
  }

  init(max) {
    this.hpmax = max;
    this.hp = max;
    // this.bloodBarComp.progress = this.hp / this.hpmax;
    // this.bloodBarComp.node.active = false;
  }

  update(deltaTime: number) {
    if (GameGlobal.isOver) {
      return;
    }

    switch (this.state) {
      case MonsterState.idle: //待机（跑）
        this.onIdle(deltaTime);
        break;
      case MonsterState.move: //移动
        this.toMove(deltaTime);
        break;
      case MonsterState.attack: //攻击
        this.ToAtt(deltaTime);
        break;
      case MonsterState.hit: //受击
        this.onHit(deltaTime);
        break;
      case MonsterState.death: //死亡
        this.onDeath();
        break;
    }
    // this.onHit(deltaTime);
  }

  onIdle(dt) {
    if (this.targetNode != null) {
      this.state = MonsterState.move;
      return;
    }
    // if (this.firstRun) {
    //   this.scheduleOnce(() => {
    //     this.animPlay(StateSpr.move);
    //   }, Math.random());
    //   this.firstRun = false;
    // } else {
    //   this.animPlay(StateSpr.move);
    // }
    let dis: number = Vec3.distance(this.node.worldPosition, this.idlePos);
    if (dis > 0.2) {
      this.doMove(dt, 0.1, this.idlePos);
    } else {
      this.node.worldPosition = this.idlePos;
      this.lookAt(GameGlobal.mainGame.GamePosNode.getChildByName("monsterLookPos").worldPosition);
    }
  }

  /**
   * 攻击
   */
  public attColor = false;
  public ToAtt(dt) {
    if (this.targetNode == null) {
      this.state = MonsterState.idle;
      this.scheduleOnce(() => {
        this.animPlay(StateSpr.move);
      }, Math.random());
      return;
    }

    this.attTime += dt;
    if (this.attTime > this.attcdTime) {
      this.attTime = 0;
      let randomCD = math.random() * 0.5;
      this.attcdTime = 1 + randomCD;

      this.animPlay(StateSpr.attack, () => {
        if (this.hp > 0) {
          this.animPlay(StateSpr.idle);
        }
      });
      if (this.targetNode != null) {
        if (!this.targetNode.components || this.targetNode.components.length <= 0) {
          this.targetNode = null;
          return;
        }
        let npcSrc = this.targetNode.getComponent(Npc);
        if (npcSrc != null && (npcSrc.isDeath || npcSrc.curHp <= 0)) {
          this.targetNode = null;
          return;
        }
        npcSrc.isHit = true;
      }
    }
  }

  /**
   * 移动
   * @param dt
   * @returns
   */
  public toMove(dt) {
    if (this.targetNode == null) {
      return;
    }
    this.animPlay(StateSpr.move);

    let s = dt * this.moveSpeed;
    Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
    this.lookAt(this.targetNode.worldPosition);
    this.node.setPosition(this.tempPos);

    this.moveTempPos = new Vec3(this.targetNode.worldPosition.x, 0, this.targetNode.worldPosition.z);
    let dis = Vec3.distance(this.tempPos, this.moveTempPos);
    if (dis < 1) {
      this.state = MonsterState.attack;
    }
  }

  hitTime: number = 0;
  hitCd: number = 1;
  onHit(dt) {
    if (!this.isDeath && this.targetNode == null) {
      this.state = MonsterState.idle;
      this.scheduleOnce(() => {
        this.animPlay(StateSpr.move);
      }, Math.random());
      return;
    }
    if (!this.isHit) return;
    this.hitTime += dt;
    if (this.hitTime < this.hitCd) return;
    this.hitTime = 0;
    this.hp--;
    if (this.hp <= 0) {
      this.state = MonsterState.death;
      this.isHit = false;
    }
  }

  //受击表现
  onNpcHit(n: Node) {
    this.attackerNode = n;
    this.isHit = true;
    this.state = MonsterState.hit;
    this.normalMode.active = false;
    this.redMode.active = true;
    this.animPlay(StateSpr.hit);
    this.scheduleOnce(() => {
      this.normalMode.active = true;
      this.redMode.active = false;
    }, 0.2);
    // AudioManager.soundPlay("sprHit");
    let tuipos = this.getJiTuiPoint(this.attackerNode);
    tween(this.node).to(0.05, { worldPosition: tuipos }).start();
  }

  onDeath() {
    if (this.hp > 0 || this.isDeath) return;
    // AudioManager.audioStop("sprHit");
    this.isDeath = true;
    this.isHit = false;
    this.animPlay(StateSpr.Death, () => {
      this.shaderNod.getComponent(DissolveController).initValue();
      this.shaderNod.getComponent(DissolveController).dissolve(3, () => {
        if (this.targetNode != null && this.targetNode.components) {
          let npcSrc = this.targetNode.getComponent(Npc);
          if (npcSrc != null) {
            npcSrc.clearTargetByNode(this.targetNode);
          }
          this.targetNode = null;
        }
        GameGlobal.monsterDeathArr.push(this.idlePos.clone());
        this.node.destroy();
      });
      // tween(this.node)
      //   .by(1, { position: v3(0, -2, 0) })
      //   .call(() => {
      //     if (this.targetNode != null && this.targetNode.components) {
      //       let npcSrc = this.targetNode.getComponent(Npc);
      //       if (npcSrc != null) {
      //         npcSrc.clearTargetByNode(this.targetNode);
      //       }
      //       this.targetNode = null;
      //     }
      //     GameGlobal.monsterDeathArr.push(this.idlePos.clone());
      //     this.node.destroy();
      //   })
      //   .start();
    });
    this.addProp();
  }

  public DelHp(del): boolean {
    if (this.hp <= 0) {
      return true;
    }

    if (del == 1) {
      this.node.getChildByName("baodian2").active = true;
      this.scheduleOnce(() => {
        this.node.getChildByName("baodian2").active = false;
      }, 0.3);
    }

    this.hp -= del;
    if (this.hp <= 0) {
      this.state = MonsterState.death;
      this.addProp();
    }
  }

  //掉落道具
  public addProp() {
    let nowNum = GameGlobal.mainGame.SprListNode.getChildByName("propList").children.length;
    if (nowNum > 50) {
      return;
    }
    for (let i = 0; i < GameGlobal.killMoney; i++) {
      let r = Math.sqrt(Math.random() * 3 ** 2);
      let angle = Math.random() * 2 * Math.PI;
      let x = r * Math.cos(angle);
      let z = r * Math.sin(angle);
      let targetPos = v3(x, 0, z); //目标位置

      let propNode = instantiate(this.moneyfab);
      propNode.parent = this.node;
      let worldpos = propNode.worldPosition;
      propNode.parent = GameGlobal.mainGame.SprListNode.getChildByName("propList");
      propNode.worldPosition = worldpos;
      let moneySrc = propNode.getComponent(Moeny);
      targetPos = v3(this.node.worldPosition.x + targetPos.x, 0, this.node.worldPosition.z + targetPos.z);
      let targetEuler = new Vec3(0, Utils.randomRange(0, 360), 0);
      propNode.eulerAngles = targetEuler;
      moneySrc.moveToPos(true, targetPos, 0.25, new Vec3(0, 2, 0), () => {});
    }
  }

  //#region 被击退
  public getJiTuiPoint(PlayerNode: Node) {
    let juli: number = 1.5;
    let posA = PlayerNode.worldPosition.clone();
    let posB = this.node.worldPosition.clone();
    let posAB = v2(posB.x - posA.x, posB.z - posA.z);
    let unitAB = posAB.normalize();
    let posC = v3(posB.x + unitAB.x * juli, 0, posB.z + unitAB.y * juli);
    return posC;
  }

  animPlay(name: string, call?) {
    if (this.currAnim == name) {
      return;
    }
    this.currAnim = name;
    this.anim.play(name);
    if (call) {
      this.anim.once(
        Animation.EventType.FINISHED,
        () => {
          call();
        },
        this,
      );
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
    this.node.setWorldRotation(this.targetQuat);
  }

  //移动
  public doMove(deltaTime, value, topos, call?) {
    // this.animPlay(State_User.Move);
    let s = deltaTime * this.moveSpeed;
    Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
    this.lookAt(topos);
    let dis = Vec3.distance(this.tempPos, topos);
    if (dis < value) {
      call && call();
      return;
    }
    this.node.setPosition(this.tempPos);
  }
}
