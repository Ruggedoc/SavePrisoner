import { _decorator, Component, instantiate, Node, Prefab, tween, v3, Vec3, Collider, Quat, Animation, RigidBody } from "cc";
import { GameGlobal } from "../GameGlobal";
import { IceBox } from "./IceBox";
import { Utils } from "../Utils";
import { SaveTrigger } from "./SaveTrigger";
import { MainGame } from "../MainGame";
import { Npc } from "../actor/Npc";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("IceBoxList")
export class IceBoxList extends Component {
  @property(Prefab)
  iceBox: Prefab;
  @property(Node)
  boxList: Node;
  @property(Node)
  bodyList: Node;
  @property(Node)
  fromPosNode: Node;
  @property(Node)
  midPosNode: Node;
  @property(Prefab)
  public bodyPfb: Prefab; //尸体的预制体
  @property(Number)
  bodayFlyOffest: number = 0.5;
  @property(Node)
  saveTrigger: Node;
  @property(Node)
  public iceHummer0: Node; // 第一个锤子
  @property(Node)
  public iceHummer1: Node; // 第二个锤子
  @property(Node)
  public iceHummer2: Node; // 第三个锤子

  @property(Node)
  public iceHummer0Ani: Node; // 第一个锤子 动画
  @property(Node)
  public iceHummer1Ani: Node; // 第二个锤子 动画
  @property(Node)
  public iceHummer2Ani: Node; // 第三个锤子 动画

  @property(Node)
  public breakAni1: Node; // 碎冰特效1
  @property(Node)
  public breakAni2: Node; // 碎冰特效2
  @property(Node)
  public breakAni3: Node; // 碎冰特效3

  anim1: Animation;
  anim2: Animation;
  anim3: Animation;

  public icePosArr: Vec3[] = [];
  public iceBoxArr: Node[] = [];
  public fromPosArr: Vec3[] = [];

  public isFristAni = true;
  public isFristYD = true;
  public isTriggerOpen = false;
  currAnim: string;

  onLoad(): void {
    GameGlobal.iceBoxList = this;
  }
  start() {
    this.initHummer();
    this.loadIceBoxPos();
    this.initBodyPos();
    let footcoll = this.saveTrigger.getChildByName("pz").getComponent(Collider);
    footcoll.on("onTriggerEnter", this.onTrggerStart, this);
    footcoll.on("onTriggerStay", this.onTrggerStay2, this);
    footcoll.on("onTriggerExit", this.onTrggerExit, this);

    // let footJumpColl = this.saveTrigger.getChildByName("jumpPZ").getComponent(Collider);
    // footJumpColl.on("onTriggerEnter", this.onJumpTrggerStart, this);
    // footJumpColl.on("onTriggerExit", this.onJumpTrggerExit, this);

    this.anim1 = this.iceHummer0Ani.getComponent(Animation);
    this.anim2 = this.iceHummer1Ani.getComponent(Animation);
    this.anim3 = this.iceHummer2Ani.getComponent(Animation);

    this.onStartMove();
  }

  private initHummer() {
    this.iceHummer0.active = true;
    this.iceHummer1.active = false;
    this.iceHummer2.active = false;
  }

  /**解锁多个锤子 */
  public openAllHummer() {
    // if (GameGlobal.buyHummerNum == 1) {
    //   this.iceHummer1.active = true;
    //   this.iceHummer1.getChildByName("loader").scale = Vec3.ZERO;
    //   tween(this.iceHummer1.getChildByName("loader"))
    //     .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
    //     .to(0.1, { scale: v3(0.9, 0.9, 0.9) })
    //     .to(0.05, { scale: v3(1, 1, 1) })
    //     .start();
    // } else if (GameGlobal.buyHummerNum == 2) {
    //   this.iceHummer2.active = true;
    //   this.iceHummer2.getChildByName("loader").scale = Vec3.ZERO;
    //   tween(this.iceHummer2.getChildByName("loader"))
    //     .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
    //     .to(0.1, { scale: v3(0.9, 0.9, 0.9) })
    //     .to(0.05, { scale: v3(1, 1, 1) })
    //     .start();
    // }

    this.iceHummer1.active = true;
    this.iceHummer1.getChildByName("loader").scale = Vec3.ZERO;
    tween(this.iceHummer1.getChildByName("loader"))
      .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
      .to(0.1, { scale: v3(0.9, 0.9, 0.9) })
      .to(0.05, { scale: v3(1, 1, 1) })
      .start();

    this.iceHummer2.active = true;
    this.iceHummer2.getChildByName("loader").scale = Vec3.ZERO;
    tween(this.iceHummer2.getChildByName("loader"))
      .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
      .to(0.1, { scale: v3(0.9, 0.9, 0.9) })
      .to(0.05, { scale: v3(1, 1, 1) })
      .start();

    AudioManager.soundPlay("propShow");
  }

  initBodyPos() {
    GameGlobal.bodyPosArr = [
      new Vec3(-1.8, 0.15, -0.6),
      new Vec3(-1.3, 0.2, -0.5),
      new Vec3(-1.3, 0.3, -0.5),
      new Vec3(0.3, 0.25, -0.6),
      new Vec3(-0.5, 0.35, 0),
      new Vec3(0.8, 0.15, -0.1),
      new Vec3(0.8, 0.22, 0),
      new Vec3(1.1, 0.4, -0.3),
      new Vec3(-1.8, 0.5, -1),
      new Vec3(1, 0.55, 0.02),
      new Vec3(-0.5, 0.45, -0.35),
      new Vec3(0.3, 0.3, 0),
      new Vec3(1, 0.2, -0.6),
      new Vec3(0.3, 0.25, -0.3),
      new Vec3(0.8, 0.45, -0.48),
      new Vec3(0.9, 0.5, -0.4),
      new Vec3(0.7, 0.3, -0.2),
      new Vec3(0.6, 0.35, -0.55),
      new Vec3(0.5, 0.55, 0.11),
      new Vec3(-0.5, 0.6, -0.5),
      new Vec3(0.9, 0.24, -0.6),
      new Vec3(-1.8, 0.32, -0.32),
      new Vec3(-1.3, 0.22, -0.6),
      new Vec3(0.85, 0.38, -0.6),
    ];

    this.fromPosArr = [new Vec3(-1.2, 0.8, -7), new Vec3(0.23, 0.8, -7), new Vec3(1.3, 0.8, -7)];
  }

  public loadIceBoxPos() {
    // for (let index = 0; index < this.bodyList.children.length; index++) {
    //   let boxNode = this.boxList.getChildByName("iceBox" + index);
    //   this.icePosArr.push(boxNode.position.clone());
    //   this.iceBoxArr.push(boxNode);
    // }
    for (let index = 0; index < 9; index++) {
      let boxNode = this.boxList.getChildByName("iceBox" + index);
      if (boxNode != null) {
        this.iceBoxArr.push(boxNode);
      }
      this.icePosArr.push(new Vec3(0, 0, -6.5 * index));
    }
    // this.fromPos = new Vec3(0, 0, -1.5);
  }

  onJumpTrggerStart(event) {
    if (GameGlobal.actor.getCarShowState()) return;
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      GameGlobal.actor.onJumpButton();
    }
    // AudioManager.soundPlay("footTag");
  }
  onJumpTrggerExit(event) {
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      GameGlobal.actor.setSetPlayerY();
    }
    // AudioManager.soundPlay("footTag");
  }

  onTrggerStart() {
    if (!GameGlobal.actor.getCarShowState()) {
      if (!this.isTriggerOpen) return;
    }
    if (GameGlobal.actor.isHummerIce) return;
    // this.saveTrigger.getComponent(SaveTrigger).onPlayerFootAni(true);
    // AudioManager.soundPlay("footTag");
    this.onButtonAni();
  }

  public onButtonAni() {
    this.saveTrigger.getComponent(SaveTrigger).onPlayerFootAni(true);
    AudioManager.soundPlay("footTag");
  }
  // onTrggerStart() {
  //   this.saveTrigger.getComponent(SaveTrigger).onPlayerFootAni(true);
  //   AudioManager.soundPlay("footTag");
  // }
  onTrggerExit(event) {
    if (!GameGlobal.actor.getCarShowState()) {
      if (!this.isTriggerOpen) return;
    }
    this.saveTrigger.getComponent(SaveTrigger).onPlayerFootAni(false);
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      GameGlobal.actor.setSetPlayerY();
    }
  }
  // onTrggerExit() {
  //   this.saveTrigger.getComponent(SaveTrigger).onPlayerFootAni(false);
  //   // let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
  //   // if (body.getGroup() == 1) {
  //   GameGlobal.actor.setSetPlayerY();
  //   // }
  // }
  public onTrggerStay2(event) {
    const body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      if (!GameGlobal.actor.getCarShowState()) {
        if (!this.isTriggerOpen) return;
      }
    }
    if (GameGlobal.isOver) return;
    if (GameGlobal.actor.isJump) return;
    if (!GameGlobal.bIceReady) return;
    GameGlobal.bIceReady = false;
    this.onPlayHummerAni();
  }

  // public onTrggerStay() {
  //   if (this.isFristAni) return;
  //   if (GameGlobal.isOver) return;
  //   if (GameGlobal.actor.isJump) return;
  //   if (!GameGlobal.bIceReady) return;
  //   GameGlobal.bIceReady = false;

  //   if (this.isFristYD) {
  //     this.isFristYD = false;
  //     GameGlobal.actor.isWalkStop = true;
  //     GameGlobal.actor.stopMove();
  //     GameGlobal.actor.onIdle();
  //     this.onPlayHummerAni();
  //     let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("hummerPosStart");
  //     GameGlobal.CameraControl.cameraMove2(
  //       muNode,
  //       () => {
  //         this.scheduleOnce(() => {
  //           GameGlobal.CameraControl.cameraMoveToActor(0.5, () => {
  //             GameGlobal.isFirstStepon = false;
  //             GameGlobal.actor.isWalkStop = false;
  //           });
  //         }, 1);
  //       },
  //       0.5,
  //     );
  //   }

  //   if (GameGlobal.isFirstStepon) return;

  //   this.onPlayHummerAni();
  // }

  onPlayBreak() {
    this.playBreak();
    if (GameGlobal.YDHummerOpen) {
      GameGlobal.YDHummerOpen = false;
    }
  }

  onNpcCreate() {
    // if (GameGlobal.curIceNumStage == 1) this.addNpc();
    // else if (GameGlobal.curIceNumStage == 2) this.addNpc2();
    // else this.addNpc2();
    this.addNpc();
    this.scheduleOnce(() => {
      GameGlobal.curIceNumStage == 1 ? this.nextIceBox() : this.nextIceBox2();
    }, 0.2);
  }

  onStartMove() {
    for (let index = 0; index < this.iceBoxArr.length; index++) {
      let iceBox = this.iceBoxArr[index];
      let iceBoxSrc = iceBox.getComponent(IceBox);
      iceBoxSrc.doMove(this.icePosArr[index], 1, () => {});
    }
    this.scheduleOnce(() => {
      this.isFristAni = false;
    }, 1.2);
  }

  update(deltaTime: number) {}

  //#region 锤完飞尸体
  public playBreak() {
    for (let i = 0; i < GameGlobal.curIceNumStage; i++) {
      let startCarNode = this.iceBoxArr[i];
      if (startCarNode.position.z == this.icePosArr[i].z) {
        let iceBox = startCarNode.getComponent(IceBox);
        iceBox.onPlayeIceBreakAni();
        iceBox.onPlaySaveAni();
      }
    }
    if (GameGlobal.curIceNumStage == 1) {
      this.breakAni1.active = true;
      this.scheduleOnce(() => {
        this.breakAni1.active = false;
      }, 2);
    } else {
      this.breakAni1.active = true;
      this.breakAni2.active = true;
      this.breakAni3.active = true;
      this.scheduleOnce(() => {
        this.breakAni1.active = false;
        this.breakAni2.active = false;
        this.breakAni3.active = false;
      }, 2);
    }
  }

  moveToPos(node: Node, pos: Vec3, delay: number, callback?) {
    let startPos = node.position.clone();
    let tempVec3 = new Vec3(0, 0, 0);
    let controlPos = new Vec3(0, 0, 0);
    Vec3.add(controlPos, startPos, pos);
    controlPos.multiplyScalar(0.5);
    controlPos.add3f(0, 3, 0);
    node.worldScale = Vec3.ONE;
    tween(node)
      .to(
        delay,
        { position: pos },
        {
          onUpdate: (target, ratio) => {
            Utils.bezierCurve(ratio, node.position, controlPos, pos, tempVec3);
            node.setPosition(tempVec3);
          },
        },
      )
      .call(() => {
        callback && callback();
      })
      .start();
  }

  public npcCount: number = 0;
  /**
   * 生成尸体
   * @returns
   */
  public addNpc() {
    if (this.npcCount >= 4 * GameGlobal.buyHummerNum) {
      this.npcCount = 0;
      GameGlobal.isBodyReady = true;
      return;
    }
    this.npcCount++;
    let temp = instantiate(this.bodyPfb);
    temp.setParent(this.bodyList);
    let pos2 = this.getNextNpcPos();

    temp.setPosition(this.getNpcInitPos());
    temp.setRotationFromEuler(0, 0, 0);
    temp.setRotationFromEuler(90, Utils.randomRange(-45, 45), Utils.randomRange(0, 180));
    this.moveToPos(temp, pos2, 0.35, () => {
      temp.getComponent(Npc).isready = true;
      if (this.bodyList.children.length >= GameGlobal.saveMaxNum) {
        temp.destroy();
      }
    });

    this.scheduleOnce(() => {
      this.addNpc();
    }, 0.01);
  }

  /**
   * 生成尸体
   * @returns
   */
  public addNpc2() {
    if (this.npcCount >= 4 * GameGlobal.buyHummerNum) {
      this.npcCount = 0;
      GameGlobal.isBodyReady = true;
      return;
    }
    this.npcCount++;
    let temp = instantiate(this.bodyPfb);
    temp.setParent(this.bodyList);
    let pos2 = this.getNextNpcPos();

    temp.setPosition(this.getNpcInitPos());
    temp.setRotationFromEuler(0, 0, 0);
    temp.setRotationFromEuler(90, Utils.randomRange(-45, 45), Utils.randomRange(0, 180));
    this.moveToPos(temp, pos2, 0.25, () => {
      temp.getComponent(Npc).isready = true;
      if (this.bodyList.children.length >= GameGlobal.saveMaxNum) {
        temp.destroy();
      }
    });

    this.scheduleOnce(() => {
      this.addNpc2();
    }, 0.01);
  }
  public getNpcInitPos() {
    let idx = Math.floor(Utils.randomRange(0, 3));
    if (idx >= 0 && idx < this.fromPosArr.length) return this.fromPosArr[idx];
  }

  public getNextNpcPos() {
    let reultPos: Vec3 = new Vec3(0, 0, 0);
    if (this.bodyList.children.length >= GameGlobal.saveMaxNum) {
      return GameGlobal.bodyPosArr[Math.floor(Utils.randomRange(0, GameGlobal.saveMaxNum))];
    }
    let idx1 = 0;
    for (idx1 = 0; idx1 < GameGlobal.saveMaxNum; idx1++) {
      if (!this.checkHave(idx1)) {
        reultPos = GameGlobal.bodyPosArr[idx1];
        GameGlobal.bodyPosSet.add({ idx: idx1, pos: reultPos });
        break;
      }
    }
    return reultPos;
  }

  public checkHave(tIdx: number) {
    for (let obj of GameGlobal.bodyPosSet) {
      if (obj["idx"] == tIdx) {
        return true;
      }
    }
    return false;
  }

  public onSetPosIdx(pos: Vec3) {
    for (let obj of GameGlobal.bodyPosSet) {
      if (pos.equals(obj["pos"])) {
        GameGlobal.bodyPosSet.delete(obj);
        return;
      }
    }
  }

  //#region 创建并移动冰块 一个
  public nextIceBox() {
    //创建一个新冰块
    // if (!GameGlobal.cameraMoving) {
    let newIceBox = this.iceBoxArr.shift(); //this.getPoolItem(); //instantiate(this.iceBox);
    newIceBox.setParent(this.boxList);
    newIceBox.setPosition(this.icePosArr[this.iceBoxArr.length + 1]);
    newIceBox.getComponent(IceBox).initNpc();
    newIceBox.active = true;
    newIceBox.getChildByName("loader").active = true;
    newIceBox.setSiblingIndex(0);
    this.iceBoxArr.push(newIceBox);
    // }

    for (let index = 0; index < this.iceBoxArr.length; index++) {
      let iceBox = this.iceBoxArr[index];
      let iceBoxSrc = iceBox.getComponent(IceBox);
      iceBoxSrc.doMove(this.icePosArr[index], 1.5, () => {});
      this.scheduleOnce(() => {
        GameGlobal.bIceReady = true;
      }, 1.6);
    }
  }

  //#region 创建并移动冰块 三个
  public nextIceBox2() {
    let temArr = this.iceBoxArr.splice(0, GameGlobal.curIceNumStage);
    // while (temArr.length > 0) {
    //   this.addPoolItem(temArr.shift());
    // }

    //创建三个新冰块
    // if (!GameGlobal.cameraMoving) {
    for (let i = 0; i < temArr.length; i++) {
      let newIceBox = temArr[i]; //this.getPoolItem(); //instantiate(this.iceBox);
      newIceBox.setParent(this.boxList);
      newIceBox.setPosition(this.icePosArr[this.iceBoxArr.length + GameGlobal.curIceNumStage]);
      newIceBox.getComponent(IceBox).initNpc();
      newIceBox.active = true;
      newIceBox.getChildByName("loader").active = true;
      this.iceBoxArr.push(newIceBox);
      // }
    }

    for (let index = 0; index < this.iceBoxArr.length; index++) {
      let iceBox = this.iceBoxArr[index];
      let iceBoxSrc = iceBox.getComponent(IceBox);
      iceBoxSrc.doMove(this.icePosArr[index], 1.5 * GameGlobal.curIceNumStage, () => {});
    }
    this.scheduleOnce(
      () => {
        GameGlobal.bIceReady = true;
      },
      1.5 * GameGlobal.curIceNumStage + 0.1,
    );
  }

  //**锤子特效 参数是几个锤子*/
  public onPlayHummerAni() {
    if (GameGlobal.curIceNumStage == 1) {
      this.animPlay(1);
    } else if (GameGlobal.curIceNumStage == 2) {
      this.animPlay(2);
    } else if (GameGlobal.curIceNumStage == 3) {
      this.animPlay(3);
    }
  }

  animPlay(count: number, call?) {
    if (count == 1) {
      this.anim1.play("attack");
    } else if (count == 2) {
      this.anim1.play("attack");
      this.anim2.play("attack");
    } else {
      this.anim1.play("attack");
      this.anim2.play("attack");
      this.anim3.play("attack");
    }
    if (call) {
      this.anim1.once(
        Animation.EventType.FINISHED,
        () => {
          call();
        },
        this,
      );
    }
  }
}
