import { _decorator, Component, Node, Quat, tween, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { Utils } from "../Utils";
const { ccclass, property } = _decorator;

const CFG = {
  speedMin: 3,
  speedMax: 6.5, // 水平飞行速度
  flyTimeMin: 0.35,
  flyTimeMax: 0.9, // 飞行时长(秒)
  gravityMin: -110,
  gravityMax: -80, // 上升段重力（负值，控制弧顶高度）
  gravityFallMultiplier: 3.5, // 下降段重力 = gravity × 此倍数（>1 则下落更快）
  landYMin: -0.7,
  landYMax: 0, // 落地 Y 轴高度随机区间（最终离地高度）
  landWaitMin: 0.1,
  landWaitMax: 0.3, // 落地后停留时间随机区间(秒)
  settleRotation: true, // true=飞行中旋转过渡，false=保持初始倾斜
  targetEulerXMin: -45,
  targetEulerXMax: 45, // 落地后 X 轴目标角度随机区间
  targetEulerZMin: -45,
  targetEulerZMax: 45, // 落地后 Z 轴目标角度随机区间
  rollTurnMin: 0.6,
  rollTurnMax: 0.6, // 飞行中自转圈数随机区间
  shrinkTime: 0.3, // 缩小消失时长(秒)
  popAmount: 0.1, // 放大比例（1.25倍）
  popPeak: 0.1, // 放大占比（0.3=前30%时间放大，后70%缩小）
  tiltXMin: 30,
  tiltXMax: 75, // 生成时 X 轴倾斜角度随机区间
  tiltZMin: 30,
  tiltZMax: 75, // 生成时 Z 轴倾斜角度随机区间
  frictionMin: 0.05,
  frictionMax: 0.1, // 水平阻力随机区间（0=匀速，越大减速越快）
  accelMin: 20,
  accelMax: 30, // 水平加速度随机区间（正值=飞出加速，负值=飞出减速）
};

interface FragmentData {
  node: Node;
  vx: number;
  vz: number;
  vy: number;
  gravity: number;
  gravityFall: number; // 下降段重力（= gravity × multiplier）
  vertexTime: number; // 到达弧顶的时间
  vertexY: number; // 弧顶 Y 坐标
  landY: number;
  landWait: number;
  friction: number;
  accelX: number;
  accelZ: number;
  startY: number;
  startScaleX: number;
  startScaleY: number;
  startScaleZ: number;
  startEulerX: number;
  startEulerZ: number; // 初始倾斜
  targetEulerX: number;
  targetEulerZ: number; // 落地目标角度（随机）
  elapsed: number;
  flyTime: number;
  shrinkTime: number;
}

@ccclass("IceBoxBreakAni")
export class IceBoxBreakAni extends Component {
  private _activeFragments: FragmentData[] = [];

  private scaleMin = 0.1;
  private scaleMax = 0.35;
  public randomShow(child: Node) {
    const randomIdx = Math.floor(Math.random() * 3);
    // child.getChildByName("碎冰1").active = randomIdx == 0;
    // child.getChildByName("碎冰2").active = randomIdx == 1;
    // child.getChildByName("碎冰3").active = randomIdx == 2;
    // child.getChildByName("碎冰4").active = randomIdx == 3;
    // child.getChildByName("碎冰5").active = randomIdx == 4;
    // child.getChildByName("碎冰6").active = randomIdx == 5;
    child.getChildByName("碎冰4").active = randomIdx == 0;
    child.getChildByName("碎冰5").active = randomIdx == 1;
    child.getChildByName("碎冰6").active = randomIdx == 2;
  }

  // public onPlayAni() {
  //   for (let i = 0; i < this.node.children.length; i++) {
  //     let child = this.node.children[i];
  //     child.active = true;
  //     this.randomShow(child);
  //     child.setPosition(0, 0, 0);

  //     // 初始缩放 & 朝向：X/Z 随机倾斜，Y 随机朝向
  //     let startScaleX = Utils.randomRange(this.scaleMin, this.scaleMax);
  //     let startScaleZ = startScaleX;
  //     let startScaleY = startScaleX;
  //     child.setScale(startScaleX, startScaleY, startScaleZ);

  //     const tiltX = (Math.random() > 0.5 ? 1 : -1) * Utils.randomRange(CFG.tiltXMin, CFG.tiltXMax);
  //     const tiltZ = (Math.random() > 0.5 ? 1 : -1) * Utils.randomRange(CFG.tiltZMin, CFG.tiltZMax);
  //     const rotY = Math.random() * 360;
  //     child.setRotationFromEuler(tiltX, rotY, tiltZ);

  //     // 水平：均分圆周方向，保证碎片向四面八方散开 + 随机速度
  //     const baseAngle = Math.random() * Math.PI * 2;
  //     const sectorAngle = (Math.PI * 2) / this.node.children.length;
  //     const angle = baseAngle + i * sectorAngle;
  //     const speed = Utils.randomRange(CFG.speedMin, CFG.speedMax);
  //     const vx = Math.cos(angle) * speed;
  //     const vz = Math.sin(angle) * speed;

  //     // 垂直：两段重力。上升段 arcHeight = vy²/(2|g|)，下降段用 g×multiplier 加速
  //     const flyTime = Utils.randomRange(CFG.flyTimeMin, CFG.flyTimeMax);
  //     const gravity = Utils.randomRange(CFG.gravityMin, CFG.gravityMax);
  //     const landY = Utils.randomRange(CFG.landYMin, CFG.landYMax);
  //     const vy = landY / flyTime - 0.5 * gravity * flyTime;
  //     const vertexTime = -vy / gravity;
  //     const vertexY = vy * vertexTime + 0.5 * gravity * vertexTime * vertexTime;
  //     const gravityFall = gravity * CFG.gravityFallMultiplier;
  //     const landWait = Utils.randomRange(CFG.landWaitMin, CFG.landWaitMax);
  //     const friction = Utils.randomRange(CFG.frictionMin, CFG.frictionMax);
  //     const accel = Utils.randomRange(CFG.accelMin, CFG.accelMax);
  //     const accelX = Math.cos(angle) * accel;
  //     const accelZ = Math.sin(angle) * accel;

  //     this._activeFragments.push({
  //       node: child,
  //       vx,
  //       vz,
  //       vy,
  //       gravity,
  //       gravityFall,
  //       vertexTime,
  //       vertexY,
  //       landY,
  //       landWait,
  //       friction,
  //       accelX,
  //       accelZ,
  //       startY: child.position.y,
  //       // startScaleX, startScaleY, startScaleZ,
  //       startScaleX,
  //       startScaleY,
  //       startScaleZ,
  //       startEulerX: tiltX,
  //       startEulerZ: tiltZ,
  //       targetEulerX: Utils.randomRange(CFG.targetEulerXMin, CFG.targetEulerXMax),
  //       targetEulerZ: Utils.randomRange(CFG.targetEulerZMin, CFG.targetEulerZMax),
  //       elapsed: 0,
  //       flyTime,
  //       shrinkTime: CFG.shrinkTime,
  //     });
  //   }
  // }
  public onPlayAni2() {
    for (let i = 0; i < this.node.children.length; i++) {
      let child = this.node.children[i];
      child.active = true;
      this.randomShow(child);
      child.setPosition(0, 0, 0);

      let startScaleX = Utils.randomRange(this.scaleMin, this.scaleMax);
      let startScaleZ = startScaleX;
      let startScaleY = startScaleX;
      child.setScale(startScaleX, startScaleY, startScaleZ);

      const tiltX = (Math.random() > 0.5 ? 1 : -1) * Utils.randomRange(CFG.tiltXMin, CFG.tiltXMax);
      const tiltZ = (Math.random() > 0.5 ? 1 : -1) * Utils.randomRange(CFG.tiltZMin, CFG.tiltZMax);
      const rotY = Math.random() * 360;
      child.setRotationFromEuler(tiltX, rotY, tiltZ);

      // 按角度均分方向，随机半径 3~5 取落点
      const baseAngle = Math.random() * Math.PI * 2;
      const sectorAngle = (Math.PI * 2) / this.node.children.length;
      const angle = baseAngle + i * sectorAngle;
      const radius = Utils.randomRange(4, 7);
      const landX = Math.cos(angle) * radius;
      const landZ = Math.sin(angle) * radius;

      // 抛物线参数：通过重力实现快→慢→快的速度曲线
      const flyTime = Utils.randomRange(CFG.flyTimeMin, CFG.flyTimeMax);
      const gravity = Utils.randomRange(CFG.gravityMin, CFG.gravityMax);
      const landY = Utils.randomRange(CFG.landYMin, CFG.landYMax);
      const vx = landX / flyTime;
      const vz = landZ / flyTime;
      const vy = (landY - 0.5 * gravity * flyTime * flyTime) / flyTime;
      const vertexTime = -vy / gravity;
      const vertexY = vy * vertexTime + 0.5 * gravity * vertexTime * vertexTime;
      const gravityFall = gravity * 0.8;
      const landWait = Utils.randomRange(CFG.landWaitMin, CFG.landWaitMax);

      this._activeFragments.push({
        node: child,
        vx,
        vz,
        vy,
        gravity,
        gravityFall,
        vertexTime,
        vertexY,
        landY,
        landWait,
        friction: 0,
        accelX: 0,
        accelZ: 0,
        startY: 0,
        startScaleX,
        startScaleY,
        startScaleZ,
        startEulerX: tiltX,
        startEulerZ: tiltZ,
        targetEulerX: tiltX + Math.sin(angle) * Utils.randomRange(CFG.rollTurnMin, CFG.rollTurnMax) * 360,
        targetEulerZ: tiltZ - Math.cos(angle) * Utils.randomRange(CFG.rollTurnMin, CFG.rollTurnMax) * 360,
        elapsed: 0,
        flyTime,
        shrinkTime: CFG.shrinkTime,
      });
    }
  }

  // public temp(){
  //     //参考这个按角度取随机点
  //     const baseAngle = Math.random() * Math.PI * 2;
  //     const sectorAngle = (Math.PI * 2) / this.node.children.length;
  //     const angle = baseAngle + i * sectorAngle;
  //     const speed = Utils.randomRange(CFG.speedMin, CFG.speedMax);
  //     const vx = Math.cos(angle) * speed;
  //     const vz = Math.sin(angle) * speed;
  // }

  update(deltaTime: number) {
    if (this._activeFragments.length === 0) return;
    for (let i = this._activeFragments.length - 1; i >= 0; i--) {
      const fd = this._activeFragments[i];
      fd.elapsed += deltaTime;

      // 水平速度衰减
      const fx = 1 - fd.friction * deltaTime;
      fd.vx *= fx > 0 ? fx : 0;
      fd.vz *= fx > 0 ? fx : 0;

      const isFlying = fd.elapsed < fd.flyTime;

      if (isFlying) {
        // === 飞行阶段：抛物线位移 + 逐步归零 ===
        const T = fd.elapsed;

        // 水平加速度（仅在飞行中）
        fd.vx += fd.accelX * deltaTime;
        fd.vz += fd.accelZ * deltaTime;

        const pos = fd.node.worldPosition;
        const newX = pos.x + fd.vx * deltaTime;
        const newZ = pos.z + fd.vz * deltaTime;
        let newY: number;
        if (T <= fd.vertexTime) {
          newY = fd.startY + fd.vy * T + 0.5 * fd.gravity * T * T;
        } else {
          const fallT = T - fd.vertexTime;
          newY = fd.vertexY + 0.5 * fd.gravityFall * fallT * fallT;
          if (newY < fd.landY) {
            newY = fd.landY;
            fd.elapsed = fd.flyTime;
          }
        }
        fd.node.setWorldPosition(newX, newY, newZ);

        // 旋转在飞行中逐步过渡到目标角度，落地时刚好到位
        if (CFG.settleRotation) {
          const t = fd.elapsed / fd.flyTime;
          const rx = fd.startEulerX + (fd.targetEulerX - fd.startEulerX) * t;
          const rz = fd.startEulerZ + (fd.targetEulerZ - fd.startEulerZ) * t;
          fd.node.setRotationFromEuler(rx, 0, rz);
        }

        // 飞行中保持原始大小
        fd.node.setScale(fd.startScaleX, fd.startScaleY, fd.startScaleZ);
      } else {
        // === 落地阶段 ===
        const landElapsed = fd.elapsed - fd.flyTime;

        // 停留等待
        if (landElapsed < fd.landWait) {
          if (CFG.settleRotation) {
            fd.node.setRotationFromEuler(fd.targetEulerX, 0, fd.targetEulerZ);
          }
          fd.node.setScale(fd.startScaleX, fd.startScaleY, fd.startScaleZ);
          continue;
        }

        // 先放大 → 再缩小消失
        const shrinkT = (landElapsed - fd.landWait) / fd.shrinkTime;
        if (shrinkT >= 1) {
          fd.node.active = false;
          this._activeFragments.splice(i, 1);
          continue;
        }

        if (CFG.settleRotation) {
          fd.node.setRotationFromEuler(fd.targetEulerX, 0, fd.targetEulerZ);
        }

        let scaleFactor: number;
        if (shrinkT < CFG.popPeak) {
          const popT = shrinkT / CFG.popPeak;
          scaleFactor = 1 + CFG.popAmount * popT;
        } else {
          const fadeT = (shrinkT - CFG.popPeak) / (1 - CFG.popPeak);
          scaleFactor = (1 + CFG.popAmount) * (1 - fadeT);
        }
        fd.node.setScale(fd.startScaleX * scaleFactor, fd.startScaleY * scaleFactor, fd.startScaleZ * scaleFactor);
      }
    }
  }
}