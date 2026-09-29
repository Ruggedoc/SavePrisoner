import { _decorator, BoxCollider, Collider, Component, Game, Node, RigidBody, tween, v3, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { Utils } from "../Utils";
import { AudioManager } from "../AudioManager";
import { MainGame } from "../MainGame";
import { Npc } from "../actor/Npc";
import { NpcAniState, State_User } from "../EnumDefine";
import { ShopTrigger } from "./ShopTrigger";

const { ccclass, property } = _decorator;

@ccclass("WatarRoom")
export class WatarRoom extends Component {
  @property({ type: BoxCollider, displayName: "浴缸触发器" })
  public YGTrigger: BoxCollider; //浴缸触发器
  @property({ type: BoxCollider, displayName: "浴池触发器" })
  public YCTrigger: BoxCollider; //浴池触发器
  @property({ type: BoxCollider, displayName: "浴缸进入触发器" })
  public YGFoot: BoxCollider;
  @property({ type: BoxCollider, displayName: "浴池进入触发器" })
  public YCFoot: BoxCollider;
  @property(Node)
  public pan: Node;
  @property(Node)
  public throwTriggerNode: Node;
  @property(Node)
  public pos2EnterEfc0: Node;
  @property(Node)
  public pos2EnterEfc1: Node;
  @property(Node)
  public pos6EnterEfc0: Node;
  @property(Node)
  public pos6EnterEfc1: Node;
  @property(Node)
  public pos6EnterEfc2: Node;
  @property(Node)
  public pos6EnterEfc3: Node;
  @property(Node)
  public pos6EnterEfc4: Node;
  @property(Node)
  public pos6EnterEfc5: Node;

  public txNode: Node;
  public max = 150;
  /**是否在扔尸体的触发区域 */
  bInTriggerArea: boolean = false;
  /**是否扔完尸体了 */
  bThrowFinish: boolean = true;
  bThrowing: boolean = false;
  currAnim: string;

  private pos2EfcArr: Node[] = [];
  private pos6EfcArr: Node[] = [];

  private trgPosYG: Vec3 = v3(-2.291, 0, -0.38);
  private trgPosYC: Vec3 = v3(-3.275, 0, -0.138);
  private trgScaleYG: Vec3 = v3(1, 1, 0.7);
  private trgScaleYC: Vec3 = v3(1.4, 1, 0.98);
  onLoad() {
    GameGlobal.watarRoom = this;
  }

  start() {
    GameGlobal.inWaterPos2Arr = [
      new Vec3(0.2, -0.1, 0.7), // y 180
      new Vec3(0.2, -0.1, -1.2), // y 0
    ];
    GameGlobal.inWaterPos6Arr = [
      new Vec3(1, -1, -2.2), //y -90
      new Vec3(1, -1, 0.07), //y -90
      new Vec3(1, -1, 2.45), //y -90
      new Vec3(-0.48, -1, -2.2), //y 90
      new Vec3(-0.48, -1, 0.07), //y 90
      new Vec3(-0.48, -1, 2.45), //y 90
    ];

    GameGlobal.toWaterPos2Arr = [
      new Vec3(-2, 0, 0.7), //y -90
      new Vec3(-2, 0, -1.2), //y -90
    ];
    GameGlobal.toWaterPos6Arr = [
      new Vec3(-2.85, 0, -2.2), //y -90
      new Vec3(-2.85, 0, 0.07), //y -90
      new Vec3(-2.85, 0, 2.45), //y -90
      new Vec3(-3.6, 0, -2.2), //y -90
      new Vec3(-3.6, 0, 0.07), //y -90
      new Vec3(-3.6, 0, 2.45), //y -90
    ];

    this.pos2EfcArr = [this.pos2EnterEfc0, this.pos2EnterEfc1];
    this.pos6EfcArr = [
      this.pos6EnterEfc0,
      this.pos6EnterEfc1,
      this.pos6EnterEfc2,
      this.pos6EnterEfc3,
      this.pos6EnterEfc4,
      this.pos6EnterEfc5,
    ];
    this.throwTriggerNode.setPosition(this.trgPosYG);
    this.throwTriggerNode.scale = this.trgScaleYG;

    this.YGTrigger.on("onTriggerEnter", this.onThrowTriggerEnter, this);
    this.YGTrigger.on("onTriggerStay", this.onThrowTriggerStay, this);
    this.YGTrigger.on("onTriggerExit", this.onThrowTriggerExit, this);
    this.YGFoot.on("onTriggerEnter", this.onSelectEnter, this);
    this.YGFoot.on("onTriggerExit", this.onSelectExit, this);

    this.YCTrigger.on("onTriggerEnter", this.onThrowTriggerEnter, this);
    this.YCTrigger.on("onTriggerStay", this.onThrowTriggerStay, this);
    this.YCTrigger.on("onTriggerExit", this.onThrowTriggerExit, this);
    this.YCFoot.on("onTriggerEnter", this.onSelectEnter, this);
    this.YCFoot.on("onTriggerExit", this.onSelectExit, this);

    this.YGTrigger.enabled = true;
    this.YCTrigger.enabled = false;
    this.YGFoot.enabled = true;
    this.YCFoot.enabled = false;
  }

  update(deltaTime: number) {}
  onSelectEnter(event) {
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.throwTriggerNode.getChildByName("select").active = true;
    }
  }
  onSelectExit(event) {
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.throwTriggerNode.getChildByName("select").active = false;
    }
  }

  private onThrowTriggerEnter(event) {
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.bInTriggerArea = true;
      // this.throwTriggerNode.getChildByName("select").active = true;
      if (GameGlobal.actor.bNowTakeBody() == null) return;
      if (GameGlobal.bOpenPool) {
        if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax2) return;
      } else {
        if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax1) return;
      }
    }
  }

  throwTime: number = 0.25;
  timeDown: number = 0;
  DTTime: number = 0.02;
  //#region 扔尸体到水池的触发器
  private onThrowTriggerStay(event) {
    if (GameGlobal.poolAni) return;
    if (!this.bInTriggerArea) return;
    if (GameGlobal.actor.bNowTakeBody() == null) return;
    if (GameGlobal.isFirstThrow) {
      GameGlobal.isFirstThrow = false;
      GameGlobal.CameraControl.cameraMoveTotar_actor(
        MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("waterPool1"),
        0.7,
        1,
        0.5,
        () => {
          GameGlobal.cameraMoving = false;
        },
      );
    }

    if (GameGlobal.bOpenPool) {
      if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax2) return;
    } else {
      if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax1) return;
    }

    // if (!this.bThrowing && GameGlobal.bOpenCar) {
    //   this.bThrowing = true;
    //   const throwNum = GameGlobal.bOpenPool
    //     ? GameGlobal.waterOpenMax2 - GameGlobal.curWaterBody
    //     : GameGlobal.waterOpenMax1 - GameGlobal.curWaterBody;
    //   const moveTime = Math.min(throwNum, GameGlobal.actor.NpcTakePos.children.length) * 0.2;
    //   GameGlobal.CameraControl.cameraMoveTotar_actor(
    //     MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("waterPool1"),
    //     0.4,
    //     moveTime,
    //     0.4,
    //     () => {
    //       GameGlobal.cameraMoving = false;
    //       this.bThrowing = false;
    //     },
    //   );
    // }

    this.onPlayThrowAni();
  }

  private onThrowTriggerExit(event) {
    let body: RigidBody = event.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      // this.throwTriggerNode.getChildByName("select").active = false;
      this.bInTriggerArea = false;
      this.bThrowFinish = true;
      GameGlobal.actor.isWalkStop = false;
    }
  }
  //#region 扔尸体进池子
  private onPlayThrowAni() {
    //有可能出了检测区，但是延时调用还会继续扔尸体

    if (!this.bThrowFinish) return;
    this.bThrowFinish = false;
    GameGlobal.actor.isWalkStop = true;
    GameGlobal.actor.stopMove();
    GameGlobal.actor.onIdle();
    if (GameGlobal.bOpenCar) {
      this.onThrowBody2();
    } else {
      // GameGlobal.actor.animPlay(State_User.throw);

      GameGlobal.actor.animPlay(State_User.throw, () => {
        this.bThrowFinish = true;
        GameGlobal.actor.isWalkStop = false;
        GameGlobal.actor.onChangeCarState(false);
      });
    }
  }

  //手推车扔加一个间隔
  public onThrowBody2() {
    this.timeDown += this.DTTime;
    if (this.timeDown >= this.throwTime) {
      this.timeDown = 0;
      this.onThrowBody();
      // AudioManager.soundPlay("throwNpc");
      let bodyNode: Node = GameGlobal.actor.bNowTakeBody();
      if (bodyNode == null) {
        this.bThrowFinish = true;
        GameGlobal.actor.isWalkStop = false;
        GameGlobal.actor.onChangeCarState(false);
        GameGlobal.actor.animPlay(State_User.Idle);
        return;
      }

      if (GameGlobal.bOpenPool) {
        if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax2) {
          this.bThrowFinish = true;
          GameGlobal.actor.isWalkStop = false;
          return;
        }
      } else {
        if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax1) {
          this.bThrowFinish = true;
          GameGlobal.actor.isWalkStop = false;
          return;
        }
      }
    }
    this.scheduleOnce(() => {
      this.onThrowBody2();
    });
  }

  //#region 人物扔进池子
  public onThrowBody() {
    let bodyNode: Node = GameGlobal.actor.bNowTakeBody();
    if (bodyNode == null) {
      this.bThrowFinish = true;
      if (GameGlobal.bOpenCar) {
        this.bThrowFinish = true;
        GameGlobal.actor.isWalkStop = false;
        GameGlobal.actor.onChangeCarState(false);
        // GameGlobal.actor.onSetCharacterData(false);
      }
      return;
    }
    if (GameGlobal.bOpenPool) {
      if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax2) {
        this.bThrowFinish = true;
        GameGlobal.actor.isWalkStop = false;
        return;
      }
    } else {
      if (GameGlobal.curWaterBody >= GameGlobal.waterOpenMax1) {
        this.bThrowFinish = true;
        GameGlobal.actor.isWalkStop = false;
        return;
      }
    }
    if (GameGlobal.YDCarOpen && GameGlobal.YDCarOpenState == 1) {
      GameGlobal.YDCarOpen = false;
    }

    let posObject = this.getThrowTargetPos();
    let targetPos = posObject.pos;
    let worldPos = bodyNode.worldPosition.clone();
    let worldRot = bodyNode.worldRotation.clone();
    let bodySrc = bodyNode.getComponent(Npc);
    bodySrc.curJumpPos = targetPos;
    bodySrc.inWaterIdx = posObject.index;
    bodyNode.getChildByName("bodyMod").position = Vec3.UP;
    bodyNode.setParent(this.pan);
    bodyNode.worldPosition = worldPos;
    bodyNode.worldRotation = worldRot;
    let targetRot = this.getThrowTargetRot();
    bodyNode.worldScale = Vec3.ONE;
    bodySrc.moveToPos(
      bodyNode,
      targetPos,
      0.35,
      0,
      false,
      true,
      targetRot,
      () => {
        this.scheduleOnce(() => {
          bodySrc.onPlayDefrostAni(bodyNode, () => {});
        }, 0.2);
      },
      new Vec3(0, 2.5, 0),
      0.5,
      () => {
        if (GameGlobal.actor.isWarterAduioMap) AudioManager.soundPlay("jumpWater");
        this.scheduleOnce(() => {
          this.playWaterEffect(posObject.index);
        }, 0.25);
      },
    );

    GameGlobal.curWaterBody++;
    GameGlobal.curTakeBody--;
  }
  //#region 获取扔进池子的落点
  public getThrowTargetPos(): { pos: Vec3; index: number } {
    let resultPos = new Vec3(0, 0, 0);
    let resultIndex = 0;
    let targetPosArr: Vec3[] = GameGlobal.bOpenPool ? GameGlobal.inWaterPos6Arr : GameGlobal.inWaterPos2Arr;
    for (let i = 0; i < targetPosArr.length; i++) {
      if (this.pan.children.length > 0) {
        let bHave = false;
        for (let j = 0; j < this.pan.children.length; j++) {
          let targetPos = this.pan.children[j].getComponent(Npc).curJumpPos;
          if (targetPos.equals(targetPosArr[i])) {
            bHave = true;
            break;
          }
        }
        if (!bHave) {
          resultPos = targetPosArr[i];
          resultIndex = i;
          break;
        }
      } else {
        resultPos = targetPosArr[i];
        resultIndex = i;
        break;
      }
    }
    return { pos: resultPos, index: resultIndex };
  }

  //#region 获取扔进池子的旋转
  public getThrowTargetRot(): Vec3 {
    if (GameGlobal.bOpenPool) {
      return Math.floor(GameGlobal.curWaterBody / 3) > 0 ? new Vec3(0, 90, 0) : new Vec3(0, -90, 0);
    } else {
      return GameGlobal.curWaterBody == 0 ? new Vec3(0, 180, 0) : new Vec3(0, 0, 0);
    }
  }

  //#region 扔进池子后播放水花特效
  public playWaterEffect(index: number) {
    if (GameGlobal.bOpenPool) {
      this.pos6EfcArr[index].active = true;
      this.scheduleOnce(() => {
        this.pos6EfcArr[index].active = false;
      }, 1);
    } else {
      this.pos2EfcArr[index].active = true;
      this.scheduleOnce(() => {
        this.pos2EfcArr[index].active = false;
      }, 1);
    }
    // if (GameGlobal.actor.isWarterAduioMap) AudioManager.soundPlay("jumpWater");
  }

  public initPos() {
    for (let index = 0; index < this.node.getChildByName("pan").children.length; index++) {
      let node = this.node.getChildByName("pan").children[index];
      let cengid = Math.floor(index / 20);
      let lieid = Math.floor(index % 20);
      let y = 0.05 + cengid * 0.04;
      let z = -0.606 + lieid * 0.075;
      let targetPos = new Vec3(0, y, z);
      node.position = targetPos;
      // node.eulerAngles = v3(0,-90,0);
    }
  }

  //普通飞
  moveToPos(node: Node, pos: Vec3, delay: number, callback?) {
    let startPos = node.position.clone();
    let tempVec3 = new Vec3(0, 0, 0);
    let controlPos = new Vec3(0, 0, 0);
    Vec3.add(controlPos, startPos, pos);
    controlPos.multiplyScalar(0.5);
    controlPos.add3f(0, 1, 0);
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

  //#region 水池解锁
  onPoolOpen() {
    GameGlobal.bOpenPool = true;
    this.node.getChildByName("yugang").active = false;
    this.node.getChildByName("yuchi").active = true;
    this.node.getChildByName("yuchi").scale = Vec3.ZERO;
    tween(this.node.getChildByName("yuchi"))
      .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
      .to(0.1, { scale: v3(0.9, 0.9, 0.9) })
      .to(0.05, { scale: v3(1, 1, 1) })
      .start();

    this.throwTriggerNode.setPosition(this.trgPosYC);
    this.throwTriggerNode.scale = this.trgScaleYC;

    this.scheduleOnce(() => {
      this.YGTrigger.enabled = false;
      this.YCTrigger.enabled = true;
      this.YGFoot.enabled = false;
      this.YCFoot.enabled = true;
      if (this.pan.children.length > 0) {
        let rot: Vec3 = new Vec3(0, -90, 0);
        let len = GameGlobal.inWaterPos6Arr.length;
        for (let i = 0; i < this.pan.children.length; i++) {
          let idx = len - (i + 1);
          if (Math.floor(idx / 3) > 0) {
            rot = new Vec3(0, 90, 0);
          }
          this.pan.children[i].eulerAngles = rot;
          this.pan.children[i].position = GameGlobal.inWaterPos6Arr[idx];
        }
      }
    }, 0.1);
    AudioManager.soundPlay("propShow");
  }
}
