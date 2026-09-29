import { _decorator, Component, Node, Vec3, screen, tween, Quat, v3, director, Director, Tween } from "cc";
import { GameGlobal } from "./GameGlobal";
import { PlayableSDK } from "./Tool/PlayableSDK";
import { PlayerAction } from "./Tool/PrintComponent";
import { MainGame } from "./MainGame";
const { ccclass, property } = _decorator;

@ccclass("CameraControl")
export class CameraControl extends Component {
  @property(Node)
  followRoot: Node;
  @property(Node)
  shakeRoot: Node;

  eulerHeng = new Vec3(-42, -35, 0);
  eulerShu = new Vec3(-42, -35, 0);
  actorPos = new Vec3(0, 0, 0);
  hengPos = new Vec3(0, 3, 2);
  shuPos = new Vec3(0, 3, 2);
  // hengPos = new Vec3(-2.2, 4.2, 0);
  // shuPos = new Vec3(-2.2, 4.2, 0);
  offsetPos = new Vec3(0, 0, 0);
  tou: Node;
  otherTarget: Node;
  initOrthoHeight: number = 0;
  targetOrthoHeight: number = 0;
  /**初始相机高度 */
  gameInitFov: number = 0;

  over_shuPos = new Vec3(2, 3.2, 2);
  over_eulerShu = new Vec3(-50, 45, 0);

  over_flag;
  over_far = 60;

  public overCameraFov = 35;
  public tempV3 = new Vec3();
  public targetQuat: Quat;
  public destForward: Vec3 = new Vec3(); //归一化的向量
  public currForward: Vec3 = new Vec3(); //当前方向，归一化的向量
  public ActorDirection = new Vec3(0, 0, -1);
  public islookOverPos = false;
  public targetOverNode = null;

  // 震动相关
  private _isShaking: boolean = false;

  onLoad() {
    GameGlobal.CameraControl = this;
  }

  start() {
    this.targetQuat = new Quat();
    this.destForward.set(0, 0, 0); //归一化的向量
    this.currForward.set(0, 0, -1);
    this.tou = GameGlobal.actor.node.getChildByName("tou");
    this.cameraOnLoad();
  }

  cameraOnLoad() {
    if (screen.windowSize.height > screen.windowSize.width && screen.windowSize.width / screen.windowSize.height < 1) {
      //竖屏
      this.node.setRotationFromEuler(this.eulerShu);
      this.offsetPos = this.shuPos;
      GameGlobal.mainCamera.fov = 20;
      this.gameInitFov = 20;
      // GameGlobal.mainCamera.orthoHeight = 4.5;
      // this.initOrthoHeight = 3.5;
      // this.targetOrthoHeight = 6;
    } else {
      //横屏
      this.node.setRotationFromEuler(this.eulerHeng);
      this.offsetPos = this.hengPos;
      GameGlobal.mainCamera.fov = 20;
      this.gameInitFov = 20;
      // GameGlobal.mainCamera.orthoHeight = 4;
      // this.initOrthoHeight = 3.5;
      // this.targetOrthoHeight = 4.5;
    }
    this.cameraFollow();
  }

  cameraFollow() {
    // if (this.offsetPos.x == 0) {
    //   return;
    // }
    this.actorPos = this.tou.worldPosition.clone();
    let pos = new Vec3();
    Vec3.add(pos, this.actorPos, this.offsetPos);

    // this.node.setPosition(pos);
    this.followRoot.setPosition(pos);
    // this.followRoot.setPosition(this.actorPos);
  }

  cameraFollowForTarget(target: Node) {
    if (this.offsetPos.x == 0) {
      return;
    }
    let targetPos = target.worldPosition.clone();
    let pos = new Vec3();
    Vec3.add(pos, targetPos, this.offsetPos);
    this.followRoot.setPosition(pos);
  }

  cameraMoveTotar_actor(targetNode: Node, time1, stoptime, time2, callback?) {
    GameGlobal.cameraMoving = true;
    //actor
    let initPos = this.followRoot.worldPosition.clone();

    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);

    tween(this.followRoot)
      .to(time1, { worldPosition: targetPos2 })
      .delay(stoptime)
      .to(time2, { worldPosition: initPos })
      .call(() => {
        callback && callback();
        //GameGlobal.cameraMoving = false;
      })
      .start();
  }

  cameraMoveToActor(moveTime = 0.7, callback?) {
    GameGlobal.cameraMoving = true;
    let temmp = this.tou.worldPosition.clone();
    let targetPos = new Vec3(temmp.x, 1.9, temmp.z);
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(this.followRoot)
      .to(moveTime, { worldPosition: targetPos2 })
      .call(() => {
        callback && callback();
        GameGlobal.cameraMoving = false;
      })
      .start();
  }

  cameraMove2(targetNode: Node, callback?, moveTime = 0.7) {
    GameGlobal.cameraMoving = true;
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    // tween(this.node)
    tween(this.followRoot)
      .to(moveTime, { worldPosition: targetPos2 })
      .call(() => {
        callback && callback();
        //GameGlobal.cameraMoving = false;
      })
      .start();
  }

  /**先抬高再移动到目标点 */
  cameraMove3(targetNode: Node, callback?, upTime = 0.5, moveTime = 0.7, cameraFov = this.gameInitFov + 5) {
    GameGlobal.cameraMoving = true;
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);

    tween(GameGlobal.mainCamera)
      .to(upTime, { fov: cameraFov })
      .call(() => {
        tween(this.followRoot)
          .to(moveTime, { worldPosition: targetPos2 })
          .call(() => {
            callback && callback();
            // GameGlobal.cameraMoving = false;
          })
          .start();
      })
      .start();
  }

  /**先落下再移动到目标点 */
  cameraMove4(targetNode: Node, callback?, downTime = 0.5, moveTime = 0.7, cameraFov = this.gameInitFov) {
    GameGlobal.cameraMoving = true;
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);

    tween(GameGlobal.mainCamera)
      .to(downTime, { fov: cameraFov })
      .call(() => {
        tween(this.followRoot)
          .to(moveTime, { worldPosition: targetPos2 })
          .call(() => {
            callback && callback();
            GameGlobal.cameraMoving = false;
          })
          .start();
      })
      .start();
  }

  cameraEnd(callback?) {
    tween(GameGlobal.mainCamera)
      .to(0.5, { fov: this.gameInitFov + 20 })
      .call(() => {
        callback && callback();
        // PlayableSDK.download(PlayerAction.automatic_jump);
      })
      .start();
  }

  cameraEnd2(callback?) {
    this.targetOverNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("OverPos");
    GameGlobal.cameraMoving = true;
    this.islookOverPos = true;
    let targetPos = this.targetOverNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(GameGlobal.mainCamera).to(0.3, { fov: this.overCameraFov }).start();
    tween(this.followRoot)
      .to(0.3, { worldPosition: targetPos2 })
      .call(() => {
        callback && callback();
      })
      .start();
  }

  //#region lookat
  /**
   * @zh
   * 设置当前节点旋转为面向目标位置，默认前方为 -z 方向
   * @param pos 目标位置
   */
  lookAt(pos: Vec3) {
    let mupos = v3(pos.x, pos.y, pos.z);
    let mypos = v3(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z);
    Vec3.subtract(this.tempV3, mupos, mypos);
    this.tempV3.normalize();
    Quat.rotationTo(this.targetQuat, this.ActorDirection, this.tempV3);
    this.destForward.set(this.tempV3);
    this.currForward.set(this.tempV3);
    this.node.setWorldRotation(this.targetQuat);
  }

  public axis: Vec3 = new Vec3();
  public quat: Quat = new Quat();
  public tempQuat: Quat = new Quat();
  public speed: number = 3;
  cameraEndRotation(targetNode: Node) {
    Vec3.subtract(this.axis, this.node.worldPosition, targetNode.worldPosition);
    this.axis.normalize();
    this.schedule((dt: number) => {
      let angle = (this.speed * dt * Math.PI) / 180;
      Quat.fromAxisAngle(this.tempQuat, this.axis, angle);
      this.node.worldRotation = Quat.multiply(this.quat, this.tempQuat, this.node.worldRotation);
      // this.node.rotate(this.tempQuat);
    }, 0.1);
  }

  cameraMoveToBoss(targetNode: Node, callback?) {
    GameGlobal.cameraMoving = true;
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(this.followRoot)
      .to(1, { worldPosition: targetPos2 })
      .call(() => {})
      .delay(1)
      .to(1, { worldPosition: initPos })
      .call(() => {
        callback && callback();
        GameGlobal.cameraMoving = false;
        // GameGlobal.boss2.node.active = false;
      })
      .start();
  }

  cameraMoveToNewMap(targetNode: Node, callback?) {
    GameGlobal.cameraMoving = true;
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(this.followRoot)
      .to(1, { worldPosition: targetPos2 })
      .call(() => {
        // GameGlobal.boss2.animPlay("attack");
      })
      .call(() => {
        callback && callback();
      })
      .start();
  }

  /**
   * 平移
   * @param targetNode
   * @param callback 相机到目标位置后做的操作
   */
  cameraMoveToPosPingPong(targetNode: Node, callback?) {
    GameGlobal.cameraMoving = true;
    let initPos = this.followRoot.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(this.followRoot)
      .to(0.7, { worldPosition: targetPos2 })
      .call(() => {
        callback && callback();
        tween(this.followRoot)
          .delay(1)
          .to(0.7, { worldPosition: initPos })
          .call(() => {
            GameGlobal.cameraMoving = false;
          })
          .start();
      })
      .start();
  }

  /**
   * 上移后平移
   * @param targetNode
   * @param callback 相机到目标位置后做的操作
   */
  cameraMoveToPosPingPongUp(targetNode: Node, callback?) {
    GameGlobal.cameraMoving = true;
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(GameGlobal.mainCamera)
      .to(0.5, { fov: this.gameInitFov + 5 })
      .call(() => {
        tween(this.followRoot)
          .to(0.7, { worldPosition: targetPos2 })
          .call(() => {
            callback && callback();
            //高度回落
            tween(GameGlobal.mainCamera)
              .delay(1)
              .to(0.5, { fov: this.gameInitFov })
              .call(() => {
                tween(this.followRoot)
                  .to(0.7, { worldPosition: initPos })
                  .call(() => {
                    GameGlobal.cameraMoving = false;
                  })
                  .start();
              })
              .start();
          })
          .start();
      })
      .start();
  }

  //#region 清除相机移动
  public clearCameraMove() {
    Tween.stopAllByTarget(this.followRoot);
  }

  //#region 摄像机震动
  public get isShaking() {
    return this._isShaking;
  }

  cameraShock(weak = false) {
    if (this._isShaking) {
      return;
    }
    this._isShaking = true;

    let strength: number;
    if (weak) {
      strength = 0.05;
    } else {
      strength = 0.5;
    }

    tween(this.shakeRoot)
      .by(0.07, { position: v3(-strength, 0, 0) })
      .by(0.07, { position: v3(strength, 0, 0) })
      .by(0.07, { position: v3(0, -strength, 0) })
      .by(0.07, { position: v3(0, strength, 0) })
      .by(0.07, { position: Vec3.ZERO })
      .call(() => {
        this._isShaking = false;
      })
      .start();
  }
}
