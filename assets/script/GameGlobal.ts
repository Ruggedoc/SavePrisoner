import { _decorator, Camera, Node, Vec3 } from "cc";
import { MainGame } from "./MainGame";
import { CameraControl } from "./CameraControl";
import { CoinNumber } from "./CoinNumber";
import { Actor } from "./actor/Actor";
import { YinDao } from "./builds/YinDao";
import { sprlist } from "./sprite/sprlist";
import { IceBoxList } from "./builds/IceBoxList";
import { WatarRoom } from "./builds/WatarRoom";
import { EquipConter } from "./builds/EquipConter";
import { BagOffset } from "./actor/BagOffset";
import { JianTou2DGuide } from "./actor/JianTou2DGuide";
import { NpcList } from "./actor/NpcList";
import { FMPlayer } from "./actor/FMPlayer";

export class GameGlobal {
  public static mainGame: MainGame;
  public static mainCamera: Camera;
  public static CameraControl: CameraControl;
  public static cameraMoving: boolean = false;
  public static effectLay: Node;
  public static uiLay: Node;
  public static actor: Actor;
  public static state: number = 1;
  public static coinNumber: CoinNumber;
  public static coin: number = 0;
  public static targetDiTie: Node;
  public static isFirst: boolean = true;

  public static sprlist: sprlist;

  public static yindao: YinDao;

  public static builds: Node;
  public static home: Node;
  public static ditieList: Node;

  /*********子弹生产线*********/
  public static isOver = false; //游戏是否结束
  public static isStop = false; //游戏是否暂停

  //** 重生PL192_复刻解冻治疗囚犯战斗$模拟经营*/
  public static iconValue = 10; //金币价值

  /**
   * 背包金币上限
   */
  public static moneyBagMax: number = 50;
  /**
   * 柜台金币实际上限
   */
  public static moneyConterMax: number = 100;
  /**
   * 柜台金币堆叠上限
   */
  public static moneyConterMaxY: number = 50;
  /**
   * 一个锤子还是三个锤子 1 or 3
   * */
  public static curIceNumStage = 1; //一个锤子还是三个锤子 1 or 3
  /**
   * 一个锤子时的冰块状态
   * */
  public static oneIceStage = 1; //一个锤子时的冰块状态
  /**
   * 三个锤子时的冰块状态
   * */
  public static threeIceStage = [1, 1, 1]; //三个锤子时的冰块状态
  /**
   * 当前金币个数(实际金币)
   * */
  public static currencyGold = 0; //金币
  /**
   * 买多个锤子的花费
   * */
  public static buyIceNumMoney = 20; //买多个锤子的花费
  /**
   * 买推车的花费
   * */
  public static buyCarMoney = 40; //买推车的花费
  /**
   * 买水池的花费
   * */
  public static buyPoolMoney = 80; //买水池的花费
  /**
   * 买搬运工的花费
   * */
  public static buyEPlayerMoney = 100; //买搬运工的花费
  /**
   * 买新区域的花费
   * */
  public static buyNewMapMoney = 200; //买新区域的花费
  /**
   * 解冻一个人奖励的金币数
   * */
  public static saveMoney = 5; //解冻一个人奖励的金币数
  /**
   * 小怪奖励的金币数
   * */
  public static killMoney = 6; //小怪奖励的金币数
  /**
   * 冰块是否准备好了
   * */
  public static bIceReady: boolean = true; //冰块是否准备好了
  /**
   * 解冻的尸体上限
   * */
  public static saveMaxNum: number = 24;
  /**
   * 每块冰尸体上限
   * */
  public static iceNpcNum: number = 8;
  /**
   * 当前携带尸体
   */
  public static iceBoxList: IceBoxList;
  /**
   * 冰尸体是否准备好被捡
   * */
  public static isBodyReady: boolean = false;
  /**
   * 尸体飞出的目标点
   */
  public static bodyPosArr: Vec3[] = [];
  /**
   * //存放已经存在的点位下标
   */
  public static bodyPosSet: Set<{}> = new Set();
  /**
   * 当前携带尸体
   */
  public static curTakeBody: number = 0;
  /**
   * 背包三尸体坐标
   */
  public static curTakeBodyPos1: Vec3 = new Vec3(-0.087, 0.72, -1.3);
  /**
   * 背包三尸体坐标
   */
  public static curTakeBodyPos2: Vec3 = new Vec3(0.087, 0.72, -1.3);
  /**
   * 背包四尸体旋转
   */
  public static curTakeBodyRot1: Vec3 = new Vec3(90, 0, 0);
  /**
   * 背包四尸体旋转
   */
  public static curTakeBodyRot2: Vec3 = new Vec3(90, 0, 0);
  /**
   * 当前NPC携带的尸体
   */
  public static curPlayTakeBody: number = 0;
  /**
   * 空手携带尸体上限
   */
  public static takeBodyMax1: number = 2;
  /**
   * //小车携带尸体上限
   */
  public static takeBodyMax2: number = 6;
  /**
   * //当前水里的尸体
   */
  public static curWaterBody: number = 0;
  /**
   * //水罐解冻上限
   */
  public static waterOpenMax1: number = 2;
  /**
   * //水池解冻上限
   */
  public static waterOpenMax2: number = 6;
  /**
   * //是否解锁小推车
   */
  public static bOpenCar: boolean = false;
  /**
   * //是否解锁水池
   */
  public static bOpenPool: boolean = false;
  /**
   * //水房建筑的Node
   */
  public static watarRoom: WatarRoom;
  /**
   * 尸体解冻时间
   */
  public static throwingBodyTime: number = 2;
  /**
   * 水里的目标点--2个状态下
   */
  public static inWaterPos2Arr: Vec3[] = [];
  /**
   * 水里的目标点--6个状态下
   */
  public static inWaterPos6Arr: Vec3[] = [];

  /**
   * 跳出水里的落点--2个状态下
   */
  public static toWaterPos2Arr: Vec3[] = [];
  /**
   * 跳出水里的落点--6个状态下
   */
  public static toWaterPos6Arr: Vec3[] = [];
  /**
   * 柜台
   */
  public static equipConter: EquipConter;
  /**
   * 柜台排队的list
   */
  public static npcList: NpcList;
  /**
   * 排队的上限
   */
  public static waitManMax: number = 24;
  /**
   * 自由战斗的人
   */
  public static freeManArr: Node[] = [];
  /**
   * 第一次踩锤子开关
   */
  public static isFirstStepon: boolean = true;
  /**
   * 第一次获得金币
   */
  public static isFirstGetGold: boolean = true;
  /**
   * 第一次丢尸体
   */
  public static isFirstThrow: boolean = true;
  /**
   * 打怪NPC血上限
   */
  public static npcMaxHp: number = 5;
  /**
   * 怪物出生点坐标
   */
  public static monsterBirthPosArr: Vec3[] = [];
  /**
   * 怪物待机点坐标
   */
  public static monsterIdlePosArr: Vec3[] = [];
  /**
   * 怪物s死亡后他自身的待机点坐标
   */
  public static monsterDeathArr: Vec3[] = [];
  /**
   * NPC去战场的两个中间途经点
   */
  public static npcToBattlePos: Vec3[] = [];
  /**
   * NPC战斗点
   */
  public static npcBattlePos: Vec3[] = [];

  public static battlePosIdx: number = 0;
  /**背包满的动画 */
  public static isBagMaxPlaying: boolean;
  /**背包特殊动画 */
  public static bagoffset: BagOffset;
  /**下一个要买的地贴 */
  public static nextBuyDitie: Node = null;
  /**引导箭头 */
  public static jianTou2DGuide: JianTou2DGuide;
  /**搬运NPC是否开启 */
  public static bPlayerOpen: boolean = false;

  /**战场中正在飞的钱 */
  public static curFlyCoin: Node[] = [];

  /**第一次引导柜台钱 */
  public static ydFristMoney: boolean = true;
  /**搬运npc */
  public static FMPlayer: FMPlayer = null;
  public static poolAni: boolean = false;
  public static moneyFlyList: Node;

  //取野外金币的间隔时间
  public static shouMoneyTime = 0.02;
  //取柜台金币的间隔时间
  public static shouMoneyTime2 = 0.1;
  //取柜台金币时金币的速度
  public static takeSpeed = 3;
  //每次取柜台金币的数量
  public static takeCount = 2;

  //NPC扔金币时金币的速度
  public static paySpeed = 5;

  //柜台排队的上限
  public static cunterListMax = 12;
  //Npc等待排队的随机区域上限点
  public static npcWaitAreaMaxPos = new Vec3(-2.7, 0, 10);
  public static bHaveMonsterDie: boolean = false;
  public static bHaveMonsterHit: boolean = false;
  public static bHaveNpcDie: boolean = false;
  public static bHaveNpcAttack: boolean = false;

  public static audioPlayMax: number = 2;
  public static audioPlayInterval: number = 1;
}
