import { AudioManager } from "../AudioManager";
import { Moeny } from "../builds/Moeny";
import { ShopTrigger } from "../builds/ShopTrigger";
import { NpcAniState, State_User } from "../EnumDefine";
import { GameGlobal } from "../GameGlobal";
import { MainGame } from "../MainGame";
import { Spr } from "../sprite/Spr";
import { Utils } from "../Utils";
import { FMPlayer } from "./FMPlayer";
import { Npc } from "./Npc";
import {
  _decorator,
  CharacterController,
  Collider,
  Component,
  Prefab,
  Quat,
  SkeletalAnimation,
  tween,
  Vec3,
  Node,
  RigidBody,
  instantiate,
  UIOpacity,
  Animation,
  ICollisionEvent,
  BoxCollider,
  Line,
  Graphics,
  v3,
  PhysicsSystem,
  CapsuleCollider,
  SphereCollider,
  geometry,
  physics,
  math,
} from "cc";
import { PlayerController } from "./PlayerController";
import { ActorFlyAttribute } from "./ActorFlyAttribute";
const { ccclass, property } = _decorator;

const bag3MovePos: Vec3 = new Vec3();
const bag4MovePos: Vec3 = new Vec3();

@ccclass("Actor")
export class Actor extends Component {
  @property(Node)
  animNode: Node;
  @property(Node)
  bag1: Node;
  @property(Node)
  bag2: Node;
  @property(Node)
  bag3: Node;
  @property(Node)
  bag4: Node;
  @property({ displayName: "移动速度" })
  moveSpeed: number = 1;
  @property(CapsuleCollider)
  userCollider: CapsuleCollider;
  @property(RigidBody)
  userRigidBody: RigidBody;
  @property(BoxCollider)
  userTrigger: BoxCollider;
  @property(BoxCollider)
  carTrigger: BoxCollider;
  @property(BoxCollider)
  carCollider: BoxCollider;
  @property(Node)
  PropListNode: Node;
  @property(Node)
  NpcTakePos: Node;
  @property(Prefab)
  Moneyfab: Prefab;
  @property(Prefab)
  fmplayerfab: Prefab;
  @property(Node)
  jianTouNode: Node;
  @property(Node)
  maxNode: Node;
  @property(Node)
  carNode: Node;
  @property(Node)
  carEfcNode: Node;
  @property({ type: [Collider] })
  fanTanColliders: Collider[] = [];

  // characterController: CharacterController;
  userColliderCenter1: Vec3;
  userColliderCenter2: Vec3;
  userColliderSize1: Vec3;
  userColliderSize2: Vec3;
  dir = new Vec3(0, 0, 0);

  targetRotation = new Quat();
  isMoving: boolean = false;
  isAttSpr: boolean = false;
  // target_Att_Node: Node = null;//攻击目标可能是敌人也可能是树
  anim: SkeletalAnimation;
  currAnim: string;

  public targetTree = null;
  public attbox = null;

  isCollectMoney: boolean = false;

  lev: number = 1;
  isJianTouMoving: boolean = true;
  isopenMuz: boolean = false;

  public TreePoint = null;

  public JTtype = 0;
  public chilunMax = 20; //玩家身上背齿轮的上限
  public ismaxb = false; //是否上限，绘制max做判断

  public tempV3 = new Vec3();
  public targetQuat: Quat;
  public destForward: Vec3 = new Vec3(); //归一化的向量
  public currForward: Vec3 = new Vec3(); //当前方向，归一化的向量
  public ActorDirection = new Vec3(0, 0, 1);

  public TreetempV3 = new Vec3();
  public TreetargetQuat: Quat;
  public TreeActorDirection = new Vec3(0, 1, 0);
  /********************/
  public attDie = 2; //攻击距离
  public isattMap = false; //是否进入战斗区域
  public isConter = false; //是否进入柜台金币区

  isYanMoing: boolean = false; //是否正在研磨中
  isShouMoneying: boolean = false; //是否正在收集金币中
  isShouTreeing: boolean = false; //是否正在收集木头中
  isShouMuing: boolean = false; //是否正在收集木材中

  isTou1ing: boolean = false; //是否正在投掷武器给箭塔1
  isTou2ing: boolean = false; //是否正在投掷武器给箭塔2

  public hp: number = 0;
  public hpmax: number = 30;

  public carBodyPosArr: Vec3[] = [];
  public carBodyRotArr: Vec3[] = [];

  /**人物在做什么的时候不能移动 */
  public isWalkStop: boolean = false;

  private moveDir: Vec3 = new Vec3();

  xiFuNode: Node;
  rigidBodyMask: number = 0;
  rigidUseGravity: boolean = true;
  controllEnable = true;
  inCollisionColliders: Set<Collider> = new Set();
  groundCollider: null;

  onLoad() {
    GameGlobal.actor = this;
    this.rigidBodyMask = this.userRigidBody.getMask();
    this.rigidUseGravity = this.userRigidBody.useGravity;
  }

  start() {
    this.userCollider.on("onCollisionEnter", this.onCollisionEnter, this);
    this.userCollider.on("onCollisionExit", this.onCollisionExit, this);

    this.carCollider.on("onCollisionEnter", this.onCollisionEnter, this);
    this.carCollider.on("onCollisionExit", this.onCollisionExit, this);

    this.userTrigger.on("onTriggerEnter", this.onTriggerEnter, this);
    this.userTrigger.on("onTriggerStay", this.onTriggerStay, this);
    this.userTrigger.on("onTriggerExit", this.onTriggerExit, this);

    this.carTrigger.on("onTriggerEnter", this.onTriggerEnter, this);
    this.carTrigger.on("onTriggerStay", this.onTriggerStay, this);
    this.carTrigger.on("onTriggerExit", this.onTriggerExit, this);

    this.anim = this.animNode.getComponent(SkeletalAnimation);

    this.carBodyPosArr = [
      new Vec3(-0.95, -0.018, -0.95),
      new Vec3(-1, 0.2, -0.4),
      new Vec3(-1, 0.03, -0.3),
      new Vec3(0.6, 0.5, 0),
      new Vec3(0.66, 0.085, -0.18),
      new Vec3(0.8, -0.04, 0.82),
    ];
    this.carBodyRotArr = [
      new Vec3(90, 90, 0),
      new Vec3(90, 110, 45),
      new Vec3(90, 70, 155),
      new Vec3(117, -49, -49),
      new Vec3(-80, 90, 0),
      new Vec3(90, -90, 0),
    ];

    this.TreetargetQuat = new Quat();
    this.targetQuat = new Quat();
    this.destForward.set(0, 0, 0); //归一化的向量
    this.currForward.set(0, 0, -1);
    this.animPlay(State_User.Idle);
    this.hp = this.hpmax;
    this.TreePoint = GameGlobal.mainGame.GamePosNode.getChildByName("TreePoint");
    GameGlobal.yindao.init();
    this.carTrigger.node.active = false;
    this.carCollider.enabled = false;
  }

  // //坐标移动
  // tempPos = new Vec3();
  // // 缓存向量，避免 update 内频繁 new
  // private tempNormal: Vec3 = new Vec3();
  // private tempToSelf: Vec3 = new Vec3();
  // public doMove(deltaTime) {
  //   this.computeEffectiveMoveDir();
  //   let s = deltaTime * this.moveSpeed;
  //   Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.effectiveMoveDir, s);
  //   this.node.setPosition(this.tempPos);
  // }

  // /** 计算实际移动方向：贴墙时剔除指向墙内的分量，实现平滑贴墙滑动 */
  // private computeEffectiveMoveDir() {
  //   this.effectiveMoveDir.set(this.moveDir);
  //   if (!this.isPZb || this.collisionNormal.lengthSqr() <= 0) {
  //     return;
  //   }
  //   // 移动方向在法线上的投影，为负表示朝墙内移动
  //   const d = Vec3.dot(this.effectiveMoveDir, this.collisionNormal);
  //   if (d < 0) {
  //     // 移除指向墙内的分量，仅保留沿墙面的切向分量
  //     Vec3.scaleAndAdd(this.effectiveMoveDir, this.effectiveMoveDir, this.collisionNormal, -d);
  //     if (this.effectiveMoveDir.lengthSqr() > 0) {
  //       this.effectiveMoveDir.normalize();
  //     }
  //   }
  // }
  setIdle() {
    // this.moneyBag.isTilt = false;
    this.isMoving = false;
  }

  protected update(dt: number): void {
    if (GameGlobal.isOver || GameGlobal.isStop) {
      return;
    }
    this.onListeningBagFirstDT();
    if (GameGlobal.actor.isWalkStop) return;
    if (!GameGlobal.cameraMoving) {
      // 更新旋转
      if (!Vec3.ZERO.equals(this.moveDir)) {
        this.directUpdateRotation(this.moveDir);
      }
    }
    if (this.isuserMove) {
      this.UserDoMove(this.userdir);
    }
  }

  lateUpdate(deltaTime: number) {
    if (GameGlobal.isOver || GameGlobal.isStop) {
      return;
    }
    if (!GameGlobal.cameraMoving) {
      this.MoveMoneyToBag(deltaTime);
      if (this.isMoving) {
        let aniType = State_User.Move;
        if (this.carNode.active) {
          aniType = State_User.carMove;
        } else {
          if (this.bag3.children.length > 0 || this.bag4.children.length > 0) aniType = State_User.BaoMove;
          else aniType = State_User.Move;
        }
        this.animPlay(aniType);
      }
      if (GameGlobal.FMPlayer != null && GameGlobal.FMPlayer.isYDNpcMove) return;
      GameGlobal.CameraControl.cameraFollow();
    }
  }

  //#region 移动
  public isuserMove = false;
  public userdir = new Vec3();
  move(dir: Vec3) {
    if (!dir || Vec3.ZERO.equals(dir)) {
      this.userRigidBody.setLinearVelocity(Vec3.ZERO);
      this.clearAngularVelocity();
      this.onChangeBodyBagPos();
      return;
    }
    if (GameGlobal.cameraMoving || this.isWalkStop) {
      this.isMoving = false;
      this.userRigidBody.setLinearVelocity(Vec3.ZERO);
      this.clearAngularVelocity();
      this.onChangeBodyBagPos();
      return;
    }
    this.userdir = dir;
    this.isuserMove = true;
  }

  private UserDoMove(dir) {
    this.moveDir = new Vec3(dir.x, 0, -dir.y);
    this.moveDir.normalize();
    this.isMoving = true;
    // 设置速度
    const targetVelocity = this.moveDir.clone().multiplyScalar(this.moveSpeed);
    this.userRigidBody.setLinearVelocity(targetVelocity);

    GameGlobal.bagoffset.onMovingOffset();

    //玩家空手携带的尸体的坐标
    this.onChangeBodyBagPos();
    AudioManager.audioPlay("move", true);
  }

  //#region 旋转
  directUpdateRotation(moveDir: Vec3) {
    // 更新旋转
    let temoRot: Quat = new Quat();
    let temp = new Vec3(moveDir.x, 0, moveDir.z);
    Quat.fromViewUp(temoRot, temp, Vec3.UP);
    let tempEular = new Vec3();
    temoRot.getEulerAngles(tempEular);
    this.userRigidBody.node.setWorldRotation(temoRot);
    this.clearAngularVelocity();
  }

  clearAngularVelocity() {
    this.userRigidBody.setAngularVelocity(Vec3.ZERO);
  }

  //#region 碰撞反弹
  private onCollisionEnter(evt: ICollisionEvent) {
    this.inCollisionColliders.add(evt.otherCollider);
    if (this.groundCollider != null) {
      if (evt.otherCollider === this.groundCollider) {
        this.groundCollider = null;
      }
    }
    this.onPlayerControllerCollisionEnter(evt);
  }

  private onCollisionExit(evt: ICollisionEvent) {
    this.inCollisionColliders.delete(evt.otherCollider);
  }

  private onPlayerControllerCollisionEnter(evt: ICollisionEvent) {
    //碰到空气墙反弹
    for (let i = 0; i < this.fanTanColliders.length; i++) {
      if (this.inCollisionColliders.has(this.fanTanColliders[i])) {
        let pos = evt.contacts[0];
        let posOnB = new Vec3();
        if (pos.isBodyA) {
          pos.getWorldNormalOnB(posOnB);
        } else {
          pos.getWorldNormalOnA(posOnB);
        }
        posOnB.y += 3;
        posOnB.normalize();

        posOnB.multiplyScalar(0.5);
        this.userRigidBody.clearState();
        this.userRigidBody.applyImpulse(posOnB);
        break;
      }
    }
  }

  //#region 触发监听
  onTriggerEnter(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 8192) {
      this.isattMap = true;
    } else if (body.getGroup() == 2 ** 6 && self.otherCollider.node.name == "pz_d") {
      //捡尸体
      this.isShouMuing = true;
      this.MoveMuTobag2(self.otherCollider.node);
    } else if (body.getGroup() == 2 ** 16) {
      this.isCollectMoney = true;
    }
  }

  onTriggerStay(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 8192) {
      this.isattMap = true;
    } else if (body.getGroup() == 2 ** 16) {
      this.isCollectMoney = true;
      this.MoveMoneyToBag2();
    }
  }

  onTriggerExit(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 8192) {
      this.isattMap = false;
    } else if (body.getGroup() == 2 ** 16) {
      this.isCollectMoney = false;
    }
  }

  //#region 刷新人物身上的冰人位置
  onChangeBodyBagPos() {
    if (this.bag3.children.length > 0) {
      bag3MovePos.set(
        GameGlobal.curTakeBodyPos1.x,
        GameGlobal.curTakeBodyPos1.y,
        this.isMoving ? -1.1 : GameGlobal.curTakeBodyPos1.z,
      );
      this.bag3.children[0].setPosition(bag3MovePos);
    }
    if (this.bag4.children.length > 0) {
      bag4MovePos.set(
        GameGlobal.curTakeBodyPos2.x,
        GameGlobal.curTakeBodyPos2.y,
        this.isMoving ? -1.1 : GameGlobal.curTakeBodyPos2.z,
      );
      this.bag4.children[0].setPosition(bag4MovePos);
    }
  }
  /**
   * 当前尸体已经在身上了
   * @returns true:在身上
   */
  public bBodyState(n: Node): boolean {
    let checkIds: string[] = [];
    if (this.bag3.children.length > 0) {
      checkIds.push(this.bag3.children[0].uuid);
    }
    if (this.bag4.children.length > 0) {
      checkIds.push(this.bag4.children[0].uuid);
    }
    return checkIds.indexOf(n.uuid) != -1;
  }

  /**
   * 是否有尸体可以捡
   * @returns true:有尸体可以捡
   */
  public bCanTakeBody(): boolean {
    return GameGlobal.iceBoxList.node.getChildByName("bodyList").children.length > 0 ? true : false;
  }

  /**
   * 当前玩家身上带的尸体
   * @returns 如果有返回节点，否则为空
   */
  public bNowTakeBody(): Node {
    if (GameGlobal.bOpenCar) {
      let tNode = this.NpcTakePos;
      let len: number = tNode.children.length;
      if (len > 0) {
        return tNode.children[len - 1];
      }
    }
    if (this.bag3.children.length > 0) {
      return this.bag3.children[0];
    }
    if (this.bag4.children.length > 0) {
      return this.bag4.children[0];
    }
    return null;
  }

  //#region  收集尸体到背包
  public MoveMuTobag2(otherNode: Node) {
    if (!this.isShouMuing) {
      return;
    }
    if (!this.bCanTakeBody()) {
      return;
    }
    let takeMax = GameGlobal.takeBodyMax1;
    if (GameGlobal.bOpenCar) {
      takeMax = GameGlobal.takeBodyMax2;
    }
    if (GameGlobal.curTakeBody >= takeMax) return;

    let body = otherNode.parent.parent;
    let muSrc = body.getComponent(Npc);
    if (this.bBodyState(body) || !muSrc.isready) {
      return;
    }

    if (GameGlobal.bOpenCar) {
      GameGlobal.actor.onChangeCarState(true);
      this.onTakeBodyMuch(body);
    } else {
      this.onTakeBodySingle(body);
    }
    AudioManager.soundPlay("takeIceNpc");
  }

  /**
   * 空手捡起尸体
   * @param body 将要捡起的尸体
   */
  private onTakeBodySingle(body: Node) {
    let takPosNode = GameGlobal.curTakeBody == 1 ? this.bag4 : this.bag3;
    let takePosVe3 = GameGlobal.curTakeBody == 1 ? GameGlobal.curTakeBodyPos1 : GameGlobal.curTakeBodyPos2;
    let takeRotVe3 = GameGlobal.curTakeBody == 1 ? GameGlobal.curTakeBodyRot1 : GameGlobal.curTakeBodyRot2;
    let muSrc = body.getComponent(Npc);

    GameGlobal.curTakeBody++;
    muSrc.isready = false;
    AudioManager.soundPlay("takeIceNpc", 0.2);
    let worldPos = body.worldPosition.clone();
    body.setParent(takPosNode);
    GameGlobal.iceBoxList.onSetPosIdx(body.position);
    body.worldPosition = worldPos;
    body.worldScale = Vec3.ONE;
    muSrc.animPlay(NpcAniState.ice2);

    this.animPlay(State_User.BaoIdle);
    let midPos = Vec3.ZERO;
    muSrc.moveToPos(
      body,
      takePosVe3,
      0.3,
      0,
      false,
      true,
      takeRotVe3,
      () => {
        this.cleanBag();
      },
      midPos,
    );
    this.checkBagPos();
  }

  /**
   * 手推车捡起尸体
   * @param body 将要捡起的尸体
   */
  private onTakeBodyMuch(body: Node) {
    let takPosNode = this.NpcTakePos;
    let tLen = takPosNode.children.length;
    let muSrc = body.getComponent(Npc);

    GameGlobal.curTakeBody++;
    muSrc.isready = false;

    let targetLocalPos = this.carBodyPosArr[tLen];
    let targetLocalRot = this.carBodyRotArr[tLen];

    let startWorldPos = body.worldPosition.clone();
    body.setParent(takPosNode);
    GameGlobal.iceBoxList.onSetPosIdx(body.position);
    body.eulerAngles = targetLocalRot;

    body.worldPosition = startWorldPos;
    body.setRotationFromEuler(new Vec3(0, 0, 0));
    body.worldScale = Vec3.ONE;

    muSrc.moveToPos(body, targetLocalPos, 0.2, 0, false, false, null, () => {
      this.cleanBag();
    });
    this.checkBagPos();
  }

  //#region 开启手推车,捡尸体的时候
  onChangeCarState(isOpen: boolean) {
    this.carNode.active = isOpen;
    // this.UserCollider.center = isOpen ? this.userColliderCenter2 : this.userColliderCenter1;
    // this.UserCollider.size = isOpen ? this.userColliderSize2 : this.userColliderSize1;
    if (!GameGlobal.bOpenCar && isOpen) {
      this.animPlay(State_User.carStand);
      AudioManager.soundPlay("propShow");
      this.carEfcNode.active = true;
      this.scheduleOnce(() => {
        this.carEfcNode.active = false;
      }, 1);
      this.onBagNpcPosChange();
    }
    this.carCollider.enabled = isOpen;
    this.carCollider.isTrigger = !isOpen;
    this.carTrigger.node.active = isOpen;
  }

  private onBagNpcPosChange() {
    if (this.bag3.children.length > 0) {
      let npcNode: Node = this.bag3.children[0];
      let targetLocalPos = this.carBodyPosArr[this.NpcTakePos.children.length];
      let targetLocalRot = this.carBodyRotArr[this.NpcTakePos.children.length];

      npcNode.setParent(this.NpcTakePos);
      npcNode.position = targetLocalPos;
      npcNode.eulerAngles = targetLocalRot;
    }
    if (this.bag4.children.length > 0) {
      let npcNode: Node = this.bag4.children[0];
      let targetLocalPos = this.carBodyPosArr[this.NpcTakePos.children.length];
      let targetLocalRot = this.carBodyRotArr[this.NpcTakePos.children.length];

      npcNode.setParent(this.NpcTakePos);
      npcNode.position = targetLocalPos;
      npcNode.eulerAngles = targetLocalRot;
    }
  }

  //#region 拾取柜台金币
  public time2 = 0;
  public countNum: number = 0;
  private timeOffest = 0.02;
  public MoveMoneyToBag2() {
    if (!this.isCollectMoney) {
      return;
    }
    if (this.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax) {
      //屏幕显示满的提示
      this.onPlayBagMax();
      return;
    }
    this.time2 += this.timeOffest;
    if (this.time2 <= GameGlobal.shouMoneyTime2) {
      return;
    }
    if (this.countNum > GameGlobal.takeCount) {
      this.time2 = 0;
      this.countNum = 0;
      return;
    }
    this.countNum++;

    let moneyNode: Node = this.getCanTakeCoin(); //coins[coins.length - 1];

    if (moneyNode != null) {
      let moneySrc = moneyNode.getComponent(Moeny);
      if (moneySrc) {
        moneySrc.isMoveb = true;
        moneySrc.isready = false;

        moneySrc.isConterLeave = true;
        moneySrc.cunterStartPos = moneyNode.worldPosition.clone();
        moneySrc.cunterProgress = 0;
        GameGlobal.equipConter.actorTakeMoneyArr.push(moneyNode);

        let oldWorlPos = moneyNode.worldPosition;
        moneyNode.setParent(GameGlobal.moneyFlyList);
        moneyNode.worldPosition = oldWorlPos;
        AudioManager.soundPlay("moneyFly");
        this.checkBagPos();
      }
    }
  }

  onGetBag2ReallyCount(): number {
    let count = this.bag2.children.length + GameGlobal.equipConter.actorTakeMoneyArr.length;
    return count;
  }

  onListeningBagFirstDT() {
    if (GameGlobal.isFirstGetGold) {
      //拿完了或者背包满了
      let isOpen = GameGlobal.equipConter.goldPos.children.length <= 0 && GameGlobal.actor.bag2.children.length > 0;
      if (isOpen || GameGlobal.actor.bag2.children.length >= GameGlobal.moneyBagMax) {
        GameGlobal.ditieList.getChildByName("buyHummer").getComponent(ShopTrigger).onNodeOpen();
        GameGlobal.isFirstGetGold = false;
      }
    }
  }

  private getCanTakeCoin(): Node {
    let coins: Node[] = GameGlobal.equipConter.goldPos.children;
    if (coins.length > 0) {
      for (let i = coins.length - 1; i >= 0; i--) {
        let moneyNode = coins[i];
        let moneySrc = moneyNode.getComponent(Moeny);
        if (moneySrc.isready && !moneySrc.isMoveb) return moneyNode;
      }
    }
    return null;
  }

  //#region 拾取金币
  //update寻找离自己最近的道具，只有再战斗区域生效
  public time1 = 0;
  public MoveMoneyToBag(dt) {
    if (!this.isattMap) {
      return;
    }
    if (this.bag2.children.length >= GameGlobal.moneyBagMax) {
      this.onPlayBagMax();
      return;
    }

    this.time1 += dt;
    if (this.time1 <= GameGlobal.shouMoneyTime) {
      return;
    }
    this.time1 = 0;
    let moneyNode = this.getNearMoney();
    if (moneyNode == null) return;

    let moneySrc = moneyNode.getComponent(Moeny);
    if (moneySrc) {
      if (moneySrc.isready && !moneySrc.isMoveb) {
        if (GameGlobal.moneyBagMax - (GameGlobal.curFlyCoin.length + this.bag2.children.length) <= 0) {
          this.cleanBag();
          return;
        }

        if (GameGlobal.curFlyCoin.indexOf(moneyNode) == -1) GameGlobal.curFlyCoin.push(moneyNode);
        moneySrc.isMoveb = true;
        moneySrc.isready = false;
        moneySrc.onSetMoveParms(3, 3, false);

        return;
      }
    }
  }

  private getNearMoney(): Node {
    let tempDis: number = -1;
    let resultNode: Node = null;
    for (let index = 0; index < this.PropListNode.children.length; index++) {
      let moneyNode = this.PropListNode.children[index];
      let moneySrc = moneyNode.getComponent(Moeny);
      if (moneySrc) {
        if (moneySrc.isready && !moneySrc.isMoveb) {
          let dis = Vec3.distance(this.node.worldPosition, moneyNode.worldPosition);
          if (tempDis == -1) {
            tempDis = dis;
            resultNode = moneyNode;
          } else {
            if (dis < tempDis) {
              tempDis = dis;
              resultNode = moneyNode;
            }
          }
        }
      }
    }
    return resultNode;
  }

  //#region 生成自动NPC
  public addFMPlayer() {
    let FMplayerNode = instantiate(this.fmplayerfab);
    FMplayerNode.setParent(MainGame.mymain.SprListNode.getChildByName("playerList"));
    FMplayerNode.getComponent(FMPlayer).state = -1;
    AudioManager.soundPlay("propShow");
  }

  stopMove() {
    AudioManager.audioStop("move");
    this.isuserMove = false;
    this.userdir = Vec3.ZERO;
    this.isMoving = false;
    this.moveDir = Vec3.ZERO;
    this.move(Vec3.ZERO);
    GameGlobal.bagoffset.offMovingOffset();
    if (this.isWalkStop) return;
    this.onIdle();
  }

  onIdle() {
    let aniType = State_User.Idle;
    if (this.carNode.active) {
      aniType = State_User.carStand;
    } else {
      if (this.bag3.children.length > 0 || this.bag4.children.length > 0) aniType = State_User.BaoIdle;
      else aniType = State_User.Idle;
    }
    this.animPlay(aniType);
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
   * 刷新背包道具的位置，避免出现动画引起的道具重叠乱层
   */
  cleanBag() {
    for (let i = 0; i < this.bag1.children.length; i++) {
      let node = this.bag1.children[i];
      node.setPosition(0, 0.1 * i, 0);
    }
    //钱应该整理完再准备好
    for (let i = 0; i < this.bag2.children.length; i++) {
      let node = this.bag2.children[i];
      node.setPosition(0, 0.084 * i, 0);
      let nodeSrc = node.getComponent(Moeny);
      nodeSrc.isMoveb = false;
      nodeSrc.isready = true;
    }

    if (GameGlobal.bOpenCar) {
      let tNode = this.NpcTakePos;
      let len: number = tNode.children.length;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          let nodyNode = tNode.children[i];
          // let modNode = nodyNode.getChildByName("bodyMod");
          nodyNode.position = this.carBodyPosArr[i];
          nodyNode.eulerAngles = this.carBodyRotArr[i];
        }
      }
    }
    if (this.bag3.children[0]) this.bag3.children[0].setPosition(GameGlobal.curTakeBodyPos1);
    if (this.bag4.children[0]) this.bag4.children[0].setPosition(GameGlobal.curTakeBodyPos2);
  }

  /**
   * 刷新背包再人物身后的位置
   */
  checkBagPos() {
    let len1 = this.bag1.children.length;
    let len2 = this.bag2.children.length;
    if (len1 <= 0) {
      this.bag2.setPosition(0, 0, 0);
    } else {
      this.bag2.setPosition(0, 0.4, 0);
    }
  }

  public onPlayBagMax() {
    if (GameGlobal.isBagMaxPlaying) return;
    GameGlobal.isBagMaxPlaying = true;
    this.maxNode.active = true;
    let spOp = this.maxNode.getComponent(UIOpacity);
    tween(spOp)
      .to(0.2, { opacity: 200 })
      .delay(0.8)
      .to(0.2, { opacity: 0 })
      .union()
      .repeat(2)
      .call(() => {
        GameGlobal.isBagMaxPlaying = false;
      })
      .start();
  }

  /**
   * @zh
   * 设置当前节点旋转为面向目标位置，默认前方为 -z 方向
   * @param pos 目标位置
   */
  lookAt(pos: Vec3) {
    let mupos = new Vec3(pos.x, 0, pos.z);
    let mypos = new Vec3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    Vec3.subtract(this.tempV3, mupos, mypos);
    this.tempV3.normalize();
    Quat.rotationTo(this.targetQuat, this.ActorDirection, this.tempV3);
    this.destForward.set(this.tempV3);
    this.currForward.set(this.tempV3);
    this.node.setWorldRotation(this.targetQuat);
  }

  //#region 获取玩家有没有带着NPC
  getIsTakeNpc() {
    return this.bag3.children.length > 0 || this.bag4.children.length > 0 || this.NpcTakePos.children.length > 0;
  }
}
