import { _decorator, Component, Vec3, Node } from "cc";

const { ccclass, property } = _decorator;

export class ActorFlyAttribute {
  public moneyNode: Node;
  public startPos: Vec3 = new Vec3();
  public progress: number = 0;
}
