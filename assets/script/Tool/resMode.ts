import { _decorator, BatchingUtility, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("resMode")
export class resMode extends Component {
  @property(Node)
  treesNode;
  @property(Node)
  snowNode;
  @property(Node)
  wallNode;

  @property(Node)
  treesMesh;
  @property(Node)
  snowMesh;
  @property(Node)
  wallMesh;
  start() {
    BatchingUtility.batchStaticModel(this.treesNode, this.treesMesh);
    BatchingUtility.batchStaticModel(this.snowNode, this.snowMesh);
    BatchingUtility.batchStaticModel(this.wallNode, this.wallMesh);
  }
}