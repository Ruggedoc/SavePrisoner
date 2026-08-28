import {
  _decorator,
  Component,
  Node,
  view,
  screen,
  UITransform,
  Vec3,
  ResolutionPolicy,
  Camera,
  input,
  Input,
  Label,
  tween,
  ProgressBar,
  UIOpacity,
  Collider,
} from "cc";
import { GameGlobal } from "./GameGlobal";
import { AudioManager } from "./AudioManager";
import { PlayableSDK } from "./Tool/PlayableSDK";
import { PlayerAction } from "./Tool/PrintComponent";
import { Npc } from "./actor/Npc";
import { NpcFashion } from "./EnumDefine";
const { ccclass, property } = _decorator;

declare var window;

@ccclass("MainGame")
export class MainGame extends Component {
  public static mymain: MainGame;
  @property(Node)
  JoyStick: Node;

  @property(Node)
  effectLay: Node;
  @property(Camera)
  camera: Camera;
  @property(Node)
  coinNode: Node;
  @property(Node)
  endCardNode: Node;
  @property(Node)
  tiShiShou: Node;
  @property(Node)
  hpNode: Node;
  @property(Node)
  SprListNode: Node;
  @property(Node)
  KJMapNode: Node;
  @property(Node)
  GameOverUI: Node;
  @property(Collider)
  groundCollider: Collider;

  Pole: Node = null;
  Dish: Node = null;
  tiShiTimer: number = 0;
  isTiShi: boolean = true;
  isHeng: boolean = false;

  /** z.h 添加 */
  public mainNode: Node = null;
  public GamePosNode: Node = null;
  public mymoney = 0; //我的金钱
  public qianghpMax = 9999; //城墙血
  public qianghpNow = 9999; //城墙血

  public startCameraYDb: boolean = false; //镜头移动

  onLoad() {
    GameGlobal.mainGame = this;
    GameGlobal.mainCamera = this.camera;
    GameGlobal.effectLay = this.effectLay;
    GameGlobal.uiLay = this.node;

    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
  }

  start() {
    // this.GameOverUI.getComponent(GameOverUI).start();
    MainGame.mymain = this;
    this.mainNode = this.node.parent.getChildByName("main");
    this.GamePosNode = this.mainNode.getChildByName("GamePos");
    GameGlobal.builds = this.mainNode.getChildByName("builds");
    GameGlobal.home = GameGlobal.builds.getChildByName("Home");
    GameGlobal.ditieList = GameGlobal.builds.getChildByName("DiTie");
    GameGlobal.moneyFlyList = this.SprListNode.getChildByName("moneyFlyList");

    this.JoyStick.active = true;
    this.Pole = this.JoyStick.getChildByName("Pole");
    this.Dish = this.JoyStick.getChildByName("Dish");
    // Ht.initHt();
    AudioManager.musicPlay("bgm", true);
    view.on("canvas-resize", this.resize, this); //系统监听屏幕变化
    this.scheduleOnce(this.resize);

    PlayableSDK.onInteracted();

    if (window.setLoadingProgress) {
      window.setLoadingProgress(100);
    }
    // if(!this.YDcamerab){
    //     this.scheduleOnce(() => {
    //         this.mainNode.getChildByName("builds").getChildByName("jiagong").getChildByName("Canvas").getChildByName("Sprite").active = true;
    //         GameGlobal.CameraControl.cameraMove(this.mainNode.getChildByName("builds").getChildByName("jiagong"),()=>{
    //             this.YDcamerab = true;
    //             this.tiShiShou.active = true;
    //         });
    //     }, 1)
    // }

    // this.hpNode.angle = -45;//.setRotationFromEuler(v3(0,0,-45));
    // PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.WIRE_FRAME
    //     | EPhysicsDrawFlags.AABB
    //     | EPhysicsDrawFlags.CONSTRAINT;

    // GameGlobal.cameraMoving = true;

  }
  // public index = 0;
  // public buildlist: Node[] = [];
  // public PlayOverBuild() {
  //     if (this.index >= this.buildlist.length) {
  //         return;
  //     }
  //     let node = this.buildlist[this.index];
  //     node.active = true;
  //     this.index++;
  // }


  public updateMoney() {
    let baglength = GameGlobal.actor.bag2.children.length;
    // this.mymoney = this.mymoney + num;
    // if(this.mymoney < 0){
    //     this.mymoney = 0;
    // }
    this.coinNode.getChildByName("labCoin").getComponent(Label).string = "" + baglength * GameGlobal.iconValue;
  }

  public updateqiangHP() {
    let delhp = 2;
    this.qianghpNow = this.qianghpNow - delhp;
    let value = this.qianghpNow / this.qianghpMax;
    if (value < 0.05) {
      value = 0.05;
    }
    this.hpNode.getComponent(ProgressBar).progress = value;
  }

  public addKuojian() {
    this.mainNode.getChildByName("map").getChildByName("treeManager").getChildByName("石头").active = false;
    this.mainNode.getChildByName("map").getChildByName("treeManager").getChildByName("树-001").active = false;
    this.mainNode.getChildByName("map").getChildByName("weiqiang").getChildByName("qiang-003").active = false;
    this.mainNode.getChildByName("map").getChildByName("weiqiang").getChildByName("qiang-004").active = false;
    this.mainNode.getChildByName("KJmap").active = true;
    GameGlobal.actor.stopMove();
    this.Pole.setPosition(Vec3.ZERO);
    this.JoyStick.active = false;
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = true;
    // GameGlobal.CameraControl.cameraEnd();
  }

  public stopjoy() {
    GameGlobal.actor.stopMove();
    this.Pole.setPosition(Vec3.ZERO);
    this.JoyStick.active = false;
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = true;
  }

  public stopjoy2() {
    // GameGlobal.actor.stopMove();
    this.Pole.setPosition(Vec3.ZERO);
    this.JoyStick.active = false;
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = true;
  }

  resize(e?) {
    if (screen.windowSize.height > screen.windowSize.width && screen.windowSize.width / screen.windowSize.height < 1) {
      view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
      this.isHeng = false;
    } else {
      view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
      this.isHeng = true;
    }
    GameGlobal.CameraControl.cameraOnLoad();
    // BuyerManager.changeScale();
    // BuyerManager2.changeScale();
  }

  update(deltaTime: number) {
    if (GameGlobal.cameraMoving) {
      this.tiShiTimer = 0;
      return;
    }

    if (this.isTiShi) {
      this.tiShiTimer += deltaTime;
      if (this.tiShiTimer >= 3) {
        this.tiShiShou.active = true;
      }
    }
  }

  onEnd() {
    //游戏正式结束时调用
    PlayableSDK.download(PlayerAction.download);
  }

  // onEnd2() {
  //     //游戏正式结束时调用
  //     console.log("跳转商店");
  //     PlayableSDK.download();
  // }

  onTouchStart(event) {
    if (GameGlobal.isOver || GameGlobal.isStop || GameGlobal.cameraMoving) return;
    this.JoyStick.active = true;
    let pos_touch = event.getUILocation(); // 触摸点坐标@UI世界坐标系
    let uiTransform = this.node.getComponent(UITransform);
    let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(pos_touch.x, pos_touch.y, 0));
    this.JoyStick.setPosition(pos_nodeSpace);
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = false;
  }

  onTouchMove(event) {
    if (GameGlobal.isOver || GameGlobal.isStop || GameGlobal.cameraMoving) return;
    let pos_touch = event.getUILocation(); // 触摸点坐标@UI世界坐标系
    let uiTransform = this.JoyStick.getComponent(UITransform);
    let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(pos_touch.x, pos_touch.y, 0));
    // 判断极限位置
    let len = pos_nodeSpace.length(); // 自身坐标系的坐标
    let uiTransform2 = this.Dish.getComponent(UITransform); // 活动范围
    let maxLen = uiTransform2.width * 0.3;
    let ratio = len / maxLen;
    if (ratio > 1) {
      pos_nodeSpace.divide(new Vec3(ratio, ratio, 1));
    }
    this.Pole.setPosition(pos_nodeSpace);
    GameGlobal.actor.move(pos_nodeSpace.normalize());
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = false;
  }

  onTouchEnd() {
    if (GameGlobal.isOver || GameGlobal.isStop) return;
    this.JoyStick.active = false;
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = true;
    this.Pole.setPosition(Vec3.ZERO);
    GameGlobal.actor.stopMove();
  }

  onTouchCancel() {
    GameGlobal.actor.stopMove();
    this.Pole.setPosition(Vec3.ZERO);
    this.JoyStick.active = false;
    this.tiShiShou.active = false;
    this.tiShiTimer = 0;
    this.isTiShi = true;
  }

  changeGameState(state: number) {
    GameGlobal.state = state;
  }

  onShowGameOver() {
    this.GameOverUI.active = true;
    tween(this.GameOverUI)
      .to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) })
      .to(0.2, { scale: new Vec3(1, 1, 1) })
      .delay(2)
      .start();
    tween(this.GameOverUI.getComponent(UIOpacity)).to(0.2, { opacity: 255 }).start();
  }

  //#region 检查有没有浴巾囚犯
  getNpcByType() {
    let npcArr = this.SprListNode.getChildByName("npcList").children;
    if (npcArr.length > 0) {
      for (let i = 0; i < npcArr.length; i++) {
        let npcNode: Node = npcArr[i];
        if (npcNode != null && npcNode.components && npcNode.components.length > 0) {
          let npcSrc = npcNode.getComponent(Npc);
          if (npcSrc.currShowNpc == NpcFashion.towel) return true;
        }
      }
    }
    return false;
  }
}
