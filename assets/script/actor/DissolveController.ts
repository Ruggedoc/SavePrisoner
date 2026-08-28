import { _decorator, Color, Component, Material, MeshRenderer, Node, tween } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DissolveController")
export class DissolveController extends Component {
  @property({ type: MeshRenderer, displayName: "溶解模型" })
  meshRenderer: MeshRenderer = null;

  @property({ displayName: "溶解时长" })
  dissolveTime: number = 1;

  @property({ displayName: "溶解颜色" })
  dissolveColor: Color = new Color(0, 0, 0, 0);

  private dissolveProgress = { progress: 0 };
  start() {
    // this.scheduleOnce(() => {
    //     this.dissolve();
    // }, 1);
  }

  initValue() {
    const material = this.meshRenderer.getMaterialInstance(0);
    material.setProperty("dissolveThresholdValue", 0);
  }

  update(deltaTime: number) {}

  dissolve(time, callback?) {
    const material = this.meshRenderer.getMaterialInstance(0);
    material.setProperty("dissolveColor1", this.dissolveColor);
    material.setProperty("dissolveColor2", this.dissolveColor);
    tween(this.dissolveProgress)
      .to(
        time,
        { progress: 1 },
        {
          onUpdate: (target) => {
            material.setProperty("dissolveThresholdValue", target.progress);
          },
        },
      )
      .call(() => {
        callback && callback();
      })
      .start();
  }
}
