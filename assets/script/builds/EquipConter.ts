import { _decorator, Collider, Component, Node, SkeletalAnimation, Vec3, Animation, tween, Quat } from "cc";
import { Utils } from "../Utils";
import { GameGlobal } from "../GameGlobal";
import { Moeny } from "./Moeny";
import { Npc } from "../actor/Npc";
import { ActorFlyAttribute } from "../actor/ActorFlyAttribute";
const { ccclass, property } = _decorator;

@ccclass("EquipConter")
export class EquipConter extends Component {
  @property(Collider)
  goldTrigger: Collider;
  @property(Node)
  goldPos: Node;

  /**柜台金币堆叠的距离 */
  private coinOffestY: number = 0.084;

  npcPayMoneyArr: Node[] = [];
  actorTakeMoneyArr: Node[] = []; 

  anim: SkeletalAnimation;
  currAnim: string;

  start() {
    GameGlobal.equipConter = this;
    this.goldTrigger.on("onTriggerEnter", this.onGoldTriggerEnter, this);
    this.goldTrigger.on("onTriggerStay", this.onGoldTriggerStay, this);
    this.goldTrigger.on("onTriggerExit", this.onGoldTriggerExit, this);
    // this.anim = this.node
    //   .getChildByName("conter")
    //   .getChildByName("女警")
    //   .getComponent(SkeletalAnimation);
    // this.animPlay("idle");
  }
  onGoldTriggerExit(event) {}
  onGoldTriggerStay(event) {}
  onGoldTriggerEnter(event) {}

  update(deltaTime: number) {
    if (GameGlobal.isOver) return;
    this.updataNpcPayMoneyArr(deltaTime);
    this.updateActorTakeMoneyArr(deltaTime);
  }

  updataNpcPayMoneyArr(dt) {
    if (this.npcPayMoneyArr.length > 0) {
      let unEnter = [];
      unEnter = this.npcPayMoneyArr.filter((n, i) => {
        let nodeSrc = n.getComponent(Moeny);

        let targetPos = this.getNextCoinWorldPos();

        let controlPos = new Vec3(
          (nodeSrc.cunterStartPos.x + targetPos.x) / 2,
          Math.max(nodeSrc.cunterStartPos.y, targetPos.y) + 1, // 保持一定高度
          (nodeSrc.cunterStartPos.z + targetPos.z) / 2,
        );

        // 更新进度（随时间增加）
        nodeSrc.cunterProgress += dt * GameGlobal.paySpeed;
        if (nodeSrc.cunterProgress >= 1) nodeSrc.cunterProgress = 1;
        let tempPos = new Vec3();

        // 调用贝塞尔函数计算当前帧位置
        Utils.bezierCurve(nodeSrc.cunterProgress, nodeSrc.cunterStartPos, controlPos, targetPos, tempPos);

        // 如果进度超过1，完成移动
        if (nodeSrc.cunterProgress >= 1) {
          nodeSrc.cunterProgress = 1;
          nodeSrc.isMoveb = false;
          nodeSrc.isConterEnter = false;
          n.setWorldPosition(tempPos);
          n.setParent(this.goldPos);
          n.eulerAngles = new Vec3(0, 90, 0);
          this.refreshCoinPos();
          return false;
        }

        // 赋值给物体
        n.setWorldPosition(tempPos);
        return true;
      });
      this.npcPayMoneyArr = [];
      this.npcPayMoneyArr = unEnter;
    }
  }

  updateActorTakeMoneyArr(dt) {
    if (this.actorTakeMoneyArr.length > 0) {
      let unTakeArr = [];
      unTakeArr = this.actorTakeMoneyArr.filter((n, i) => {
        let nodeSrc = n.getComponent(Moeny);
        // 获取角色实时位置（终点）
        let localPos = new Vec3(0, 0.084 * GameGlobal.actor.bag2.children.length, 0);
        let targetPos = Utils.localToWorld(GameGlobal.actor.bag2, localPos);

        let controlPos = new Vec3(
          (nodeSrc.cunterStartPos.x + targetPos.x) / 2,
          Math.max(nodeSrc.cunterStartPos.y, targetPos.y) + 1, // 保持一定高度
          (nodeSrc.cunterStartPos.z + targetPos.z) / 2,
        );

        // 更新进度（随时间增加）
        nodeSrc.cunterProgress += dt * GameGlobal.takeSpeed;
        if (nodeSrc.cunterProgress >= 1) nodeSrc.cunterProgress = 1;
        let tempPos = new Vec3();

        // 调用贝塞尔函数计算当前帧位置
        Utils.bezierCurve(nodeSrc.cunterProgress, nodeSrc.cunterStartPos, controlPos, targetPos, tempPos);

        // 如果进度超过1，完成移动
        if (nodeSrc.cunterProgress >= 1) {
          nodeSrc.cunterProgress = 1;
          nodeSrc.isMoveb = false;
          nodeSrc.isConterLeave = false;
          n.setWorldPosition(tempPos);
          n.setParent(GameGlobal.actor.bag2);
          n.eulerAngles = Vec3.ZERO;
          GameGlobal.actor.checkBagPos();
          GameGlobal.actor.cleanBag();
          GameGlobal.mainGame.updateMoney();
          // let q: Quat = new Quat();
          // Quat.fromEuler(q, 0, 0, 0);
          // tween(n).to(0.1, { rotation: q });
          return false;
        }

        // 赋值给物体
        n.setWorldPosition(tempPos);
        return true;
      });
      this.actorTakeMoneyArr = [];
      this.actorTakeMoneyArr = unTakeArr;
    }
    // if (this.actorTakeMoneyArr.length > 0) {
    //   let addArr = this.getActorWaitFlyMoney(); //this.actorTakeMoneyArr.filter((item) => item.getComponent(Moeny).isMoveb == false);
    //   if (addArr.length > 0) {
    //     while (addArr.length > 0) {
    //       let moneyNode = addArr.shift();
    //       // let moneySrc = moneyNode.getComponent(Moeny);

    //       moneyNode.setParent(GameGlobal.actor.bag2);
    //       GameGlobal.actor.cleanBag();
    //       GameGlobal.actor.checkBagPos();
    //       // moneySrc.isready = true;
    //     }
    //   }
    //   for (const item of this.actorTakeMoneyArr) {
    //     if (item.moneyNode.getComponent(Moeny).isMoveb) {
    //       let localPos = new Vec3(0, 0.084 * GameGlobal.actor.bag2.children.length, 0);
    //       let targetWorldPos = Utils.localToWorld(GameGlobal.actor.bag2, localPos);
    //       // let upOffest: Vec3 = new Vec3(
    //       //   0,
    //       //   Math.max(GameGlobal.equipConter.goldPos.children.length, GameGlobal.actor.bag2.children.length) * 0.084 + 1,
    //       //   0,
    //       // );

    //       let controlPos = new Vec3(
    //         (item.startPos.x + targetWorldPos.x) / 2,
    //         Math.max(item.startPos.y, targetWorldPos.y) + 1, // 保持一定高度
    //         (item.startPos.z + targetWorldPos.z) / 2,
    //       );
    //       item.progress += dt * this.takeSpeed;
    //       if (item.progress >= 1) {
    //         item.progress = 1;
    //       }
    //       let movePos = new Vec3(0, 0, 0);
    //       Utils.bezierCurve(item.progress, item.startPos, controlPos, targetWorldPos, movePos);
    //       item.moneyNode.setWorldPosition(movePos);
    //       if (item.progress >= 1) {
    //         let initScale = item.moneyNode.scale.clone();
    //         Utils.jellyEffect(item.moneyNode, initScale.x, () => {
    //           item.moneyNode.setWorldScale(Vec3.ONE);
    //           item.moneyNode.setParent(GameGlobal.actor.bag2);
    //           item.moneyNode.getComponent(Moeny).isMoveb = false;
    //           item.moneyNode.getComponent(Moeny).isready = true;
    //         });
    //         GameGlobal.equipConter.actorTakeMoneyArr.delete(item);
    //       }
    //     }
    //   }
    // }

    // moneyNode.setParent(GameGlobal.actor.bag2);
    // GameGlobal.actor.cleanBag();
    // moneyNode.worldPosition = oldWorlPos;
    // moneyNode.eulerAngles = Vec3.ZERO;
    // moneySrc.moveToPos(
    //   true,
    //   localPos,
    //   0.25,
    //   upOffest,
    //   () => {
    //     GameGlobal.mainGame.updateMoney();
    //     GameGlobal.actor.cleanBag();
    //   },
    //   true,
    // );
    // }
  }

  // getActorWaitFlyMoney() {
  //   let waitFlyArr = [
  //     ...this.actorTakeMoneyArr.filter(
  //       (item) => item.getComponent(Moeny).isMoveb == true && item.getComponent(Moeny).isConterLeave == true,
  //     ),
  //   ];
  //   let otherArr = [
  //     ...this.actorTakeMoneyArr.filter(
  //       (item) => item.getComponent(Moeny).isMoveb == false || item.getComponent(Moeny).isConterLeave == false,
  //     ),
  //   ];
  //   this.actorTakeMoneyArr = [];
  //   this.actorTakeMoneyArr = otherArr;

  //   return waitFlyArr;
  // }

  /**
   *
   * @returns 扔出的金币的下一个位置坐标
   */
  public getNextCoinPos(): Vec3 {
    let result: Vec3 = new Vec3(0, 0, 0);
    let len: number = this.goldPos.children.length;
    // if (len > 0) {
    // let tempVe3 = this.goldPos.children[len - 1].worldPosition.clone();
    if (len >= GameGlobal.moneyConterMaxY) len = GameGlobal.moneyConterMaxY;
    result = new Vec3(0, len * this.coinOffestY, 0);
    // }
    return result;
  }

  /**
   * 世界坐标
   * @returns 扔出的金币的下一个位置坐标柜台
   */
  public getNextCoinWorldPos(): Vec3 {
    let result: Vec3 = new Vec3(0, 0, 0);
    let len: number = this.goldPos.children.length;
    let len2: number = this.npcPayMoneyArr.length;
    let len3: number = this.actorTakeMoneyArr.length;
    let resultLen: number = len + len2 - len3;
    let localPos: Vec3 = new Vec3();
    if (resultLen >= GameGlobal.moneyConterMaxY) resultLen = GameGlobal.moneyConterMaxY;
    localPos = new Vec3(0, resultLen * this.coinOffestY, 0);
    result = Utils.localToWorld(this.goldPos, localPos);
    return result;
  }

  /**
   * 预测位置 柜台本地坐标
   * @returns 扔出的金币的下一个位置坐标(预测)
   */
  public getNextCoinPos2(): Vec3 {
    let result: Vec3 = new Vec3(0, 0, 0);
    let len: number = this.goldPos.children.length;
    let len2: number = this.npcPayMoneyArr.length;
    let len3: number = this.actorTakeMoneyArr.length;
    let resultLen: number = len + len2 - len3;
    if (resultLen >= GameGlobal.moneyConterMaxY) resultLen = GameGlobal.moneyConterMaxY;
    result = new Vec3(0, resultLen * this.coinOffestY, 0);
    return result;
  }

  refreshCoinPos() {
    let len: number = this.goldPos.children.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        let tNode = this.goldPos.children[i];
        let moneyScr = tNode.getComponent(Moeny);
        if (moneyScr.isMoveb) continue;
        let count = i;
        if (count >= GameGlobal.moneyConterMaxY) count = GameGlobal.moneyConterMaxY;
        tNode.setPosition(new Vec3(0, count * this.coinOffestY, 0));
        let moneySrc = tNode.getComponent(Moeny);
        moneySrc.isready = true;
      }
    }
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
}
