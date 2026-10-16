import { ccenum } from "cc";

/**
 * 角色状态
 */
export enum State_User {
  Idle = "idle",
  Move = "move",
  BaoIdle = "baoIdle",
  BaoMove = "baoMove",
  carStand = "carIdle",
  carMove = "carMove",
  throw = "throw",
  Jump = "jump",
  Jump2 = "jump2",
}

export enum NpcAniState {
  Idle = "idle",
  Move = "move",
  Attack = "attack",
  Death = "death",
  ice1 = "ice1",
  ice2 = "ice2",
}

export enum PlayerAniState {
  Idle = "idle",
  Move = "move",
}

export enum Stateworker {
  Stand = "stand",
  Move = "move",
  Work = "work",
}

export enum StateEvent {
  RunEnd = "RunEnd",
  DieEnd = "DieEnd",
}

export enum UpSkillType {
  Attack = 1,
  SkillTime = 2,
}

/**
 * 怪物状态 Z.H
 */
export enum StateSpr {
  idle = "idle",
  move = "move",
  attack = "attack",
  hit = "hit",
  Death = "death",
}

export enum MonsterState {
  idle,
  move,
  attack,
  hit,
  death,
}
/**NPC的行为状态机 */
export enum NpcState {
  Idle,
  Ice,
  move,
  findConterPos,
  coin,
  findBattlePos,
  findEnemy,
  attack,
  death,
}
/**NPC的工作步骤 */
export enum NpcWorkStage {
  ice,
  move,
  enterNpcList,
  waitList,
  toListFrist,
  payMoney,
  toBattle,
  findEnemy,
  battle,
  die,
}

export enum NpcFashion {
  ice,
  towel,
  equip,
}

export enum YDCheckType {
  /**踩NPC按钮完成 */
  YDNpcButton,
  /**搬NPC完成 */
  YDTakeNpc,
  /**去解冻完成 */
  YDThrow,
  /**买地贴完成 */
  YDBuyDiTie,
  /**柜台取金币完成 */
  YDEquipCounter,
  /**战斗地图取金币完成 */
  YDBattle,
  /**取金币完成（柜台和战斗地图都可以的情况） */
  YDMoney,
}

export enum YDIDType {
  /**第一步踩锤子按钮 */
  YDButton,
  /**第二步捡尸体 */
  YDTakeNpc2,
  /**第三步解冻尸体 */
  YDThrow3,
  /**第四步到柜台取金币 */
  YDConterMoney,
  /**第五步买锤子地贴 */
  YDBuyHummer,
  /**第六步踩锤子按钮 */
  YDButton6,
  /**第七步买车 */
  YDBuyCar,
  /**第八步捡尸体 */
  YDTakeNpc8,
  /**第九步解冻尸体 */
  YDThrow9,
  /**第十步买水池 */
  YDBuyWater,
  /**第十一步捡尸体 */
  YDTakeNpc11,
  /**第十二步引导去解冻尸体 */
  YDThrow12,
  /**第十三步解锁搬运工 */
  YDBuyFMPlayer,
  /**第十四步买扩建地贴 */
  YDBuyOver,
}

ccenum(UpSkillType);
