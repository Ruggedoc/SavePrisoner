import { _decorator, Component, math, tween, v3, Vec3 } from "cc";
import { Utils } from "../Utils";
import { GameGlobal } from "../GameGlobal";
import { ShopTrigger } from "./ShopTrigger";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("Moeny")
export class Moeny extends Component {
  public isready = false; //是否准备好可以收集
  public isMoveb = false; //是否收集中

  //#region 实时飞参数
  speed: number = 3; // 移动速度
  private startPos: Vec3 = new Vec3(); // 起点 A
  private controlPos: Vec3 = new Vec3(); // 控制点
  private endPos: Vec3 = new Vec3(); // 终点 B（角色位置）
  private upY: number = 1;
  private progress: number = 0;
  private tempPos: Vec3 = new Vec3();
  private isMoving: boolean = false;
  private callback: Function = null;

  public cunterStartPos: Vec3 = new Vec3();
  public cunterProgress: number = 0;
  public isConterEnter: boolean = false;
  public isConterLeave: boolean = false;

  //#region 飞  适合起始点和目标点固定不变的情况
  //普通飞
  moveToPos(
    ToUp: boolean,
    pos: Vec3,
    delay: number,
    upVe3: Vec3,
    callback?,
    isJelly: boolean = true,
    rotio: number = 0.8,
    rotioCallBack?,
  ) {
    let startPos = this.node.position.clone();
    let tempVec3 = new Vec3(0, 0, 0);
    let controlPos = new Vec3(0, 0, 0);
    let isRotioRun = false;
    Vec3.add(controlPos, startPos, pos);
    controlPos.multiplyScalar(0.5);
    if (ToUp) {
      // controlPos.add3f(0, 0, 3);
      controlPos.add3f(upVe3.x, upVe3.y, upVe3.z);
    } else {
      controlPos.multiplyScalar(0.5);
      let posX = math.random() * 3 - 1.5;
      controlPos.add3f(posX, 0, 1);
    }
    tween(this.node)
      .to(
        delay,
        { position: pos },
        {
          onUpdate: (target, ratio) => {
            Utils.bezierCurve(ratio, this.node.position, controlPos, pos, tempVec3);
            this.node.setPosition(tempVec3);
            if (!isRotioRun && ratio >= rotio) {
              rotioCallBack && rotioCallBack();
              isRotioRun = true;
            }
          },
        },
      )
      .call(() => {
        if (isJelly) {
          let initScale = this.node.scale.clone();
          Utils.jellyEffect(this.node, initScale.x, () => {
            this.node.setWorldScale(Vec3.ONE);
            this.isready = true;
            this.isMoveb = false;
            callback && callback();
          });
        } else {
          callback && callback();
        }
      })
      .start();
  }

  //放大飞
  moveToPos_fangda(ToUp: boolean, pos: Vec3, delay: number, callback?) {
    let startPos = this.node.position.clone();
    let tempVec3 = new Vec3(0, 0, 0);
    let controlPos = new Vec3(0, 0, 0);
    Vec3.add(controlPos, startPos, pos);
    controlPos.multiplyScalar(0.5);
    if (ToUp) {
      controlPos.add3f(0, 1, 0);
    } else {
      controlPos.multiplyScalar(0.5);
      let posX = math.random() * 3 - 1.5;
      controlPos.add3f(posX, 0, 1);
    }
    this.node.setWorldScale(v3(0.5, 0.5, 0.5));
    tween(this.node)
      .to(
        delay,
        { position: pos, worldScale: Vec3.ONE },
        {
          onUpdate: (target, ratio) => {
            Utils.bezierCurve(ratio, this.node.position, controlPos, pos, tempVec3);
            this.node.setPosition(tempVec3);
          },
        },
      )
      .call(() => {
        let initScale = this.node.scale.clone();
        Utils.jellyEffect(this.node, initScale.x, () => {
          this.node.setWorldScale(Vec3.ONE);
        });
        callback && callback();
      })
      .start();
  }

  //#region 飞  适合起始点和目标点固定不变的情况

  /**入口，填一个顶部偏移量，世界坐标 */
  onSetMoveParms(upY: number, speed: number, isConter: boolean, callback?) {
    this.upY = upY;
    this.speed = speed;
    this.startPos.set(this.node.worldPosition);
    this.isMoving = true;
    this.callback = callback;
  }

  update(dt: number): void {
    if (!this.isMoving) return;

    // 获取角色实时位置（终点）
    let localPos = new Vec3(0, 0.084 * GameGlobal.actor.bag2.children.length, 0);
    let targetPos = Utils.localToWorld(GameGlobal.actor.bag2, localPos);
    this.endPos.set(targetPos);

    this.controlPos.set(
      (this.startPos.x + this.endPos.x) / 2,
      Math.max(this.startPos.y, this.endPos.y) + this.upY, // 保持一定高度
      (this.startPos.z + this.endPos.z) / 2,
    );

    // 更新进度（随时间增加）
    this.progress += dt * this.speed;

    // 如果进度超过1，完成移动
    if (this.progress >= 1) {
      this.progress = 1;
      this.isMoving = false;
      this.node.setWorldPosition(this.tempPos);
      this.onFlyFinish();
      return;
    }

    // 调用贝塞尔函数计算当前帧位置
    Utils.bezierCurve(this.progress, this.startPos, this.controlPos, this.endPos, this.tempPos);

    // 赋值给物体
    this.node.setWorldPosition(this.tempPos);
  }

  onFlyFinish() {
    if (GameGlobal.actor.bag2.children.length < GameGlobal.moneyBagMax) {
      this.node.setParent(GameGlobal.actor.bag2);
      this.node.eulerAngles = new Vec3(0, 0, 0);
      GameGlobal.actor.cleanBag();
      GameGlobal.mainGame.updateMoney();
      let initScale = this.node.scale.clone();
      Utils.jellyEffect(this.node, initScale.x, () => {
        this.node.setWorldScale(Vec3.ONE);
      });
    }
    this.isready = true;
    this.isMoveb = false;

    if (this.callback != null) {
      this.callback();
      this.callback = null;
    }
    let idx = GameGlobal.curFlyCoin.indexOf(this.node);
    if (idx != -1) GameGlobal.curFlyCoin.splice(idx, 1);
  }
}
