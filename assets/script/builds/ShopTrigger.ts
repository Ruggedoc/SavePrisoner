import {
  _decorator,
  BoxCollider,
  Component,
  game,
  Material,
  MeshRenderer,
  Node,
  RigidBody,
  tween,
  Vec3,
  Animation,
  v3,
} from "cc";
import { GameGlobal } from "../GameGlobal";
import { AudioManager } from "../AudioManager";
import { MainGame } from "../MainGame";
import { Moeny } from "./Moeny";
const { ccclass, property } = _decorator;

@ccclass("ShopTrigger")
export class ShopTrigger extends Component {
  @property(Node)
  colliderNode: Node;
  @property(Node)
  green: Node;
  @property(Node)
  icon: Node;
  @property(MeshRenderer)
  qianWei: MeshRenderer;
  @property(MeshRenderer)
  BaiWei: MeshRenderer;
  @property(MeshRenderer)
  ShiWei: MeshRenderer;
  @property(MeshRenderer)
  GeWei: MeshRenderer;
  @property(Material)
  scoreMaterialArr: Material[] = [];
  // @property(MeshRenderer)
  // @property(Prefab)
  // moneyfab: Prefab;
  // @property(Node)
  // bagListNode: Node;

  collider: BoxCollider;
  /**金币数 */
  num: number = 0;
  /**实际金钱 */
  currency: number = 0;
  maxNum: number = 0;
  playNum: number = 0;
  qianWeiScore: number;
  BaiWeiScore: number;
  ShiWeiScore: number;
  GeWeiScore: number;
  isMoveToDiTie: boolean = false;
  putTime = 0;
  ADD_TIME = 250;
  initNum: number = 0;
  isFirst2: boolean = true;
  anim: Animation;
  isFirst1: boolean = true;

  FamuNumScore: number = 0;
  FamuMaxScore: number = 3;

  YunNumScore: number = 0;
  YunMaxScore: number = 2;

  // public famuValue: number[] = [20, 30, 40];
  // public yunValue: number[] = [50, 60];
  public buyKuozhan = 100;

  start() {
    this.collider = this.colliderNode.getComponent(BoxCollider);
    this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
    this.collider.on("onTriggerStay", this.onTriggerStay, this);
    this.collider.on("onTriggerExit", this.onTriggerExit, this);
    this.init();
    this.anim = this.node.getComponent(Animation);
  }

  update(dt) {
    // 数字增长动画
    if (this.playNum != this.num) {
      let d = this.num - this.playNum;
      if (Math.abs(d) < 2) {
        this.playNum = this.num;
      } else {
        dt = dt * 1000;
        let t = this.putTime + this.ADD_TIME - game.totalTime;
        if (Math.abs(t) <= dt) {
          this.playNum = this.num;
        } else {
          let sr = t / dt;
          let dr = Math.round(d / sr);
          this.playNum += dr;
        }
        if (this.playNum < 0) this.playNum = this.num;
      }
      this.qianWeiScore = Math.floor((this.playNum / 1000) % 10);
      this.BaiWeiScore = Math.floor((this.playNum / 100) % 10);
      this.ShiWeiScore = Math.floor((this.playNum / 10) % 10);
      this.GeWeiScore = Math.floor(this.playNum % 10);

      this.qianWei.node.setPosition(-2, 0, 5);
      this.BaiWei.node.setPosition(0.5, 0, 5);
      this.ShiWei.node.setPosition(3, 0, 5);
      this.GeWei.node.setPosition(5.5, 0, 5);
      if (this.qianWeiScore == 0) {
        this.qianWei.node.active = false;
        this.BaiWei.node.setPosition(-0.85, 0, 5);
        this.ShiWei.node.setPosition(1.65, 0, 5);
        this.GeWei.node.setPosition(4.15, 0, 5);
        if (this.BaiWeiScore == 0) {
          this.BaiWei.node.active = false;
          this.ShiWei.node.setPosition(0.5, 0, 5);
          this.GeWei.node.setPosition(3, 0, 5);
          if (this.ShiWeiScore == 0) {
            this.ShiWei.node.active = false;
            this.GeWei.node.setPosition(1.5, 0, 5);
          }
        }
      }
      this.updateScore(this.qianWeiScore, this.qianWei);
      this.updateScore(this.BaiWeiScore, this.BaiWei);
      this.updateScore(this.ShiWeiScore, this.ShiWei);
      this.updateScore(this.GeWeiScore, this.GeWei);
    }
  }

  protected onEnable(): void {
    this.node.getChildByName("Node").scale = Vec3.ZERO;
    tween(this.node.getChildByName("Node"))
      .to(0.15, { scale: v3(0.384, 1.2, 0.384) })
      .to(0.1, { scale: v3(0.288, 0.9, 0.288) })
      .to(0.05, { scale: v3(0.32, 1, 0.32) })
      .start();
  }

  onTriggerEnter(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.isMoveToDiTie = true;
      this.moveToDiTie();
      // this.node.getChildByName("Node").getChildByName("miaobian_g").active =
      //   true;
      // this.node.getChildByName("Node").getChildByName("miaobian_b").active =
      //   false;
    }
  }

  onTriggerStay(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      if (!this.isMoveToDiTie) {
        this.isMoveToDiTie = true;
        this.moveToDiTie();
      }
    }
  }

  onTriggerExit(self) {
    let body: RigidBody = self.otherCollider.node.getComponent(RigidBody);
    if (body.getGroup() == 1) {
      this.isMoveToDiTie = false;
      // this.node.getChildByName("Node").getChildByName("miaobian_g").active =
      //   false;
      // this.node.getChildByName("Node").getChildByName("miaobian_b").active =
      //   true;
    }
  }

  init() {
    if (this.node.name == "buyHummer") {
      this.num = GameGlobal.buyIceNumMoney * GameGlobal.iconValue;
      this.currency = this.num * GameGlobal.iconValue;
      this.maxNum = GameGlobal.buyIceNumMoney * GameGlobal.iconValue;
      this.playNum = GameGlobal.buyIceNumMoney * GameGlobal.iconValue;
    } else if (this.node.name == "buyCar") {
      this.num = GameGlobal.buyCarMoney * GameGlobal.iconValue;
      this.currency = this.num * GameGlobal.iconValue;
      this.maxNum = GameGlobal.buyCarMoney * GameGlobal.iconValue;
      this.playNum = GameGlobal.buyCarMoney * GameGlobal.iconValue;
    } else if (this.node.name == "buyBigPool") {
      this.num = GameGlobal.buyPoolMoney * GameGlobal.iconValue;
      this.currency = this.num * GameGlobal.iconValue;
      this.maxNum = GameGlobal.buyPoolMoney * GameGlobal.iconValue;
      this.playNum = GameGlobal.buyPoolMoney * GameGlobal.iconValue;
    } else if (this.node.name == "buyNpc") {
      this.num = GameGlobal.buyEPlayerMoney * GameGlobal.iconValue;
      this.currency = this.num * GameGlobal.iconValue;
      this.maxNum = GameGlobal.buyEPlayerMoney * GameGlobal.iconValue;
      this.playNum = GameGlobal.buyEPlayerMoney * GameGlobal.iconValue;
    } else if (this.node.name == "buyOver") {
      this.num = GameGlobal.buyNewMapMoney * GameGlobal.iconValue;
      this.currency = this.num * GameGlobal.iconValue;
      this.maxNum = GameGlobal.buyNewMapMoney * GameGlobal.iconValue;
      this.playNum = GameGlobal.buyNewMapMoney * GameGlobal.iconValue;
    }
    this.isFirst1 = true;
    this.isMoveToDiTie = false;

    this.updateCoinNum1(0);
  }

  initLv() {
    this.isFirst1 = true;
    this.isMoveToDiTie = false;
    this.updateCoinNum1(0);
  }

  public onNodeOpen() {
    if (this.node.name == "buyHummer") {
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("hummerOpenPos");
      GameGlobal.CameraControl.cameraMoveToPosPingPong(muNode, () => {
        this.node.active = true;
        this.init();
      });
      GameGlobal.nextBuyDitie = this.node;
      // GameGlobal.nextBuyPrice = GameGlobal.buyIceNumMoney;
    } else if (this.node.name == "buyCar") {
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("carOpenPos");
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          this.node.active = true;
          this.init();
          this.scheduleOnce(() => {
            GameGlobal.CameraControl.cameraMoveToActor(0.5);
          }, 0.8);
        },
        0.7,
      );
      GameGlobal.nextBuyDitie = this.node;
      // GameGlobal.nextBuyPrice = GameGlobal.buyCarMoney;
    } else if (this.node.name == "buyBigPool") {
      this.init();
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("waterPool2");
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          this.node.active = true;
          this.init();
          this.scheduleOnce(() => {
            GameGlobal.CameraControl.cameraMoveToActor(0.5);
          }, 0.8);
        },
        0.7,
      );
      GameGlobal.nextBuyDitie = this.node;
      // GameGlobal.nextBuyPrice = GameGlobal.buyPoolMoney;
    } else if (this.node.name == "buyNpc") {
      this.init();
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("npcOpenPos");
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          this.node.active = true;
          this.init();
          this.scheduleOnce(() => {
            GameGlobal.CameraControl.cameraMoveToActor(0.5);
          }, 0.8);
        },
        0.7,
      );
      GameGlobal.nextBuyDitie = this.node;
      // GameGlobal.nextBuyPrice = GameGlobal.buyEPlayerMoney;
    } else if (this.node.name == "buyOver") {
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("overOpenPos");
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          this.node.active = true;
          this.init();
          this.scheduleOnce(() => {
            GameGlobal.CameraControl.cameraMoveToActor(0.5);
          }, 0.8);
        },
        0.7,
      );
      GameGlobal.nextBuyDitie = this.node;
      // GameGlobal.nextBuyPrice = GameGlobal.buyNewMapMoney;
    }
    this.isFirst1 = true;
    this.isMoveToDiTie = false;
    this.updateCoinNum1(0);
  }

  updateCoinNum1(coin: number) {
    this.num -= coin;
    this.currency = this.num;
    this.putTime = game.totalTime;

    this.qianWeiScore = Math.floor((this.currency / 1000) % 10);
    this.BaiWeiScore = Math.floor((this.currency / 100) % 10);
    this.ShiWeiScore = Math.floor((this.currency / 10) % 10);
    this.GeWeiScore = Math.floor(this.currency % 10);
    this.updateScore(this.qianWeiScore, this.qianWei);
    this.updateScore(this.BaiWeiScore, this.BaiWei);
    this.updateScore(this.ShiWeiScore, this.ShiWei);
    this.updateScore(this.GeWeiScore, this.GeWei);

    this.qianWei.node.active = true;
    this.BaiWei.node.active = true;
    this.ShiWei.node.active = true;
    this.GeWei.node.active = true;

    this.qianWei.node.setPosition(-2, 0, 5);
    this.BaiWei.node.setPosition(0.5, 0, 5);
    this.ShiWei.node.setPosition(3, 0, 5);
    this.GeWei.node.setPosition(5.5, 0, 5);
    if (this.qianWeiScore == 0) {
      this.qianWei.node.active = false;
      this.BaiWei.node.setPosition(-0.85, 0, 5);
      this.ShiWei.node.setPosition(1.65, 0, 5);
      this.GeWei.node.setPosition(4.15, 0, 5);
      if (this.BaiWeiScore == 0) {
        this.BaiWei.node.active = false;
        this.ShiWei.node.setPosition(0.5, 0, 5);
        this.GeWei.node.setPosition(3, 0, 5);
        if (this.ShiWeiScore == 0) {
          this.ShiWei.node.active = false;
          this.GeWei.node.setPosition(1.5, 0, 5);
        }
      }
    }

    let scale = this.num / this.maxNum;
    this.green.setScale(0.45, 1, 0.45 * (1 - scale));
    this.green.setPosition(0, 0, 2.2 * scale);
  }

  updateCoinNum(coin: number) {
    this.num -= coin;
    this.putTime = game.totalTime;
    if (this.num <= 0) this.num = 0;
    let scale = this.num / this.maxNum;
    if (scale <= 0) scale = 0;
    this.green.setScale(0.45, 1, 0.45 * (1 - scale));
    this.green.setPosition(0, 0.02, 2.2 * scale);
  }

  moveToDiTie() {
    if (!this.isMoveToDiTie) return;
    if (this.num <= 0) {
      if (!this.isFirst1) return;
      this.isFirst1 = false;
      this.finish();
      AudioManager.soundPlay("dtShow");
      return;
    }
    let baglength = GameGlobal.actor.bag2.children.length;
    if (baglength <= 0) {
      return;
    }
    // if (GameGlobal.yindao.ydid == 5) {
    //   GameGlobal.yindao.ydid = 6;
    //   GameGlobal.yindao.updateYD();
    // }
    AudioManager.soundPlay("moneyFly");
    let moneyNode = GameGlobal.actor.bag2.children[baglength - 1];
    let worldPos = moneyNode.worldPosition.clone();
    moneyNode.setParent(this.node);
    moneyNode.setWorldPosition(worldPos);
    moneyNode.setWorldRotationFromEuler(0, 0, 0);
    moneyNode.setWorldScale(new Vec3(0.7, 0.7, 0.7));
    MainGame.mymain.updateMoney();
    GameGlobal.coinNumber.subCoin(GameGlobal.iconValue);
    this.updateCoinNum(GameGlobal.iconValue);
    let money = moneyNode.getComponent(Moeny);
    money.moveToPos(true, Vec3.ZERO, 0.3, new Vec3(0, 3, 0), () => {
      // this.open();
      moneyNode.destroy();
    });
    this.scheduleOnce(() => {
      this.moveToDiTie();
    }, 0.02);
  }

  public finish() {
    GameGlobal.actor.stopMove();
    if (this.node.name == "buyHummer") {
      this.playClose(() => {
        this.node.active = false;
      });
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("hummerPos");
      GameGlobal.CameraControl.cameraMove2(muNode, () => {
        GameGlobal.curIceNumStage = 3;
        GameGlobal.iceBoxList.openAllHummer();
        let buyCarNode: Node = GameGlobal.ditieList.getChildByName("buyCar");
        // buyCarNode.active = true;
        let src = buyCarNode.getComponent(ShopTrigger);
        this.scheduleOnce(() => {
          src.onNodeOpen();
        }, 0.8);
      });
    } else if (this.node.name == "buyCar") {
      this.playClose(() => {
        this.node.active = false;
      });
      GameGlobal.actor.onChangeCarState(true);
      GameGlobal.bOpenCar = true;
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("waterPool1");
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          let buyPoolNode: Node = GameGlobal.ditieList.getChildByName("buyBigPool");
          let src = buyPoolNode.getComponent(ShopTrigger);
          this.scheduleOnce(() => {
            src.onNodeOpen();
          }, 0.8);
        },
        0.7,
      );
    } else if (this.node.name == "buyBigPool") {
      this.playClose(() => {
        this.node.active = false;
      });
      GameGlobal.poolAni = true;
      GameGlobal.watarRoom.onPoolOpen();
      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("waterPool1");
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          let buyPoolNode: Node = GameGlobal.ditieList.getChildByName("buyNpc");
          // buyPoolNode.active = true;
          let src = buyPoolNode.getComponent(ShopTrigger);
          this.scheduleOnce(() => {
            src.onNodeOpen();
            GameGlobal.poolAni = false;
          }, 0.8);
        },
        0.7,
      );
    } else if (this.node.name == "buyNpc") {
      this.playClose(() => {
        this.node.active = false;
      });

      let muNode = MainGame.mymain.mainNode.getChildByName("GamePos").getChildByName("npcCreatePos");
      // let muNode = MainGame.mymain.SprListNode.getChildByName("playerList").children[0];
      GameGlobal.CameraControl.cameraMove2(
        muNode,
        () => {
          GameGlobal.actor.addFMPlayer();
          // let buyPoolNode: Node = GameGlobal.ditieList.getChildByName("buyOver");
          // // buyPoolNode.active = true;
          // let src = buyPoolNode.getComponent(ShopTrigger);
          // this.scheduleOnce(() => {
          //   src.onNodeOpen();
          // }, 0.8);
        },
        0.5,
      );
    } else if (this.node.name == "buyOver") {
      this.playClose(() => {
        this.node.active = false;
      });

      GameGlobal.CameraControl.cameraEnd2(() => {
        tween(GameGlobal.mainGame.mainNode)
          .repeatForever(
            tween(GameGlobal.mainGame.mainNode)
              .by(50, { eulerAngles: v3(0, 360, 0) })
              .call(() => {
                GameGlobal.mainGame.mainNode.eulerAngles = Vec3.ZERO;
              }),
          )
          .start();
        // GameGlobal.CameraControl.cameraEnd2(() => {
        //   tween(GameGlobal.mainGame.mainNode)
        //     .to(50, { eulerAngles: v3(0, 90, 0) })
        //     .call(() => {
        //       GameGlobal.mainGame.mainNode.eulerAngles = Vec3.ZERO;
        //     })
        //     .start();
        GameGlobal.mainGame.onShowGameOver();
        GameGlobal.CameraControl.cameraEnd();
        GameGlobal.isStop = true;
        GameGlobal.isOver = true;
        AudioManager.musicStop();
      });
    }
  }

  public index = 0;
  public buildlist: Node[] = [];
  public PlayOverBuild() {
    if (this.index >= this.buildlist.length) {
      GameGlobal.CameraControl.cameraEnd();
      return;
    }
    let node = this.buildlist[this.index];
    node.active = true;
    this.index++;
  }

  updateScore(a: number, b: MeshRenderer) {
    b.material = this.scoreMaterialArr[a];
  }

  diTieMove() {
    let initScale = this.node.scale.clone();
    let targetScale = initScale.clone().multiplyScalar(1.1);
    tween(this.node)
      .repeatForever(
        tween(this.node)
          .to(0.8, { scale: targetScale }, { easing: "quadInOut" })
          .to(0.8, { scale: initScale }, { easing: "quadInOut" }),
      )
      .start();
  }

  playClose(callback?) {
    let initScale = this.node.scale.clone();
    let targetScale = initScale.clone().multiplyScalar(1.2);
    // this.node.getChildByName("Node").getChildByName("hei").active = false;
    tween(this.node)
      .to(0.3, { scale: targetScale }, { easing: "quadInOut" })
      .to(0.1, { scale: Vec3.ZERO }, { easing: "quadInOut" })
      .call(() => {
        callback && callback();
      })
      .start();
  }

  open() {
    if (!this.node) {
      return;
    }
    // this.anim.play();
    if (this.num > 0) {
      return;
    }
    if (this.node.name == "LvHeroDiTie") {
    }
  }
}
