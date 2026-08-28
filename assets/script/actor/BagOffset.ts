import { _decorator, Component, Node, tween, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { Moeny } from "../builds/Moeny";
const { ccclass, property } = _decorator;

@ccclass("BagOffset")
export class BagOffset extends Component {
  //----------- 背包偏移移动 -------------
  @property({ type: Number, tooltip: "背包高度上限" })
  public bagMax = 30;
  @property({ type: Vec3, tooltip: "角度偏移量" })
  movingOffset: Vec3 = new Vec3(0, 0, 0.015);

  @property({ type: Number, tooltip: "背包道具的X轴间距" })
  public xSpacing: number = 0;
  @property({ type: Number, tooltip: "背包道具的Y轴间距" })
  public ySpacing: number = 0.1;
  @property({ type: Number, tooltip: "背包道具的Z轴间距" })
  public zSpacing: number = 0;

  @property({ type: Number, tooltip: "每层偏移量" })
  baseDelayFactor: number = 0.2;
  @property({ type: Number, tooltip: "总体偏移" })
  layerDifferenceFactor: number = 0.1;

  //背包宽度，基本都是1，很少出现多排
  public zCount: number = 1;
  public xCount: number = 1;

  //缓动相关变量
  movingOffsetSwitch: boolean = false;
  swingingIn: boolean = false;
  swingingInRatio: number = 0;
  swingingOut: boolean = false;
  swingingOutRatio: number = 0;

  onLoad() {
    GameGlobal.bagoffset = this;
  }

  start() {}

  //背包物理晃动
  private getTarget(i: number, item: Node = null): Vec3 {
    let posX = 0;
    let posZ = 0;
    let posY = 0;
    // Z轴先铺满：先计算Z轴索引，再计算X轴索引
    const zIndex = -(i % this.zCount);
    const xIndex = Math.floor(i / this.zCount) % this.xCount;
    const yLayer = Math.floor(i / (this.xCount * this.zCount));

    posX = xIndex * this.xSpacing;
    posZ = zIndex * this.zSpacing;
    posY = yLayer * this.ySpacing;

    // 新增：背包倾斜逻辑
    if (this.movingOffsetSwitch || this.swingingOut) {
      const layerDelay = yLayer * (yLayer * this.layerDifferenceFactor) * this.baseDelayFactor;

      // 主要的层级延迟偏移
      const layerOffsetX = this.movingOffset.x * layerDelay;
      const layerOffsetY = this.movingOffset.y * layerDelay;
      const layerOffsetZ = this.movingOffset.z * layerDelay;

      let swingingRatio = 1;
      if (this.movingOffsetSwitch && this.swingingIn) {
        swingingRatio = this.swingingInRatio;
      }
      if (this.swingingOut) {
        swingingRatio = this.swingingOutRatio;
      }

      posX += layerOffsetX * swingingRatio;
      posY += layerOffsetY * swingingRatio;
      posZ += layerOffsetZ * swingingRatio;
    }
    return new Vec3(posX, posY, -posZ);
  }

  tTmp = {
    onUpdate: (T) => {
      this.swingingOutRatio = T.t;
    },
  };

  swingingOutTween = tween({ t: 1 })
    .call((T) => {
      T.t = 1;
      this.swingingOutRatio = 1;
      this.swingingOut = true;
    })
    .to(0.15, { t: -0.8 }, this.tTmp)
    .to(0.15, { t: 0.6 }, this.tTmp)
    .to(0.15, { t: -0.4 }, this.tTmp)
    .to(0.15, { t: 0.2 }, this.tTmp)
    .to(0.15, { t: 0 }, this.tTmp)
    .call(() => {
      this.swingingOut = false;
    });

  swingingInTween = tween({ t: 0 })
    .call((T) => {
      T.t = 0;
      this.swingingInRatio = 0;
      this.swingingIn = true;
    })
    .to(
      0.075,
      { t: 1.0 },
      {
        onUpdate: (T) => {
          this.swingingInRatio = (T as any).t;
        },
      },
    )
    .call(() => {
      this.swingingIn = false;
    });

  /**
   * @zh 开启背包倾斜
   */
  isPlayingBagTilt: boolean = false;
  onMovingOffset() {
    if (this.isPlayingBagTilt) return;
    this.isPlayingBagTilt = true;
    this.swingingOutTween.stop();
    this.swingingOut = false;
    this.swingingInTween.start();
    if (this.movingOffsetSwitch == false) this.movingOffsetSwitch = true;
    this.reflash();
  }
  /**
   * @zh 关闭背包倾斜
   */
  offMovingOffset() {
    if (!this.isPlayingBagTilt) return;

    this.isPlayingBagTilt = false;
    this.swingingInTween.stop();
    this.swingingIn = false;
    this.swingingOutTween.start();
    if (this.movingOffsetSwitch) this.movingOffsetSwitch = false;
    this.reflash();
  }

  reflash() {
    for (let i = 0; i < this.node.children.length; i++) {
      let child = this.node.children[i];
      /*** 这里自己添加一个筛选，把移动中的道具排除，只对已在背包中的道具进行偏移处理 */
      // if (child.getComponent(Moeny).isready && !child.getComponent(Moeny).isMoveb) {
      let length = i;
      if (length > this.bagMax) {
        length = this.bagMax;
        // }
      }
      child.setPosition(this.getTarget(length));
    }
  }

  update(deltaTime: number) {
    if (this.swingingOut || this.swingingIn) {
      this.reflash();
    }
  }
}
