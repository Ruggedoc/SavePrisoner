import { _decorator, Camera, CameraComponent, Component, find, instantiate, MainFlow, Node, Prefab, sys, UITransform, Vec3, view, Widget } from 'cc';
import { MainGame } from '../MainGame';
const { ccclass, property } = _decorator;

@ccclass('xgGunsui')
export class xgGunsui extends Component {

    
    start() {
        
    }

    update(deltaTime: number) {
        this.node.setPosition(MainGame.mymain.mainNode.getChildByName("actor").position);
    }

    


}


