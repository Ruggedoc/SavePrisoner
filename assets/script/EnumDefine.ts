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
  die
}

export enum NpcFashion {
  ice,
  towel,
  equip,
}

ccenum(UpSkillType);
