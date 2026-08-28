import { _decorator, Component, Node, Quat, SkeletalAnimation, Vec3, Animation, v3, tween, Collider } from "cc";
import { MainGame } from "../MainGame";
import { GameGlobal } from "../GameGlobal";
import { Npc } from "./Npc";
import { PlayerAniState } from "../EnumDefine";
import { ShopTrigger } from "../builds/ShopTrigger";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("FMPlayer")
export class FMPlayer extends Component {
  @property(Node)
  tou: Node;
  //移动相关
  _currPos: Vec3 = new Vec3();
  tempV3 = new Vec3();
  targetQuat: Quat;
  destForward: Vec3 = new Vec3(); //归一化的向量
  currForward: Vec3 = new Vec3(); //当前方向，归一化的向量
  collider: Collider;
  tempPos = new Vec3();

  currAnim = "";
  anim: SkeletalAnimation;

  public speed = 3;
  NextAttackTime = 0; //下次攻击时间
  skillTime = 500; //攻击间隔时间

  //怪物状态
  public state = -1; //0找尸体 1装尸体 2卸尸体 3踩锤子开关
  public isattackb = false; //是否攻击中

  // public posList: Node[] = [];
  // public posList2: Node[] = [];
  // public moveindex = 0;

  public hp: number = 0;
  public hpmax: number = 50;

  public playerTakeNpcPos: Vec3[] = [];

  public enterPos = new Vec3(); //首个目标点
  public takePos1: Vec3 = new Vec3(); //锤子触发按钮点
  public takePos2: Vec3 = new Vec3(); //锤子触发按钮点
  public touchPos = new Vec3(); //锤子触发按钮点
  public bodyTakePos: Node; //车上尸体的挂点
  public takeOffPos: Node; //扔尸体的点
  public takeOffTime: number = 0.25; //扔尸体间隔时间
  public targetBodyNode: Node = null; //尸体目标
  public targetPos: Vec3 = null; //移动目标
  /**引导摄像机跟随 */
  public isYDNpcMove: boolean = false;
  public followTime: number = 1.5;
  public followCountDown: number = 0;

  start() {
    GameGlobal.FMPlayer = this;
    this.targetQuat = new Quat();
    this.destForward.set(0, 0, 0); //归一化的向量
    this.currForward.set(0, 0, -1);
    this.anim = this.node.getChildByName("主角").getComponent(SkeletalAnimation);
    this.collider = this.node.getChildByName("pz").getComponent(Collider);
    this.collider.on("onCollisionEnter", this.onCollisionEnter, this);
    this.animPlay(PlayerAniState.Idle);

    let tempNode: Node = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("workPosList");
    this.enterPos = tempNode.getChildByName("enterPos").worldPosition;
    this.touchPos = tempNode.getChildByName("touchPos").worldPosition;
    this.takeOffPos = tempNode.getChildByName("takeOffPos");
    this.takePos1 = tempNode.getChildByName("takePos0").worldPosition;
    this.takePos2 = tempNode.getChildByName("takePos1").worldPosition;
    this.bodyTakePos = this.node.getChildByName("bodyTakePos");
    let startPos = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("npcCreatePos").worldPosition;
    this.node.worldPosition = startPos;
    this.hp = this.hpmax;
    let nanNode = this.node.getChildByName("主角");

    this.playerTakeNpcPos = [
      new Vec3(-0.95, 0.132, -0.95),
      new Vec3(-1, 0.35, -0.4),
      new Vec3(-1, -0.05, -0.3),
      new Vec3(0.6, 0.65, 0),
      new Vec3(0.75, -0.05, -0.3),
      new Vec3(0.8, 0.26, 0.82),
    ];
    nanNode.scale = Vec3.ZERO;
    tween(nanNode)
      .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
      .to(0.1, { scale: v3(0.9, 0.9, 0.9) })
      .to(0.05, { scale: v3(1, 1, 1) })
      .call(() => {
        this.state = -1;
      })
      .start();

    GameGlobal.FMPlayer.isYDNpcMove = true; //开启摄像机引导
    GameGlobal.bPlayerOpen = true;
    GameGlobal.cameraMoving = true;
  }

  update(dt: number) {
    if (GameGlobal.isOver || GameGlobal.isStop) {
      this.animPlay(PlayerAniState.Idle);
      return;
    }
    if (this.isYDNpcMove) {
      this.followCountDown += dt;
      GameGlobal.CameraControl.cameraFollowForTarget(this.tou);
      if (this.followCountDown >= this.followTime) {
        this.isYDNpcMove = false;
        GameGlobal.CameraControl.cameraMoveToActor(0.5, () => {
          let buyPoolNode: Node = GameGlobal.ditieList.getChildByName("buyOver");
          let src = buyPoolNode.getComponent(ShopTrigger);
          this.scheduleOnce(() => {
            src.onNodeOpen();
          }, 0.8);
        });
      }
    }
    if (this.state == -1) {
      //出生出门，终身只会执行一次
      this.doMove(dt, 0.4, this.enterPos, () => {
        this.state = 0;
      });
    } else if (this.state == 0) {
      //检测离自己最近可以捡的尸体
      this.updateFindBoay(dt);
    } else if (this.state == 1) {
      //装尸体
      this.onTakeBody(dt);
    } else if (this.state == 2) {
      //去解冻尸体
      //   this.moveTree(dt);
      this.onThrowBody(dt);
    } else if (this.state == 3) {
      //踩锤子开关
      this.onBreakBody(dt);
    } else if (this.state == 4) {
      //移动
      this.onMove(dt);
    }
  }

  onMove(dt) {
    if (this.targetPos == null) {
      if (this.bodyTakePos.children.length <= 0) {
        this.state = 0;
        this.targetPos = null;
      } else {
        this.state = 2;
      }
      return;
    }
    let checkPos = new Vec3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    let dis = Vec3.distance(checkPos, this.targetPos);
    if (dis > 0.4) {
      this.doMove(dt, 0.4, this.targetPos, () => {
        this.node.worldPosition = this.targetPos;
        this.state = 1;
      });
    } else {
      this.node.worldPosition = this.targetPos;
      this.state = 1;
    }
  }

  //寻找可以伐木的目标
  public updateFindBoay(dt) {
    if (this.targetPos == null) {
      this.findTakpos();
    }
    let checkPos = new Vec3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    let dis = Vec3.distance(checkPos, this.targetPos);
    if (dis > 0.3) {
      this.state = 4;
      return;
    }
  }

  findTakpos() {
    let checkPos = new Vec3(this.node.worldPosition.x, 0, this.node.worldPosition.z);
    let dis1 = Vec3.distance(checkPos, this.takePos1);
    let dis2 = Vec3.distance(checkPos, this.takePos2);
    if (dis1 < dis2) this.targetPos = this.takePos1;
    if (dis1 >= dis2) this.targetPos = this.takePos2;
  }

  //移动
  public doMove(deltaTime, value, topos, call?) {
    this.animPlay(PlayerAniState.Move);
    let s = deltaTime * this.speed;
    Vec3.scaleAndAdd(this.tempPos, this.node.worldPosition, this.currForward, s);
    this.lookAt(topos);
    let dis = Vec3.distance(this.tempPos, topos);
    if (dis < value) {
      call && call();
      return;
    }
    this.node.setPosition(this.tempPos);
  }

  //装尸体
  public onTakeBody(dt) {
    if (GameGlobal.curPlayTakeBody >= GameGlobal.takeBodyMax2) {
      this.state = 2;
      return;
    }
    if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
      this.state = 3;
      return;
    }
    let tempdis = 0;
    let tempNode = null;
    for (let index = 0; index < GameGlobal.iceBoxList.bodyList.children.length; index++) {
      let bodyNode = GameGlobal.iceBoxList.bodyList.children[index];
      let bodySrc = bodyNode.getComponent(Npc);
      if (bodySrc.isready) {
        let dis = Vec3.distance(this.node.worldPosition, bodyNode.worldPosition);
        if (tempdis == 0) {
          tempdis = dis;
          tempNode = bodyNode;
        } else {
          if (dis < tempdis) {
            tempdis = dis;
            tempNode = bodyNode;
          }
        }
      }
    }
    if (tempNode == null) {
      return;
    }

    let tLen = this.bodyTakePos.children.length;
    let muSrc = tempNode.getComponent(Npc);

    GameGlobal.curPlayTakeBody++;
    muSrc.isready = false;

    let targetLocalPos = this.playerTakeNpcPos[tLen];
    let targetLocalRot = GameGlobal.actor.carBodyRotArr[tLen];

    let startWorldPos = tempNode.worldPosition.clone();
    let startWorldRot = tempNode.worldRotation.clone();
    GameGlobal.iceBoxList.onSetPosIdx(tempNode.position.clone());
    tempNode.setParent(this.bodyTakePos);

    tempNode.worldPosition = startWorldPos;
    tempNode.worldRotation = startWorldRot;
    tempNode.worldScale = Vec3.ONE;

    muSrc.moveToPos(tempNode, targetLocalPos, 0.1, 0, false, true, targetLocalRot, () => {
      this.cleanBag();
    });
  }

  private cleanBag() {
    let len: number = this.bodyTakePos.children.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        let nodyNode = this.bodyTakePos.children[i];
        // let modNode = nodyNode.getChildByName("bodyMod");
        nodyNode.position = this.playerTakeNpcPos[i];
        nodyNode.eulerAngles = GameGlobal.actor.carBodyRotArr[i];
      }
    }
  }
  //扔尸体
  public onThrowBody(dt) {
    if (this.bodyTakePos.children.length <= 0) {
      this.state = 0;
      this.targetPos = null;
      this.timeCount = 0;
      return;
    }
    let dis = Vec3.distance(this.node.worldPosition, this.takeOffPos.worldPosition);
    if (dis > 0.4) {
      this.doMove(dt, 0, this.takeOffPos.worldPosition, () => {});
      return;
    } else {
      if (GameGlobal.watarRoom.pan.children.length >= GameGlobal.waterOpenMax2) {
        this.animPlay(PlayerAniState.Idle);
        return;
      }
      this.onThrowBody2(dt);
    }
  }

  private timeCount: number = 0;
  onThrowBody2(dt) {
    this.timeCount += dt;
    if (this.timeCount < this.takeOffTime) return;
    this.timeCount = 0;

    let bodyNode: Node = this.bodyTakePos.children[0];
    if (bodyNode != null) {
      GameGlobal.curWaterBody++;
      GameGlobal.curPlayTakeBody--;
      let targetPos = GameGlobal.watarRoom.getThrowTargetPos();
      let targetRos = GameGlobal.watarRoom.getThrowTargetRot();
      let worldPos = bodyNode.worldPosition.clone();
      let worldRot = bodyNode.worldRotation.clone();
      let bodySrc = bodyNode.getComponent(Npc);
      bodySrc.curJumpPos = targetPos;
      bodyNode.setParent(GameGlobal.watarRoom.pan);
      bodyNode.worldPosition = worldPos;
      bodyNode.worldRotation = worldRot;
      // let bodyMod: Node = bodyNode.getChildByName("bodyMod");
      // bodyNode.setRotationFromEuler(0, 0, 0);
      // bodyMod.setRotationFromEuler(0, 0, 0);
      bodyNode.worldScale = Vec3.ONE;
      bodySrc.moveToPos(bodyNode, targetPos, 0.3, 0, false, true, targetRos, () => {
        // AudioManager.soundPlay("jumpWater");
        bodySrc.onPlayDefrostAni(bodyNode, () => {});
      });
      // AudioManager.soundPlay("throwNpc");
    }
  }

  public onBreakBody(dt) {
    if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
      this.targetPos = null;
      this.state = 0;
    }
    this.doMove(dt, 0.4, this.touchPos, () => {
      this.state = 0;
      AudioManager.soundPlay("footTag");
    });
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

  public onCollisionEnter(self) {}
}
