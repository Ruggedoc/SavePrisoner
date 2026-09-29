import { _decorator, Collider, Component, Node, RigidBody, tween, v3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { AudioManager } from "../AudioManager";
const { ccclass, property } = _decorator;

@ccclass("door")
export class door extends Component {
  @property(Node)
  door_b1: Node;
  @property(Node)
  door_b2: Node;

  opencollider1: Collider;
  opencollider2: Collider;

  public isopenb = false; //是否开着门
  public ispzb1 = false;
  public ispzb2 = false;

  public isDoorMap = false;

  start() {
    this.opencollider1 = this.node.getChildByName("enterPz").getComponent(Collider);
    this.opencollider2 = this.node.getChildByName("outPz").getComponent(Collider);
    this.opencollider1.on("onTriggerEnter", this.onTriggerEnter, this);
    // this.opencollider1.on("onTriggerStay", this.onTriggerStay, this);
    this.opencollider1.on("onTriggerExit", this.onTriggerExit, this);

    // this.opencollider2.on("onTriggerEnter", this.onTriggerEnter2, this);
    // this.opencollider2.on("onTriggerStay", this.onTriggerStay2, this);
    // this.opencollider2.on("onTriggerExit", this.onTriggerExit2, this);
  }

  // public checkTime = 1;
  // public timeDown = 0;
  update(deltaTime: number) {
    // this.timeDown += deltaTime;
    // if (this.timeDown < this.checkTime) return;
    // this.timeDown = 0;

    if (this.isopenb) {
      if (GameGlobal.actor.isattMap || this.isDoorMap) return;
      this.closeDoor();
    }
  }

  public open_wai() {
    if (!this.isopenb) {
      this.isopenb = true;
      tween(this.door_b1)
        .to(0.2, { eulerAngles: v3(0, 90, 0) })
        .start();
      tween(this.door_b2)
        .to(0.2, { eulerAngles: v3(0, -90, 0) })
        .start();
    }
  }

  public open_nei() {
    if (!this.isopenb) {
      this.isopenb = true;
      tween(this.door_b1)
        .to(0.2, { eulerAngles: v3(0, -90, 0) })
        .start();
      tween(this.door_b2)
        .to(0.2, { eulerAngles: v3(0, 90, 0) })
        .start();
    }
  }

  public closeDoor() {
    if (this.isopenb) {
      this.isopenb = false;
      tween(this.door_b1)
        .to(0.2, { eulerAngles: v3(0, 0, 0) })
        .start();
      tween(this.door_b2)
        .to(0.2, { eulerAngles: v3(0, 0, 0) })
        .start();
    }
  }

  onTriggerEnter(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    // if (body.node.name != "actorTrigger") return;

    if (body.getGroup() == 1 || body.getGroup() == 2 ** 6) {
      // this.ispzb1 = !this.ispzb1;
      this.isDoorMap = true;
      if (!this.isopenb) {
        if (body.getGroup() == 1) AudioManager.soundPlay("doorOpen");
        this.open_wai();
      }
      // if (this.ispzb1)
      // else this.closeDoor();
    }
  }

  // onTriggerStay(self) {
  //   let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
  //   if (body.getGroup() == 1 || body.getGroup() == 2 ** 6) {
  //     // this.ispzb1 = true;
  //     // this.open_wai();
  //   }
  // }
  onTriggerExit(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      if (body.node.name != "actorTrigger" || GameGlobal.actor.isattMap) return;
      this.isDoorMap = false;
      if (body.getGroup() == 1) AudioManager.soundPlay("doorClose");
      // this.ispzb1 = false;
      // if (!this.ispzb2) {
      // this.closeDoor();
      // }
    } else if (body.getGroup() == 2 ** 6) {
      this.isDoorMap = false;
    }
  }

  // onTriggerEnter2(self) {
  //   let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
  //   if (body.getGroup() == 1 || body.getGroup() == 2 ** 6) {
  //     this.ispzb2 = true;
  //     this.open_nei();
  //   }
  // }
  // onTriggerStay2(self) {
  //   let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
  //   if (body.getGroup() == 1 || body.getGroup() == 2 ** 6) {
  //     this.ispzb2 = true;
  //     this.open_nei();
  //   }
  // }
  // onTriggerExit2(self) {
  //   let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
  //   if (body.getGroup() == 1 || body.getGroup() == 2 ** 6) {
  //     this.ispzb2 = false;
  //     if (!this.ispzb1) {
  //       this.closeDoor();
  //     }
  //   }
  // }
}
