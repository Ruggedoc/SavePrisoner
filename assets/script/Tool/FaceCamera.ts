import { _decorator, Component, Node, Quat, Vec3, Camera } from 'cc';
import { GameGlobal } from '../GameGlobal';
const { ccclass, property } = _decorator;
 
@ccclass('FaceCamera')
export class FaceCamera extends Component {
    @property(Camera)
    mainCamera: Camera | null = null;
 
    update(deltaTime: number) {
        if (!GameGlobal.mainCamera) return;
 
        const nodePos = this.node.worldPosition;
        const cameraPos = GameGlobal.mainCamera.node.worldPosition;
 
        // 计算节点到摄像机的方向向量（忽略Z轴）
        const direction = new Vec3(
            cameraPos.x - nodePos.x,
            cameraPos.y - nodePos.y,
            cameraPos.z - nodePos.z
        ).normalize();
 
        // 将方向向量转换为四元数旋转（仅绕Z轴）
        const rotation = new Quat();
        Quat.fromViewUp(rotation, direction); // 需调整初始方向
        this.node.worldRotation = rotation;
    }
}