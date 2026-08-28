import { _decorator, Component, Node, Prefab, instantiate, Vec3, math, Animation } from "cc";
import { GameGlobal } from "../GameGlobal";
const { ccclass, property } = _decorator;

/**
 * 主角脚下 2D 箭头指引组件 + 3D 目标点箭头标记
 * 用法：把指引目标节点按事件触发顺序拖入"指引节点数组"（数组0 为开局默认指向）。
 * 切换由游戏事件驱动，业务代码调用本组件的 next() / switchTo() 切换当前指引节点：
 * - 主角首次背鱼上岸            → next()（指向数组1）
 * - counter2 节点首次有钱        → next()（指向数组2）
 * - 主角首次收到钱              → next()（指向数组3）
 * - 每个可升级地贴升级完成       → next()（依次指向数组4、5、6）
 * 2D箭头从主角脚下开始，沿当前指引节点方向单向流动（流水灯式），数量随距离动态增减，
 * 箭头朝向使用世界坐标设置，不随主角旋转而旋转。
 * 3D箭头在对应指引节点下生成，只显示当前指引节点的3D箭头标记。
 * 挂载节点：主角节点(Actor)
 */
@ccclass("JianTou2DGuide")
export class JianTou2DGuide extends Component {
  @property({ type: [Node], displayName: "指引节点数组", tooltip: "按事件触发顺序拖入指引目标节点（数组0为开局默认指向）" })
  guideNodes: Node[] = [];

  @property({ type: Prefab, displayName: "2D箭头预制体", tooltip: "拖入 assets/resources/prefab/jiantou2d" })
  arrowPrefab: Prefab = null;

  @property({ displayName: "启用2D箭头", tooltip: "总开关，关闭后不显示任何2D箭头" })
  isEnable: boolean = true;

  /** 暂停显示：true 时强制隐藏箭头（如主角在水下），出水后置回 false 恢复 */
  isPause: boolean = false;

  @property({ displayName: "箭头间距", tooltip: "相邻箭头之间的距离(米)，距离/间距=箭头数量" })
  arrowGap: number = 1.2;

  @property({ displayName: "最大箭头数量", tooltip: "同时显示箭头的上限，距离再远也不增加" })
  arrowMax: number = 8;

  @property({ displayName: "隐藏距离", tooltip: "主角与当前指引节点水平距离小于该值时隐藏箭头（已到达目标附近）" })
  hideDis: number = 1.2;

  @property({ displayName: "离地高度", tooltip: "箭头平躺地面时的 y 偏移，防止与地面穿模" })
  heightY: number = 0.03;

  @property({ displayName: "流动速度", tooltip: "箭头向终点方向单向移动的速度(米/秒)" })
  flowSpeed: number = 2;

  @property({ displayName: "箭头朝向偏移(度)", tooltip: "素材箭头尖朝上填0，尖朝右填90，用于纠正素材方向" })
  rotateOffset: number = 0;

  // ======== 3D箭头相关属性 ========

  @property({ type: Prefab, displayName: "3D箭头预制体", tooltip: "拖入3D箭头预制体，实例化后挂在每个指引节点下作为目标标记" })
  arrow3DPrefab: Prefab = null;

  @property({ displayName: "启用3D箭头", tooltip: "总开关，关闭后当前指引节点下不显示3D箭头标记" })
  is3DEnable: boolean = true;

  @property({ type: Node, displayName: "单独3D箭头", tooltip: "传入引导目标Node时，将用到这个箭头节点，放在游戏场景下" })
  curNode3DArrow: Node = null;

  curNode3DArrowAni: Animation = null;
  isChange: boolean = false;

  /** 2D箭头实例池（预创建，用 active 显隐） */
  arrowNodes: Node[] = [];
  /** 箭头容器（挂在主角节点下，跟随主角移动） */
  container: Node = null;
  /** 主角指向当前指引节点的水平方向 */
  dir = new Vec3();
  /** 当前指引节点索引（0 开始，开局默认指向数组0） */
  curIndex: number = 0;
  /** 当前指引Node (动态添加的指引目标) */
  curNode: Node = null;
  /** 当前指引Node头顶的Y偏移量 */
  curPosY: number = 1.3;
  /** 累计时间（流动动画计时基准） */
  flowTime: number = 0;

  /** 3D箭头实例数组（按指引节点数组顺序，每个指引节点下生成一个） */
  arrow3DNodes: Node[] = [];

  onLoad() {
    GameGlobal.jianTou2DGuide = this;
    // 创建2D箭头容器并挂到主角节点下，随主角位置移动
    this.container = new Node("jianTou2dContainer");
    this.node.addChild(this.container);
    // 预创建全部2D箭头实例，避免运行中频繁实例化/销毁
    for (let i = 0; i < this.arrowMax; i++) {
      let arrow = instantiate(this.arrowPrefab);
      arrow.active = false;
      this.container.addChild(arrow);
      this.arrowNodes.push(arrow);
    }
    // 初始化3D箭头实例
    this.init3DArrows();
    // this.init3DArrowSigle();
    this.curNode3DArrowAni = this.curNode3DArrow.getChildByName("箭头").getComponent(Animation);
  }

  protected start(): void {
    if (this.curNode3DArrowAni != null) this.curNode3DArrowAni.play("jianTou");
  }

  /** 初始化3D箭头：为每个指引节点生成一个3D箭头实例作为子节点 */
  init3DArrows() {
    if (!this.arrow3DPrefab) return;
    for (let i = 0; i < this.guideNodes.length; i++) {
      let guideNode = this.guideNodes[i];
      if (!guideNode) continue;
      let arrow3D = instantiate(this.arrow3DPrefab);
      arrow3D.active = false;
      guideNode.addChild(arrow3D);
      this.arrow3DNodes.push(arrow3D);
    }
  }

  //#region 实例化单个3D箭头
  //   init3DArrowSigle() {
  //     if (this.curNode3DArrow == null) this.curNode3DArrow = instantiate(this.arrow3DPrefab);
  //     this.curNode3DArrow.active = false;
  //     this.node.addChild(this.curNode3DArrow);
  //     this.curNode3DArrow.position = new Vec3(0, -5, 0);
  //   }

  /**
   * 切换到数组下一个指引节点（游戏事件驱动：背鱼上岸/counter2有钱/首次收钱/地贴升级）
   */
  next() {
    this.curIndex++;
  }

  /**
   * 直接切换到指定索引的指引节点
   */
  switchTo(index: number) {
    this.curIndex = index;
  }

  /**
   * 直接切换到指定Node;偏移量posY忽略父节点旋转,此方法加的箭头父节点为当前脚本挂载的节点
   * @param n : 引导对应的节点
   * @param posY : 头顶箭头向上的偏移量(世界坐标的Y),默认1.3;
   */
  setYDNode(n: Node, posY: number = 1.3) {
    this.isChange = this.curNode == null || this.curNode !== n;
    this.curNode = n;
    this.curPosY = posY;
  }

  lateUpdate(deltaTime: number) {
    this.flowTime += deltaTime;
    // 同步3D箭头显隐（独立于2D的 isEnable 开关）
    this.sync3DArrowState();
    if (!this.isEnable) return;
    // 暂停状态（主角在水下等场景）：强制隐藏箭头并跳过显示逻辑，避免 update 重新点亮
    if (this.isPause) {
      this.setArrowsActive(false);
      return;
    }
    let targetNode: Node = null;
    if (this.curNode != null) {
      targetNode = this.curNode;
    } else {
      // 数组为空、索引越界或为负 → 隐藏
      if (this.guideNodes.length <= 0 || this.curIndex < 0 || this.curIndex >= this.guideNodes.length) {
        this.setArrowsActive(false);
        return;
      }
      targetNode = this.guideNodes[this.curIndex];
      if (!targetNode) {
        // 数组中出现空引用节点，跳过
        this.curIndex++;
        this.setArrowsActive(false);
        return;
      }
    }
    if (targetNode == null) return;
    let actorPos = this.node.worldPosition;
    let targetPos = targetNode.worldPosition.clone();
    targetPos.y = this.heightY;
    // 箭头平躺地面，只计算水平方向与距离（忽略 y）
    this.dir.set(targetPos.x - actorPos.x, 0, targetPos.z - actorPos.z);
    let dis = this.dir.length();
    // 已到达目标附近 → 隐藏箭头
    if (dis < this.hideDis) {
      this.setArrowsActive(false);
      return;
    }
    this.dir.normalize();
    // 箭头数量 = 距离 / 间距，向下取整，不超过最大数量
    let arrowNum = Math.min(Math.ceil(dis / this.arrowGap), this.arrowMax);
    // 朝向角：预制体箭头尖默认朝 +Z，绕 Y 旋转对准目标方向
    let yaw = math.toDegree(Math.atan2(this.dir.x, this.dir.z)) + this.rotateOffset;
    // 跟随主角所在高度（陆地 y=0 / 水下 y=-1），加离地偏移防穿模
    let baseY = actorPos.y + this.heightY;
    // 终点 Y 与主角 Y 的差值，用于箭头 Y 轴沿路径从主角平滑过渡到终点高度
    let deltaY = targetPos.y - actorPos.y;
    // 单向流动循环总长：箭头走完整排长度后跳回起点，形成向终点流动的效果
    let totalLen = (arrowNum - 1) * this.arrowGap;

    for (let i = 0; i < this.arrowMax; i++) {
      let arrow = this.arrowNodes[i];
      if (i < arrowNum) {
        arrow.active = true;
        // 每个箭头从自己起点出发，以 flowSpeed 匀速向终点方向单向移动，
        // 移动到整排末尾后跳回起点重新出发（相邻箭头保持间距，顺序流动）
        let dist = this.arrowGap / 2 + ((i * this.arrowGap + this.flowTime * this.flowSpeed) % totalLen);
        // 沿路径的进度比例[0,1]，用于 Y 轴插值与防溢出
        let t = Math.min(dist / dis, 1);
        let arrowY = baseY + deltaY * t;
        arrow.setWorldPosition(actorPos.x + this.dir.x * dist, arrowY, actorPos.z + this.dir.z * dist);
        // 用世界欧拉角设置朝向：主角旋转(转身)不影响箭头，箭头尖始终指向终点方向
        arrow.setWorldRotationFromEuler(0, yaw, 0);
      } else {
        arrow.active = false;
      }
    }
  }

  /** 同步3D箭头显隐：只显示当前指引节点下的3D箭头，受 is3DEnable 和 isPause 控制 */
  sync3DArrowState() {
    if (!this.arrow3DPrefab) return;
    let shouldShow = false;
    for (let i = 0; i < this.arrow3DNodes.length; i++) {
      let arrow3D = this.arrow3DNodes[i];
      if (!arrow3D) continue;
      // 显示条件：启用3D + 非暂停 + 索引匹配 + 指引节点有效
      shouldShow =
        this.is3DEnable && !this.isPause && i === this.curIndex && i >= 0 && i < this.guideNodes.length && !!this.guideNodes[i];
      if (arrow3D.active !== shouldShow) {
        arrow3D.active = shouldShow;
      }
    }
    // if (this.isChange) {
      if (this.curNode != null) {
        shouldShow = this.is3DEnable && !this.isPause;
        // if (shouldShow == true) this.curNode3DArrowAni.play("jianTou");
        // else this.curNode3DArrowAni.stop();
        this.curNode3DArrow.worldPosition = new Vec3(this.curNode.worldPosition.x, this.curPosY, this.curNode.worldPosition.z);
        this.curNode3DArrow.active = shouldShow;
      } else {
        this.curNode3DArrowAni.stop();
        this.curNode3DArrow.active = false;
      }
    // }
  }

  //#region 设置2D箭头显示
  setArrowsActive(active: boolean) {
    for (let i = 0; i < this.arrowMax; i++) {
      let arrow = this.arrowNodes[i];
      if (arrow && arrow.active != active) arrow.active = active;
    }
  }

  //#region 销毁2D箭头
  onDestroy() {
    // 销毁2D箭头实例，防止内存泄漏
    this.arrowNodes.forEach((node) => node.destroy());
    this.arrowNodes = [];
    // 销毁3D箭头实例
    this.arrow3DNodes.forEach((node) => node.destroy());
    this.arrow3DNodes = [];
  }
}
