import { _decorator, Component, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LookAtCamera')
export class LookAtCamera extends Component {

    onLoad() {
    }

    update(dt: number) {
        this.updateFaceCamera();
    }
    //2D图像始终朝向摄像机
    private updateFaceCamera() {
        if (!this.node) {
            return;
        }
        let rt = this.node.parent.rotation.clone();
        let rq = this.node.parent.rotation.clone();
        Quat.invert(rq, rt);
        this.node.setRotation(rq);
    }
}


