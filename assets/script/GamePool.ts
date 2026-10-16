import { _decorator, Component, instantiate, Node, NodePool, Prefab } from "cc";
const { ccclass, property } = _decorator;

type PoolName = "LaoShu" | "Money" | "BiaoQing" | "Npc";
/** 对象池配置项 */
type PoolConfig = {
  prefab: Prefab | null; // 预制体
  pool: NodePool; // 对象池属性名
  initCount: number; // 初始数量
};

@ccclass("GamePool")
export class GamePool extends Component {
  static inst: GamePool = null;

  @property({ type: Prefab, displayName: "老鼠预制体" })
  LaoShuPrefab: Prefab | null = null;

  @property({ type: Prefab, displayName: "钱预制体" })
  MoneyPrefab: Prefab | null = null;

  @property({ type: Prefab, displayName: "表情预制体" })
  BiaoQingPrefab: Prefab | null = null;

  @property({ type: Prefab, displayName: "Npc预制体" })
  NpcPrefab: Prefab | null = null;

  /** 老鼠对象池 */
  laoshuPool: NodePool = new NodePool();
  /** 钱对象池 */
  moneyPool: NodePool = new NodePool();
  /** 表情对象池 */
  biaoqingPool: NodePool = new NodePool();
  /** Npc对象池 */
  npcPool: NodePool = new NodePool();

  /** 对象池配置列表 */
  private poolConfigs: Record<PoolName, PoolConfig>;

  protected onLoad(): void {
    GamePool.inst = this;
    this.ensurePoolConfigs();
  }

  start() {
    this.ensurePoolConfigs();
    this.initPool("LaoShu");
    this.initPool("Money");
    this.initPool("BiaoQing");
    this.initPool("Npc");
  }

  private ensurePoolConfigs() {
    if (this.poolConfigs) return;
    this.poolConfigs = {
      LaoShu: { prefab: this.LaoShuPrefab, pool: this.laoshuPool, initCount: 50 },
      Money: { prefab: this.MoneyPrefab, pool: this.moneyPool, initCount: 1000 },
      BiaoQing: { prefab: this.BiaoQingPrefab, pool: this.biaoqingPool, initCount: 0 },
      Npc: { prefab: this.NpcPrefab, pool: this.npcPool, initCount: 150 },
    };
  }

  private initPool(poolName: PoolName) {
    const config = this.poolConfigs[poolName];
    if (!config?.prefab) return;
    for (let i = 0; i < config.initCount; i++) {
      const node = instantiate(config.prefab);
      config.pool.put(node);
    }
  }

  poolGet(poolName: PoolName): Node | null {
    this.ensurePoolConfigs();
    const config = this.poolConfigs?.[poolName];
    if (!config) return null;
    if (config.pool.size() > 0) {
      return config.pool.get();
    }
    // 池空：按预热数量补一批；若 initCount=0 则至少实例化 1 个
    if (config.initCount > 0) {
      this.initPool(poolName);
    } else if (config.prefab) {
      config.pool.put(instantiate(config.prefab));
    }

    return config.pool.size() > 0 ? config.pool.get() : null;
  }

  poolPut(poolName: PoolName | string, node: Node) {
    if (!node || !node.isValid) return;
    this.ensurePoolConfigs();
    const config = this.poolConfigs?.[poolName as PoolName];
    if (!config) {
      node.destroy();
      return;
    }
    config.pool.put(node);
  }

  update(deltaTime: number) {}
}
