import { _decorator, Component, math, Node, Animation, v3, Vec3 } from "cc";
import { GameGlobal } from "../GameGlobal";
import { ShopTrigger } from "./ShopTrigger";
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
  public curBuyDTMoney = 0;

  public YDChangeCd = 1;

  afterIsMoney: boolean = false;

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
    this.updateManualYD(deltaTime);
    // }
  }

  //#region  更新自动引导目标
  updateAutoYD() {
    if (GameGlobal.YDHummerOpen) {
      if (!GameGlobal.YDCarOpen) {
        if (GameGlobal.actor.getIsTakeNpc2()) {
          this.target_YD_Node = this.yd[2];
        } else {
          this.target_YD_Node = this.yd[1];
        }
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      } else {
        GameGlobal.YDHummerOpen = false;
      }
    }
    //开启车、开启水池
    if (GameGlobal.YDCarOpen || GameGlobal.YDPoolOpen) {
      //捡NPC
      if (GameGlobal.YDCarThrowState == 0) {
        if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
          if (GameGlobal.actor.getIsTakeNpc3()) {
            GameGlobal.YDCarThrowState = 1;
            return;
          }
          this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        } else {
          //去踩锤子按钮
          if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
            this.target_YD_Node = this.yd[0];
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
      } else if (GameGlobal.YDCarThrowState == 1) {
        this.target_YD_Node = this.yd[2];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
    }
    //有钱
    if (GameGlobal.actor.bag2.children.length > 0) {
      if (GameGlobal.nextBuyDitie != null && GameGlobal.nextBuyDitie.active) {
        if (
          GameGlobal.actor.bag2.children.length >= GameGlobal.nextBuyDitie.getComponent(ShopTrigger).num / 10 ||
          GameGlobal.actor.bag2.children.length >= GameGlobal.moneyBagMax
        ) {
          this.target_YD_Node = GameGlobal.nextBuyDitie;
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        }
      }
    }

    //柜台有钱
    // if (GameGlobal.isFirstGetGold && (GameGlobal.mainGame.getNpcByType() || GameGlobal.watarRoom.pan.children.length > 0)) {
    //   this.target_YD_Node = this.yd[3];
    //   let tray = 1.3 + GameGlobal.equipConter.goldPos.children.length * 0.1;
    //   GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
    //   return;
    // } else {
    if (GameGlobal.equipConter.goldPos.children.length > 5) {
      this.target_YD_Node = this.yd[3];
      let curlen = GameGlobal.equipConter.goldPos.children.length;
      if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
      let tray = 1.5 + curlen * 0.084;
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
      return;
    }
    // }

    //野外地图有钱
    if (GameGlobal.actor.PropListNode.children.length > 0) {
      this.target_YD_Node = this.yd[4];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }

    //身上带着NPC
    if (GameGlobal.actor.getIsTakeNpc()) {
      if (!GameGlobal.bOpenPool) {
        this.yd[2].worldPosition = GameGlobal.mainGame.GamePosNode.getChildByName("YDThrowNpc1").worldPosition.clone();
      } else {
        this.yd[2].worldPosition = GameGlobal.mainGame.GamePosNode.getChildByName("YDThrowNpc2").worldPosition.clone();
      }
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }

    //捡NPC
    if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
      this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }
    //去踩锤子按钮
    if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
      if (GameGlobal.actor.getCarShowState()) this.target_YD_Node = this.yd[0];
      else this.target_YD_Node = this.yd[1];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    }
  }
  //#endregion

  //#region  更新手动引导目标
  updateManualYD(deltaTime: number) {
    if (this.curYDId == 0) {
      //第一步踩锤子按钮
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.target_YD_Node = this.yd[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 1) {
      //第二步捡尸体
      this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 2) {
      //第三步解冻尸体
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 3) {
      //第四步柜台拿钱
      if (GameGlobal.equipConter.goldPos.children.length > 0) {
        this.target_YD_Node = this.yd[3];
        let curlen = GameGlobal.equipConter.goldPos.children.length;
        if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
        let tray = 1.5 + curlen * 0.084;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
      } else {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      }
    } else if (this.curYDId == 4) {
      //第五步钱够去地贴，钱不够去野外
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.curBuyDTMoney = GameGlobal.buyHummerMoney1;
      const ditiePrice1 = GameGlobal.ditieList.getChildByName("buyHummer").getComponent(ShopTrigger).num / 10;
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice1) {
        //钱够
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("hummerOpenPos");
      } else {
        //钱不够
        this.onNoYDNode(deltaTime);
        return;
        // //??????????????????柜台和野外都有钱怎么处理？野外或者柜台几乎同时生成钱怎么办
        // if (GameGlobal.equipConter.goldPos.children.length > 0) {
        //   this.target_YD_Node = this.yd[3];
        // } else if (GameGlobal.actor.PropListNode.children.length > 0) {
        //   this.target_YD_Node = this.yd[4];
        // }
      }
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 5) {
      //第六步引导去踩锤子地贴
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.actor.getIsTakeNpc2()) {
        this.target_YD_Node = this.yd[2];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.target_YD_Node = this.yd[0];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 6) {
      //第七步买车
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      if (GameGlobal.isPayDiTie) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.curBuyDTMoney = GameGlobal.buyCarMoney;
      const ditiePrice2 = GameGlobal.ditieList.getChildByName("buyCar").getComponent(ShopTrigger).num / 10;
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice2) {
        //钱够
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("carOpenPos");
      } else {
        //有钱了
        if (GameGlobal.actor.onGetBag2ReallyCount() > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.curBuyDTMoney ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("carOpenPos");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }

        //钱不够
        this.onNoYDNode(deltaTime);
        return;
        // //??????????????????柜台和野外都有钱怎么处理？野外或者柜台几乎同时生成钱怎么办
        // if (GameGlobal.equipConter.goldPos.children.length > 0) {
        //   this.target_YD_Node = this.yd[3];
        // } else if (GameGlobal.actor.PropListNode.children.length > 0) {
        //   this.target_YD_Node = this.yd[4];
        // }
      }
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 7) {
      //第八步引导去捡尸体
      if (GameGlobal.cameraMoving) {
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
          this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        } else {
          //没有生成好的冰人尸体，去踩锤子按钮
          if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
            this.target_YD_Node = this.yd[0];
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
      }
    } else if (this.curYDId == 8) {
      //第九步引导去解冻尸体
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 9) {
      //第十步引导解锁大水池
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.curBuyDTMoney = GameGlobal.buyPoolMoney;
      const ditiePrice3 = GameGlobal.ditieList.getChildByName("buyBigPool").getComponent(ShopTrigger).num / 10;
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice3) {
        //钱够
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("waterPool2");
      } else {
        //有钱了
        if (GameGlobal.actor.onGetBag2ReallyCount() > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.curBuyDTMoney ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("waterPool2");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }

        //钱不够
        this.onNoYDNode(deltaTime);
        return;
        // //??????????????????柜台和野外都有钱怎么处理？野外或者柜台几乎同时生成钱怎么办
        // if (GameGlobal.equipConter.goldPos.children.length > 0) {
        //   this.target_YD_Node = this.yd[3];
        // } else if (GameGlobal.actor.PropListNode.children.length > 0) {
        //   this.target_YD_Node = this.yd[4];
        // }
      }
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 10) {
      //第十一步引导去捡尸体
      if (GameGlobal.cameraMoving) {
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
          this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
          GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
          return;
        } else {
          //没有生成好的冰人尸体，去踩锤子按钮
          if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
            this.target_YD_Node = this.yd[0];
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
      }
    } else if (this.curYDId == 11) {
      //第十一步引导去解冻尸体
      this.target_YD_Node = this.yd[2];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
    } else if (this.curYDId == 12) {
      //第十二步引导去解锁Npc
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.curBuyDTMoney = GameGlobal.buyEPlayerMoney;
      const ditiePrice4 = GameGlobal.ditieList.getChildByName("buyNpc").getComponent(ShopTrigger).num / 10;
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice4) {
        //钱够
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("npcOpenPos");
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //有钱了
        if (GameGlobal.actor.bag2.children.length > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.curBuyDTMoney ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("npcOpenPos");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
        //钱不够
        this.onNoYDNode(deltaTime);
        return;
        // //??????????????????柜台和野外都有钱怎么处理？野外或者柜台几乎同时生成钱怎么办
        // if (GameGlobal.equipConter.goldPos.children.length > 0) {
        //   this.target_YD_Node = this.yd[3];
        // } else if (GameGlobal.actor.PropListNode.children.length > 0) {
        //   this.target_YD_Node = this.yd[4];
        // }
      }
    } else if (this.curYDId == 13) {
      //引导买扩建地贴
      if (GameGlobal.cameraMoving) {
        this.target_YD_Node = null;
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      this.curBuyDTMoney = GameGlobal.buyNewMapMoney;
      const ditiePrice4 = GameGlobal.ditieList.getChildByName("buyOver").getComponent(ShopTrigger).num / 10;
      if (GameGlobal.actor.onGetBag2ReallyCount() >= ditiePrice4) {
        //钱够
        this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("overOpenPos");
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      } else {
        //有钱了
        if (GameGlobal.actor.bag2.children.length > 0) {
          if (
            GameGlobal.actor.onGetBag2ReallyCount() >= this.curBuyDTMoney ||
            GameGlobal.actor.onGetBag2ReallyCount() >= GameGlobal.moneyBagMax
          ) {
            this.target_YD_Node = GameGlobal.mainGame.GamePosNode.getChildByName("overOpenPos");
            GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
            return;
          }
        }
        //钱不够
        this.onNoYDNode(deltaTime);
        return;
      }
    } else {
      console.log("没有满足条件" + this.curYDId);
    }
  }

  public onNoYDNode(deltaTime) {
    //钱不够
    if (GameGlobal.equipConter.goldPos.children.length > 0 || GameGlobal.npcList.isHaveNpcToCounter) {
      //柜台有钱
      if (!this.afterIsMoney) {
        this.timeDown += deltaTime;
        if (this.timeDown < this.YDChangeCd) return;
      }
      this.timeDown = 0;
      this.afterIsMoney = true;
      //判断当前指引野外拿钱，并且野外有钱，那就不指向柜台
      if (this.target_YD_Node == this.yd[4] && GameGlobal.actor.PropListNode.children.length > 0) {
        let curlen = GameGlobal.equipConter.goldPos.children.length;
        if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
        let tray = 1.5 + curlen * 0.084;
        GameGlobal.jianTou2DGuide.set3DArrowPosY(tray);
        return;
      }
      this.target_YD_Node = this.yd[3];
      let curlen = GameGlobal.equipConter.goldPos.children.length;
      if (curlen > GameGlobal.moneyConterMaxY) curlen = GameGlobal.moneyConterMaxY;
      let tray = 1.5 + curlen * 0.084;
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node, tray);
      return;
    } else if (GameGlobal.actor.PropListNode.children.length > 0) {
      //野外有钱
      if (!this.afterIsMoney) {
        this.timeDown += deltaTime;
        if (this.timeDown < this.YDChangeCd) return;
      }
      this.timeDown = 0;
      this.afterIsMoney = true;
      //判断当前指引柜台拿钱，并且柜台有钱，那就不指向野外
      if (this.target_YD_Node == this.yd[3] && GameGlobal.equipConter.goldPos.children.length > 0) {
        return;
      }
      this.target_YD_Node = this.yd[4];
      GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
      return;
    } else {
      //没有钱
      if (this.afterIsMoney) {
        this.timeDown += deltaTime;
        if (this.timeDown < this.YDChangeCd) return;
      }
      this.timeDown = 0;
      this.afterIsMoney = false;
      //身上带着NPC
      if (GameGlobal.actor.getIsTakeNpc()) {
        if (!GameGlobal.bOpenPool) {
          this.yd[2].worldPosition = GameGlobal.mainGame.GamePosNode.getChildByName("YDThrowNpc1").worldPosition.clone();
        } else {
          this.yd[2].worldPosition = GameGlobal.mainGame.GamePosNode.getChildByName("YDThrowNpc2").worldPosition.clone();
        }
        this.target_YD_Node = this.yd[2];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }

      //捡NPC
      if (GameGlobal.iceBoxList.bodyList.children.length > 0) {
        this.target_YD_Node = GameGlobal.iceBoxList.bodyList.children[0];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
      //去踩锤子按钮
      if (GameGlobal.iceBoxList.bodyList.children.length <= 0) {
        if (GameGlobal.actor.getCarShowState()) this.target_YD_Node = this.yd[0];
        else this.target_YD_Node = this.yd[1];
        GameGlobal.jianTou2DGuide.setYDNode(this.target_YD_Node);
        return;
      }
    }
  }
  //#endregion
}
