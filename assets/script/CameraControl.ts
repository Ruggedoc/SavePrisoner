import { _decorator, Component, Node, Vec3, screen, tween, Quat, v3, director, Director } from "cc";
import { GameGlobal } from "./GameGlobal";
import { PlayableSDK } from "./Tool/PlayableSDK";
import { PlayerAction } from "./Tool/PrintComponent";
import { MainGame } from "./MainGame";
const { ccclass, property } = _decorator;

@ccclass("CameraControl")
export class CameraControl extends Component {
  eulerHeng = new Vec3(-42, -35, 0);
  eulerShu = new Vec3(-42, -35, 0);
  actorPos = new Vec3(0, 0, 0);
  hengPos = new Vec3(-19.8, 30, 27.85);
  shuPos = new Vec3(-19.8, 30, 27.85);
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

  private moveTween = null;

  //#region  震动参数
  // /**是否开启震动 */
  // private isShaking = false;
  // /**震动结束将要恢复镜头 */
  // private isShakEnd = false;
  // /**持续时间 */
  // private duration = 0;
  // /**震动计时 */
  // private elapsedTime = 0;
  // /**震动幅度 值越大晃动区间越大 */
  // private amplitude = 0;
  // /**震动频率 震动时间内震动的次数，每次会重新计算震动曲线 */
  // private frequency = 0;
  // /**相机初始坐标点 */
  // private originalPos = new Vec3();
  // /**惯性的速度 */
  // private velocity = new Vec3(); // 速度向量，用于产生惯性
  // /**震动方向偏好（可以用于模拟特定方向冲击，如爆炸主要震向后方） */
  // private directionBias = new Vec3(1, 1, 0);

  public smoothSpeed: number = 5; // 跟随平滑系数

  // 震动相关
  private _isShaking: boolean = false;
  private _shakeDuration: number = 0;
  private _shakeIntensity: number = 0;
  private _shakeTimer: number = 0;

  // 当前位置缓存
  private _currentPos: Vec3 = new Vec3();
  onLoad() {
    GameGlobal.CameraControl = this;
  }

  start() {
    this.targetQuat = new Quat();
    this.destForward.set(0, 0, 0); //归一化的向量
    this.currForward.set(0, 0, -1);
    this.tou = GameGlobal.actor.node.getChildByName("tou");
    this.cameraOnLoad();

    director.on(Director.EVENT_AFTER_PHYSICS, this.onAfterPhysics, this);
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
    if (this.offsetPos.x == 0) {
      return;
    }
    this.actorPos = this.tou.worldPosition.clone();
    let pos = new Vec3();
    Vec3.add(pos, this.actorPos, this.offsetPos);
    this.node.setPosition(pos);
  }

  cameraFollowForTarget(target: Node) {
    if (this.offsetPos.x == 0) {
      return;
    }
    let targetPos = target.worldPosition.clone();
    let pos = new Vec3();
    Vec3.add(pos, targetPos, this.offsetPos);
    this.node.setPosition(pos);
  }

  cameraMoveTotar_actor(targetNode: Node, time1, stoptime, time2, callback?) {
    GameGlobal.cameraMoving = true;
    //actor
    let initPos = this.node.worldPosition.clone();

    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);

    tween(this.node)
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
    let targetPos = this.tou.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(this.node)
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
    tween(this.node)
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
        tween(this.node)
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
        tween(this.node)
          .to(moveTime, { worldPosition: targetPos2 })
          .call(() => {
            callback && callback();
            GameGlobal.cameraMoving = false;
          })
          .start();
      })
      .start();
  }

  cameraEnd() {
    tween(GameGlobal.mainCamera)
      .to(0.5, { fov: this.gameInitFov + 20 })
      .call(() => {
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
    tween(this.node)
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
    tween(this.node)
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
    tween(this.node)
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
    let initPos = this.node.worldPosition.clone();
    let targetPos = targetNode.worldPosition.clone();
    let targetPos2 = new Vec3(0, 0, 0);
    Vec3.add(targetPos2, targetPos, this.offsetPos);
    tween(this.node)
      .to(0.7, { worldPosition: targetPos2 })
      .call(() => {
        callback && callback();
        tween(this.node)
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
        tween(this.node)
          .to(0.7, { worldPosition: targetPos2 })
          .call(() => {
            callback && callback();
            //高度回落
            tween(GameGlobal.mainCamera)
              .delay(1)
              .to(0.5, { fov: this.gameInitFov })
              .call(() => {
                tween(this.node)
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

  //#region 摄像机震动
  /**
   * 触发摄像机震动
   * @param intensity 震动强度（如：0.5表示在±0.5范围内随机偏移）
   * @param duration 震动持续时间（秒）
   */
  public triggerShake(intensity: number = 0.5, duration: number = 0.3) {
    this._shakeIntensity = intensity;
    this._shakeDuration = duration;
    this._shakeTimer = 0;
    this._isShaking = true;
  }

  public stopShake() {
    this._isShaking = false;
    // 震动结束后，直接归位到平滑跟随位置，避免跳帧
    this.node.setWorldPosition(this._currentPos);
  }

  private onAfterPhysics() {
    if (!this._isShaking) return;
    // 1. 计算跟随的目标位置（世界坐标）
    const targetWorldPos = this.tou.worldPosition;
    const desiredPos = new Vec3(
      targetWorldPos.x + this.offsetPos.x,
      targetWorldPos.y + this.offsetPos.y,
      targetWorldPos.z + this.offsetPos.z,
    );

    // 2. 平滑跟随（使用线性插值 lerp）
    // 先获取当前位置
    this._currentPos.set(this.node.worldPosition);
    // 插值计算（smoothSpeed越大，跟随越快）
    const lerpFactor = 1 - Math.exp((-this.smoothSpeed * 1) / 60);
    Vec3.lerp(this._currentPos, this._currentPos, desiredPos, lerpFactor);

    // 3. 叠加震动偏移
    if (this._isShaking) {
      // 在X和Y方向上产生随机偏移
      const shakeX = (Math.random() - 0.5) * this._shakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this._shakeIntensity * 2;

      // 最终位置 = 平滑跟随位置 + 震动偏移
      this.node.setWorldPosition(this._currentPos.x + shakeX, this._currentPos.y + shakeY, this._currentPos.z);

      // 更新震动计时
      this._shakeTimer += 1 / 60;
      if (this._shakeTimer >= this._shakeDuration) {
        this.stopShake();
      }
    } else {
      // 不震动时，直接使用平滑跟随后的位置
      this.node.setWorldPosition(this._currentPos);
    }
  }
}
