import { _decorator, Component, math, Node, Animation, v3, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { ShopTrigger } from "./ShopTrigger";
import { YDCheckType, YDIDType } from "../EnumDefine";
const { ccclass, property } = _decorator;

@ccclass("YinDao")
export class YinDao extends Component {
  @property(Node)
  public yd: Node[] = []; //0踩锤子按钮 1踩锤子地贴 2解冻尸体 3柜台拿钱 4野外拿钱

  public target_YD_Node: Node;
  public initb = false;
  public ydid = 0;

  public timeDown = 0;
  public time = 1;

  public isAuto = false;
  /**
   * 当前引导步骤Id
   */
  public curYDId = 0;

  public YDChangeCd = 1;

  afterIsMoney: boolean = false;

  ydTargetCdTimer: number = 999;

  /**
   * 当前引导步骤是否完成
   */
  public bCheckOnce = true;

  public curYDType = 0;
  public curBuyDTStage = 0;
  public isFirstDitieShow: boolean = true;
  public curAutoTag: number = 0; //1柜台 2野外 3踩NPC按钮 4搬运人 5解冻人

  onLoad() {
    GameGlobal.yindao = this;
  }

  init() {
    this.target_YD_Node = this.yd[0];
    this.initb = true;
    this.ydid = 0;

    //第一步踩锤子按钮
    //第二步捡尸体
    //第三步解冻尸体
    //第四步柜台拿钱
    //第五步钱够去地贴，钱不够去野外
    //第六步引导去踩锤子地贴
    //第七步买车
    //第八步引导去捡尸体
    //第九步引导去解冻尸体
    //第十步引导解锁大水池
    //第十一步引导去捡尸体+解冻尸体
    //第十二步引导去解锁Npc
  }

  update(deltaTime: number) {
    // if (!this.initb) {
    //   return;
    // }
    // this.updateYD();
  }

  lateUpdate(deltaTime: number) {
    // if (this.isAuto) {
    // this.updateAutoYD();
    // } else {
    this.updateAutoYD();
    this.updateManualYD2();

    if (this.target_YD_Node == this.yd[3]) {
      let curlen = GameGlobal.equipConter.getYDReallyMoney();
      if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
      let tray = 1.5 + curlen * 0.084;
      GameGlobal.jianTou2DGuide.set3DArrowPosY(tray);
    }
    // }
  }

  updateAutoYD() {
    if (this.curAutoTag == 0) return;
    if (this.curAutoTag == 1) {
      //柜台
      if (GameGlobal.equipConter.getYDReallyMoney() > 0) return;
      this.curAutoTag = 0;
      this.bCheckOnce = true;
    } else if (this.curAutoTag == 2) {
      //野外
      if (GameGlobal.actor.PropListNode.children.length > 0) return;
      this.curAutoTag = 0;
      this.bCheckOnce = true;
    } else if (this.curAutoTag == 3) {
      //锤子
      if (GameGlobal.iceBoxList.bodyList.children.length <= 0) return;
      this.curAutoTag = 0;
      this.bCheckOnce = true;
    } else if (this.curAutoTag == 4) {
      //搬人
      if (!GameGlobal.actor.getIsTakeNpc()) return;
      this.curAutoTag = 0;
      this.bCheckOnce = true;
    } else if (this.curAutoTag == 5) {
      //解冻
      if (GameGlobal.actor.getIsTakeNpc()) return;
      this.curAutoTag = 0;
      this.bCheckOnce = true;
    }
  }

  //#region 修改为全部强引导
  updateManualYD2() {
    if (!this.bCheckOnce) return;
    if (this.curYDId == YDIDType.YDButton) {
      //第一步踩锤子按钮
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.bCheckOnce = false;
      this.target_YD_Node = this.yd[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == YDIDType.YDTakeNpc2) {
      //第二步捡尸体
      this.bCheckOnce = false;
      this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == YDIDType.YDThrow3) {
      //第三步解冻尸体
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.bCheckOnce = false;
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == YDIDType.YDConterMoney) {
      //第四步柜台拿钱
      if (GameGlobal.equipConter.getYDReallyMoney() > 0) {
        this.bCheckOnce = false;
        this.target_YD_Node = this.yd[3];
        let curlen = GameGlobal.equipConter.getYDReallyMoney();
        if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
        let tray = 1.5 + curlen * 0.084;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
      } else {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      }
    } else if (this.curYDId == YDIDType.YDBuyHummer) {
      //第五步钱够去地贴，钱不够去野外
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      const ditiePrice1 = GameGlobal.ditieList.getChildByName("buyHummer").getComponent(ShopTrigger).num / 10;
      if (ditiePrice1 == 0) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice1) {
        //钱够
        this.bCheckOnce = false;
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("hummerOpenPos");
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //钱不够
        this.onNoYDNode2();
        return;
      }
    } else if (this.curYDId == YDIDType.YDButton6) {
      //第六步引导去踩锤子地贴
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.bCheckOnce = false;
      if (GameGlobal.actor.getIsTakeNpc2()) {
        this.target_YD_Node = this.yd[2];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.target_YD_Node = this.yd[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == YDIDType.YDBuyCar) {
      //第七步买车
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.isPayDiTie) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      const ditiePrice2 = GameGlobal.ditieList.getChildByName("buyCar").getComponent(ShopTrigger).num / 10;
      if (ditiePrice2 == 0) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice2) {
        //钱够
        this.bCheckOnce = false;
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("carOpenPos");
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //有钱了
        if (GameGlobal.actor.onGetBag2ReallyCount() > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.getBuyDTMoney() ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.bCheckOnce = false;
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("carOpenPos");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
        //钱不够
        this.onNoYDNode2();
        return;
      }
    } else if (this.curYDId == YDIDType.YDTakeNpc8) {
      //第八步引导去捡尸体
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.getIsTakeNpc3()) {
        //小车满了
        this.curYDId = 8;
        return;
      } else {
        //小车没满
        if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
          //有生成好的冰人尸体
          this.bCheckOnce = false;
          this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        } else {
          //没有生成好的冰人尸体，去踩锤子按钮
          if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
            this.bCheckOnce = false;
            this.target_YD_Node = this.yd[0];
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
      }
    } else if (this.curYDId == YDIDType.YDThrow9) {
      //第九步引导去解冻尸体
      this.bCheckOnce = false;
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == YDIDType.YDBuyWater) {
      //第十步引导解锁大水池
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      const ditiePrice3 = GameGlobal.ditieList.getChildByName("buyBigPool").getComponent(ShopTrigger).num / 10;
      if (ditiePrice3 == 0) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice3) {
        //钱够
        this.bCheckOnce = false;
        let newTarget = GameGlobal.mainGame.GamePosNode.getChildByName("waterPool2");
        this.target_YD_Node = newTarget;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //有钱了
        if (GameGlobal.actor.onGetBag2ReallyCount() > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.getBuyDTMoney() ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.bCheckOnce = false;
            let newTarget = GameGlobal.mainGame.GamePosNode.getChildByName("waterPool2");
            this.target_YD_Node = newTarget;
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }

        //钱不够
        this.onNoYDNode2();
        return;
      }
    } else if (this.curYDId == YDIDType.YDTakeNpc11) {
      //第十一步引导去捡尸体
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.getIsTakeNpc3()) {
        //小车满了
        this.curYDId = 11;
        return;
      } else {
        //小车没满
        if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
          //有生成好的冰人尸体
          this.bCheckOnce = false;
          this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        } else {
          //没有生成好的冰人尸体，去踩锤子按钮
          if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
            this.bCheckOnce = false;
            this.target_YD_Node = this.yd[0];
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
      }
    } else if (this.curYDId == YDIDType.YDThrow12) {
      //第十二步引导去解冻尸体
      this.bCheckOnce = false;
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == YDIDType.YDBuyFMPlayer) {
      //第十三步解锁搬运工
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      const ditiePrice4 = GameGlobal.ditieList.getChildByName("buyNpc").getComponent(ShopTrigger).num / 10;
      if (ditiePrice4 == 0) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice4) {
        //钱够
        this.bCheckOnce = false;
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("npcOpenPos");
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //有钱了
        if (GameGlobal.actor.bag2.children.length > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.getBuyDTMoney() ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.bCheckOnce = false;
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("npcOpenPos");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
        //钱不够
        this.onNoYDNode2();
        return;
      }
    } else if (this.curYDId == YDIDType.YDBuyOver) {
      //第十四步买扩建地贴
      if (GameGlobal.cameraMoving) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      const ditiePrice5 = GameGlobal.ditieList.getChildByName("buyOver").getComponent(ShopTrigger).num / 10;
      if (ditiePrice5 == 0) {
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice5) {
        //钱够
        this.bCheckOnce = false;
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("overOpenPos");
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //有钱了
        if (GameGlobal.actor.bag2.children.length > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.getBuyDTMoney() ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.bCheckOnce = false;
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("overOpenPos");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
        //钱不够
        this.onNoYDNode2();
        return;
      }
    } else {
      console.log("没有满足条件" + this.curYDId);
    }
  }

  public onNoYDNode2() {
    //钱不够
    // if (this.target_YD_Node != null && this.curAutoTag != 0) return;
    if (this.curAutoTag == 1 && this.target_YD_Node == this.yd[3]) {
      if (GameGlobal.equipConter.getYDReallyMoney() > 0) {
        return;
      } else if (GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax) {
        return;
      }
    }
    if (this.curAutoTag == 2 && this.target_YD_Node == this.yd[4]) {
      if (GameGlobal.actor.PropListNode.children.length > 0) {
        return;
      } else if (GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax) {
        return;
      }
    }
    if (this.curAutoTag == 3 && this.target_YD_Node == this.yd[0]) return;
    if (this.curAutoTag == 4 && this.target_YD_Node == GameGlobal.iceBoxList.bodyList.children[0]) return;
    if (this.curAutoTag == 5 && this.target_YD_Node == this.yd[2]) return;
    if (GameGlobal.equipConter.getYDReallyMoney() > 0) {
      //柜台有钱
      this.bCheckOnce = false;
      this.curAutoTag = 1;
      this.target_YD_Node = this.yd[3];
      let curlen = GameGlobal.equipConter.getYDReallyMoney();
      if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
      let tray = 1.5 + curlen * 0.084;
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
      return;
    } else if (GameGlobal.actor.PropListNode.children.length > 0) {
      //野外有钱
      this.bCheckOnce = false;
      this.curAutoTag = 2;
      this.target_YD_Node = this.yd[4];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    } else {
      //没有钱
      //身上带着NPC,去解冻
      if (GameGlobal.actor.getIsTakeNpc()) {
        this.curAutoTag = 5;
        this.bCheckOnce = false;
        if (!GameGlobal.bOpenPool) {
          this.yd[2].worldPosition = GameGlobal.mainGame.GamePosNode.getChildByName("YDThrowNpc1").worldPosition.clone();
        } else {
          this.yd[2].worldPosition = GameGlobal.mainGame.GamePosNode.getChildByName("YDThrowNpc2").worldPosition.clone();
        }
        this.target_YD_Node = this.yd[2];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }

      if (GameGlobal.bPlayerOpen) {
        this.curAutoTag = 0;
        this.bCheckOnce = true;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      //捡NPC
      if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
        this.curAutoTag = 4;
        this.bCheckOnce = false;
        let newTarget = GameGlobal.iceBoxList.bodyList.children[0];
        this.target_YD_Node = newTarget;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      //去踩锤子按钮
      if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
        this.curAutoTag = 3;
        this.bCheckOnce = false;
        let newTarget: Node;
        if (GameGlobal.actor.getCarShowState()) newTarget = this.yd[0];
        else newTarget = this.yd[1];
        this.target_YD_Node = newTarget;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.bCheckOnce = true;
      this.target_YD_Node = null;
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    }
  }

  public YDRefresh(type: YDCheckType) {
    switch (type) {
      case YDCheckType.YDNpcButton:
        if (this.curYDId == YDIDType.YDButton) {
          this.curYDId = YDIDType.YDTakeNpc2;
        } else if (this.curYDId == YDIDType.YDButton6) {
          this.curYDId = YDIDType.YDBuyCar;
        }
        this.bCheckOnce = true;
        break;
      case YDCheckType.YDTakeNpc:
        if (GameGlobal.bOpenCar) {
          if (GameGlobal.YDCarOpen) {
            GameGlobal.YDCarThrowState = 1;
          }
          if (GameGlobal.YDPoolOpen) {
            GameGlobal.YDCarThrowState = 1;
          }
          if (this.curYDId == YDIDType.YDTakeNpc8) {
            this.curYDId = YDIDType.YDThrow9;
          }
          if (GameGlobal.actor.getCarShowState()) {
            if (GameGlobal.actor.getIsTakeNpc5() >= 0) {
              this.bCheckOnce = true;
            }
          }
        } else {
          if (this.curYDId == YDIDType.YDTakeNpc2) {
            this.curYDId = YDIDType.YDThrow3;
          }
          if (GameGlobal.actor.getIsTakeNpc2()) {
            this.bCheckOnce = true;
          }
        }
        break;
      case YDCheckType.YDThrow:
        if (this.curYDId == YDIDType.YDThrow3) {
          this.curYDId = YDIDType.YDConterMoney;
        } else if (this.curYDId == YDIDType.YDThrow9) {
          this.curYDId = YDIDType.YDBuyWater;
        } else if (this.curYDId == YDIDType.YDThrow12) {
          if (GameGlobal.bPlayerOpen) {
            this.curYDId = YDIDType.YDBuyOver;
          } else {
            this.curYDId = YDIDType.YDBuyFMPlayer;
          }
        }
        this.bCheckOnce = true;
        break;
      case YDCheckType.YDBuyDiTie:
        if (this.isFirstDitieShow) {
          this.bCheckOnce = true;
          return;
        }
        if (this.curYDId == YDIDType.YDBuyHummer) {
          this.curYDId = YDIDType.YDButton6;
          this.bCheckOnce = true;
          return;
        }

        if (this.curYDId == YDIDType.YDButton6 || this.curYDId == YDIDType.YDBuyCar) {
          this.curYDId = YDIDType.YDTakeNpc8;
          this.bCheckOnce = true;
          return;
        }
        if (this.curYDId == YDIDType.YDBuyWater) {
          if (GameGlobal.bPlayerOpen) {
            this.curYDId = YDIDType.YDBuyOver;
          } else {
            this.curYDId = YDIDType.YDTakeNpc11;
          }
          this.bCheckOnce = true;
          return;
        }
        if (this.curYDId == YDIDType.YDBuyFMPlayer) {
          this.curYDId = YDIDType.YDBuyOver;
          this.bCheckOnce = true;
          return;
        }
        break;
      case YDCheckType.YDEquipCounter:
        if (GameGlobal.actor.bag2.children.length >= GameGlobal.moneyBagMax) {
          this.bCheckOnce = true;
          return;
        }
        const buyDTMoney1 = this.getBuyDTMoney();
        if (GameGlobal.actor.onGetBag2ReallyCount() >= buyDTMoney1) {
          this.bCheckOnce = true;
        }
        if (this.curYDId == YDIDType.YDConterMoney) {
          this.curYDId = YDIDType.YDBuyHummer;
          this.bCheckOnce = true;
          return;
        }
        if (
          this.curYDId == YDIDType.YDBuyCar ||
          this.curYDId == YDIDType.YDBuyWater ||
          this.curYDId == YDIDType.YDBuyFMPlayer ||
          this.curYDId == YDIDType.YDBuyOver
        ) {
          this.bCheckOnce = true;
          return;
        }
        if (this.curAutoTag == 1 && this.target_YD_Node == this.yd[3]) {
          if (GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax) {
            this.curAutoTag = 0;
            this.bCheckOnce = true;
            return;
          }
          if (GameGlobal.equipConter.getYDReallyMoney() <= 0) {
            this.curAutoTag = 0;
            this.bCheckOnce = true;
            return;
          }
        }
        break;
      case YDCheckType.YDBattle:
        if (GameGlobal.actor.bag2.children.length >= GameGlobal.moneyBagMax) {
          this.bCheckOnce = true;
          return;
        }
        const buyDTMoney2 = this.getBuyDTMoney();
        if (GameGlobal.actor.bag2.children.length >= buyDTMoney2) {
          this.bCheckOnce = true;
        }
        if (GameGlobal.actor.PropListNode.children.length <= 0) {
          this.bCheckOnce = true;
        }
        if (this.curAutoTag == 2 && this.target_YD_Node == this.yd[4]) {
          if (GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax) {
            this.curAutoTag = 0;
            this.bCheckOnce = true;
            return;
          }
          if (GameGlobal.actor.PropListNode.children.length <= 0) {
            this.curAutoTag = 0;
            this.bCheckOnce = true;
            return;
          }
        }
        break;
      case YDCheckType.YDMoney:
        if (this.curYDId == YDIDType.YDConterMoney) {
          this.curYDId = YDIDType.YDBuyHummer;
        }
        this.bCheckOnce = true;
        break;
      case YDCheckType.GameOver:
        this.bCheckOnce = false;
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        break;
      default:
        break;
    }
  }

  public getBuyDTMoney(): number {
    if (this.curBuyDTStage == 0) {
      const diteNode = GameGlobal.ditieList.getChildByName("buyHummer");
      const shopTriggerSrc = diteNode.getComponent(ShopTrigger);
      if (diteNode.active != false && shopTriggerSrc.initFinish) {
        return shopTriggerSrc.num / 10;
      } else {
        return GameGlobal.buyHummerMoney1;
      }
    } else if (this.curBuyDTStage == 1) {
      const diteNode = GameGlobal.ditieList.getChildByName("buyCar");
      const shopTriggerSrc = diteNode.getComponent(ShopTrigger);
      if (diteNode.active != false && shopTriggerSrc.initFinish) {
        return shopTriggerSrc.num / 10;
      } else {
        return GameGlobal.buyHummerMoney1;
      }
    } else if (this.curBuyDTStage == 2) {
      const diteNode = GameGlobal.ditieList.getChildByName("buyBigPool");
      const shopTriggerSrc = diteNode.getComponent(ShopTrigger);
      if (diteNode.active != false && shopTriggerSrc.initFinish) {
        return shopTriggerSrc.num / 10;
      } else {
        return GameGlobal.buyHummerMoney1;
      }
    } else if (this.curBuyDTStage == 3) {
      const diteNode = GameGlobal.ditieList.getChildByName("buyNpc");
      const shopTriggerSrc = diteNode.getComponent(ShopTrigger);
      if (diteNode.active != false && shopTriggerSrc.initFinish) {
        return shopTriggerSrc.num / 10;
      } else {
        return GameGlobal.buyHummerMoney1;
      }
    } else if (this.curBuyDTStage == 4) {
      const diteNode = GameGlobal.ditieList.getChildByName("buyOver");
      const shopTriggerSrc = diteNode.getComponent(ShopTrigger);
      if (diteNode.active != false && shopTriggerSrc.initFinish) {
        return shopTriggerSrc.num / 10;
      } else {
        return GameGlobal.buyHummerMoney1;
      }
    }
  }
}
