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
  tween,
  v2,
  RigidBody,
  Collider,
} from "cc";
import { GameGlobal } from "../GameGlobal";
import { MonsterState, NpcFashion, StateSpr } from "../EnumDefine";
import { Moeny } from "../builds/Moeny";
import { Npc } from "../actor/Npc";
import { Utils } from "../Utils";
import { DissolveController } from "../actor/DissolveController";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("Spr")
export class Spr extends Component {
  // ==================== 编辑器属性 ====================
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
  @property(Node)
  hitEffect: Node;
  @property(Node)
  test: Node;

  // ==================== 公开状态（外部访问） ====================
  public state: MonsterState = MonsterState.idle;
  public attackerNode: Node = null;
  public targetNode: Node = null;
  public idlePos: Vec3 = new Vec3(0, 0, 0);

  public hp = 0;
  public hpmax = 2;
  public bjjilv = 40;
  public propjilv = 100;

  public attcdTime = 0;
  public attTime = 0;
  public isHit: boolean = false;
  public isDeath: boolean = false;
  public isDeathClearFinish: boolean = false;

  public moveTempPos: Vec3 = new Vec3();

  public isRandomMove: boolean = false;

  // ==================== 内部状态 ====================
  private anim: SkeletalAnimation;
  private currAnim: string;
  private moveSpeed: number = 6;
  private hasDeathTriggered: boolean = false;
  private isHitBack: boolean = false;
  private isHitEfcShow: boolean = false;
  private hitTime: number = 0;
  private hitCd: number = 0.5;

  // 分离避让（避免Spr之间重叠）
  private readonly SEPARATION_RADIUS = 1.2;
  private readonly SEPARATION_FORCE = 0.05;

  // 临时向量（复用以减少GC）
  private tempV3: Vec3 = new Vec3();
  private tempPos: Vec3 = new Vec3();
  private targetQuat: Quat;
  private destForward: Vec3 = new Vec3();
  private currForward: Vec3 = new Vec3();

  // ==================== 生命周期 ====================
  start() {
    this.bloodBarComp.node.active = false;
    this.targetQuat = new Quat();
    this.destForward.set(0, 0, 0);
    this.currForward.set(0, 0, -1);
    this.anim = this.node.getChildByName("老鼠").getComponent(SkeletalAnimation);

    // this.scheduleOnce(() => {
    //   this.animPlay(StateSpr.move);
    // }, Math.random() * 2);

    this.findTrigger.on("onTriggerEnter", this.onNpcTriggerEnter, this);
    this.findTrigger.on("onTriggerExit", this.onNpcTriggerExit, this);
    this.lookAt(GameGlobal.mainGame.GamePosNode.getChildByName("monsterLookPos").worldPosition.clone());
  }

  update(dt: number) {
    if (GameGlobal.isOver) return;

    this.checkTargetsValid();
    this.processHitDamage(dt);
    this.processState(dt);
  }

  // ==================== 公开方法 ====================

  init(max: number) {
    this.hpmax = max;
    this.hp = max;
  }

  /** 外部通过减血来触发死亡 */
  DelHp(del: number): boolean {
    if (this.hp <= 0) return true;

    if (del === 1) {
      const baodian = this.node.getChildByName("baodian2");
      if (baodian) {
        baodian.active = true;
        this.scheduleOnce(() => {
          if (this.node && this.node.isValid) {
            const bd = this.node.getChildByName("baodian2");
            if (bd) bd.active = false;
          }
        }, 0.3);
      }
    }

    this.hp -= del;
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = MonsterState.death;
      return true;
    }
    return false;
  }

  /** NPC攻击命中本怪物 */
  onNpcHit(n: Node) {
    if (this.isHit || this.isHitBack || this.hasDeathTriggered) return;

    this.isHitBack = true;
    this.attackerNode = n;
    this.isHit = true;

    this.DelHp(1);

    this.normalMode.active = false;
    this.redMode.active = true;
    this.animPlay(StateSpr.hit);
    if (GameGlobal.actor.isattMap) {
      AudioManager.soundPlay("sprHit3", 0.5);
    }
    this.scheduleOnce(() => {
      if (this.node && this.node.isValid) {
        this.normalMode.active = true;
        this.redMode.active = false;
      }
    }, 0.2);

    this.showHitEffect();

    if (this.hasDeathTriggered) return;

    const knockPos = this.calcKnockbackPos(this.attackerNode);
    if (knockPos) {
      tween(this.node)
        .to(0.05, { worldPosition: knockPos })
        .call(() => {
          this.isHitBack = false;
        })
        .start();
    } else {
      this.isHitBack = false;
    }
  }

  // ==================== 状态机 ====================

  private processState(dt: number) {
    switch (this.state) {
      case MonsterState.idle:
        this.doIdle(dt);
        break;
      case MonsterState.move:
        this.doMove(dt);
        break;
      case MonsterState.attack:
        this.doAttack(dt);
        break;
      case MonsterState.death:
        this.doDeath();
        break;
    }
  }

  private doIdle(dt: number) {
    // 已死亡则等待清理完毕
    if (this.hasDeathTriggered) return;

    // 有攻击者则设为追击目标
    if (this.attackerNode != null && this.attackerNode.isValid) {
      const npcSrc = this.attackerNode.getComponent(Npc);
      if (npcSrc != null && npcSrc.curHp > 0) {
        this.targetNode = this.attackerNode;
        this.state = MonsterState.move;
        return;
      }
    }

    // 有目标则追击
    if (this.targetNode != null) {
      this.state = MonsterState.move;
      return;
    }

    // 返回待机位置
    this.animPlay(StateSpr.move);
    const dis = Vec3.distance(this.node.worldPosition, this.idlePos);
    if (dis > 0.2) {
      this.moveToward(dt, 0.1, this.idlePos);
    } else {
      this.node.worldPosition = this.idlePos;
      this.lookAt(GameGlobal.mainGame.GamePosNode.getChildByName("monsterLookPos").worldPosition);
    }
  }

  private doMove(dt: number) {
    if (this.targetNode == null || !this.targetNode.isValid) {
      this.state = MonsterState.idle;
      return;
    }

    const npcSrc = this.targetNode.getComponent(Npc);
    if (npcSrc == null || npcSrc.curHp <= 0) {
      this.targetNode = null;
      this.state = MonsterState.idle;
      return;
    }

    this.animPlay(StateSpr.move);

    const s = dt * this.moveSpeed;
    Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
    this.lookAt(this.targetNode.worldPosition);
    this._applySeparation(this.tempPos);
    this.node.setPosition(this.tempPos);

    this.moveTempPos.set(this.targetNode.worldPosition.x, 0, this.targetNode.worldPosition.z);
    const dis = Vec3.distance(this.tempPos, this.moveTempPos);
    if (dis < 2) {
      this.state = MonsterState.attack;
    }
  }

  private doAttack(dt: number) {
    if (this.targetNode == null || !this.targetNode.isValid) {
      this.state = MonsterState.idle;
      return;
    }

    const npcSrc = this.targetNode.getComponent(Npc);
    if (npcSrc == null || npcSrc.curHp <= 0 || npcSrc.isDeath) {
      this.targetNode = null;
      this.state = MonsterState.idle;
      return;
    }

    // 目标跑远了，切回追击
    this.moveTempPos.set(this.targetNode.worldPosition.x, 0, this.targetNode.worldPosition.z);
    const dis = Vec3.distance(this.node.worldPosition, this.moveTempPos);
    if (dis > 2) {
      this.state = MonsterState.move;
      return;
    }

    this.attTime += dt;
    if (this.attTime >= this.attcdTime) {
      this.attTime = 0;
      this.attcdTime = 0.5 + Math.random() * 0.5;

      this.animPlay(StateSpr.attack, () => {
        if (this.hp > 0 && this.state === MonsterState.attack) {
          this.animPlay(StateSpr.idle);
        }
      });

      if (this.targetNode != null && this.targetNode.isValid) {
        const npc = this.targetNode.getComponent(Npc);
        if (npc.isHit) return;
        if (npc != null && npc.curHp > 0 && !npc.isDeath) {
          npc.isHit = true;
          npc.applyDamage(1);
        }
      }
    }
  }

  /** 死亡：只触发一次清理流程 */
  private doDeath() {
    if (this.hasDeathTriggered) return;
    this.hasDeathTriggered = true;
    this.isDeath = true;
    this.isHit = false;

    this.spawnProp();
    this.animPlay(StateSpr.Death, () => {
      const dissolveCtrl = this.shaderNod.getComponent(DissolveController);
      dissolveCtrl.initValue();
      dissolveCtrl.dissolve(3, () => {
        this.cleanupAndDestroy();
      });
    });
  }

  // ==================== 受击冷却（独立于状态机） ====================

  private processHitDamage(dt: number) {
    if (!this.isHit || this.hasDeathTriggered) return;

    this.hitTime += dt;
    if (this.hitTime < this.hitCd) return;
    this.hitTime = 0;
    this.isHit = false;
  }

  // ==================== 清理与销毁 ====================

  private cleanupAndDestroy() {
    if (this.targetNode != null && this.targetNode.isValid) {
      const npcSrc = this.targetNode.getComponent(Npc);
      if (npcSrc != null) {
        npcSrc.clearTargetByNode(this.node);
      }
    }
    this.targetNode = null;
    this.attackerNode = null;

    if (this.node && this.node.isValid) {
      GameGlobal.monsterDeathArr.push(this.idlePos.clone());
      this.node.removeFromParent();
      this.node.destroy();
    }
    this.isDeathClearFinish = true;
  }

  // ==================== 掉落道具 ====================

  private spawnProp() {
    const propList = GameGlobal.mainGame.SprListNode.getChildByName("propList");
    if (propList.children.length > GameGlobal.moneySprMaxY) return;

    for (let i = 0; i < GameGlobal.killMoney; i++) {
      const r = Math.sqrt(Math.random() * 9);
      const angle = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);

      const propNode = instantiate(this.moneyfab);
      const worldPos = this.node.worldPosition.clone();
      propNode.parent = propList;
      propNode.worldPosition = worldPos;

      const moneySrc = propNode.getComponent(Moeny);
      const targetPos = v3(worldPos.x + x, 0, worldPos.z + z);
      const targetEuler = new Vec3(0, Utils.randomRange(0, 360), 0);
      propNode.eulerAngles = targetEuler;
      moneySrc.moveToPos(true, targetPos, 0.25, new Vec3(0, 2, 0), () => {});
    }
  }

  // ==================== 受击表现 ====================

  private showHitEffect() {
    if (!this.isHitEfcShow) {
      this.isHitEfcShow = true;
      this.hitEffect.active = true;
      this.scheduleOnce(() => {
        if (this.node && this.node.isValid) {
          this.hitEffect.active = false;
          this.isHitEfcShow = false;
        }
      }, 0.3);
    }
  }

  // ==================== 击退计算 ====================

  /** 计算击退目标位置，如果后方被其他Spr挡住则返回null表示不击退 */
  private calcKnockbackPos(playerNode: Node): Vec3 | null {
    const juli = 1.5;
    const posA = playerNode.worldPosition;
    const posB = this.node.worldPosition;
    const ab = v2(posB.x - posA.x, posB.z - posA.z);
    const unitAB = ab.normalize();
    const targetPos = v3(posB.x + unitAB.x * juli, 0, posB.z + unitAB.y * juli);

    if (this._isBlockedByOtherSpr(targetPos)) {
      return null;
    }
    return targetPos;
  }

  /** 检测目标位置是否被其他Spr占据 */
  private _isBlockedByOtherSpr(targetPos: Vec3): boolean {
    const sprListNode = GameGlobal.sprlist?.node;
    if (!sprListNode) return false;

    const children = sprListNode.children;
    const blockRadius = this.SEPARATION_RADIUS;
    const blockRadiusSq = blockRadius * blockRadius;

    for (let i = 0; i < children.length; i++) {
      const other = children[i];
      if (other === this.node || !other.isValid) continue;
      const otherSpr = other.getComponent(Spr);
      if (!otherSpr || otherSpr.isDeath) continue;

      const dx = targetPos.x - other.worldPosition.x;
      const dz = targetPos.z - other.worldPosition.z;
      if (dx * dx + dz * dz < blockRadiusSq) {
        return true;
      }
    }
    return false;
  }

  // ==================== 目标有效性检查 ====================

  private checkTargetsValid() {
    if (this.attackerNode != null) {
      if (!this.attackerNode.isValid) {
        this.attackerNode = null;
      } else {
        const npcSrc = this.attackerNode.getComponent(Npc);
        if (npcSrc == null || npcSrc.curHp <= 0) {
          this.attackerNode = null;
        } else if (npcSrc.enemyList.indexOf(this.node) === -1) {
          this.attackerNode = null;
        }
      }
    }

    if (this.targetNode != null) {
      if (!this.targetNode.isValid) {
        this.targetNode = null;
      } else {
        const npcSrc = this.targetNode.getComponent(Npc);
        if (npcSrc == null || npcSrc.curHp <= 0) {
          this.targetNode = null;
        }
      }
    }

    // const dis = Vec3.distance(this.node.worldPosition, this.idlePos);
    // this.test.active = dis > 1;
  }

  // ==================== 触发器回调 ====================

  onNpcTriggerEnter(self) {
    if (this.targetNode != null) return;

    const body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() === 2 ** 6) {
      let npcSrc = body.node.getComponent(Npc);
      let isParent = false;

      if (npcSrc == null && body.node.name === "attTrigger") {
        npcSrc = body.node.parent.getComponent(Npc);
        isParent = true;
      }

      if (npcSrc == null || npcSrc.currShowNpc !== NpcFashion.equip || npcSrc.curHp <= 0) return;

      this.targetNode = isParent ? body.node.parent : body.node;
    }
  }

  onNpcTriggerExit(self) {
    const body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() !== 2 ** 6) return;

    const npcNode = body.node.parent?.parent;
    if (!npcNode) return;

    if (this.targetNode != null && npcNode.uuid === this.targetNode.uuid) {
      const npcSrc = this.targetNode.getComponent(Npc);
      if (npcSrc == null || npcSrc.curHp <= 0) {
        this.targetNode = null;
      }
    }
  }

  // ==================== 动画播放 ====================

  animPlay(name: string, callback?: () => void) {
    if (this.currAnim === name) return;
    if (name === "move" && this.isRandomMove) {
      this.scheduleOnce(() => {
        this.anim.play(name);
      }, Math.random() * 2);
      this.isRandomMove = false;
    } else {
      this.anim.play(name);
    }
    this.currAnim = name;
    if (callback) {
      this.anim.once(Animation.EventType.FINISHED, callback, this);
    }
  }

  // ==================== 朝向目标 ====================

  lookAt(pos: Vec3) {
    const a1 = v3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    const a2 = v3(pos.x, 0, pos.z);
    Vec3.subtract(this.tempV3, a2, a1);
    this.tempV3.normalize();
    Quat.rotationTo(this.targetQuat, GameGlobal.actor.ActorDirection, this.tempV3);
    this.destForward.set(this.tempV3);
    this.currForward.set(this.tempV3);
    this.node.setWorldRotation(this.targetQuat);
  }

  // ==================== 移动辅助 ====================

  private moveToward(dt: number, threshold: number, target: Vec3, callback?: () => void) {
    const s = dt * this.moveSpeed;
    Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
    this.lookAt(target);
    const dis = Vec3.distance(this.tempPos, target);
    if (dis < threshold) {
      callback?.();
      return;
    }
    this._applySeparation(this.tempPos);
    this.node.setPosition(this.tempPos);
  }

  /** 与其他Spr保持距离，避免重叠穿模 */
  private _applySeparation(pos: Vec3): void {
    const sprListNode = GameGlobal.sprlist?.node;
    if (!sprListNode) return;

    const children = sprListNode.children;
    let sepX = 0;
    let sepZ = 0;
    let sepCount = 0;

    for (let i = 0; i < children.length; i++) {
      const other = children[i];
      if (other === this.node || !other.isValid) continue;
      const otherSpr = other.getComponent(Spr);
      if (!otherSpr || otherSpr.isDeath) continue;

      const dx = pos.x - other.worldPosition.x;
      const dz = pos.z - other.worldPosition.z;
      const distSq = dx * dx + dz * dz;
      const radiusSq = this.SEPARATION_RADIUS * this.SEPARATION_RADIUS;

      if (distSq < radiusSq && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        sepX += dx / dist;
        sepZ += dz / dist;
        sepCount++;
      }
    }

    if (sepCount > 0) {
      pos.x += (sepX / sepCount) * this.SEPARATION_FORCE;
      pos.z += (sepZ / sepCount) * this.SEPARATION_FORCE;
    }
  }
}