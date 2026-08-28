import { _decorator, Component, Node } from 'cc';
import { Npc } from './Npc';
const { ccclass, property } = _decorator;

@ccclass('npcAnim')
export class npcAnim extends Component {
    
    public opentx(){
        this.node.parent.parent.getComponent(Npc).attackEfc.active = true;
    }
    public colsetx(){
        this.node.parent.parent.getComponent(Npc).attackEfc.active = false;
    }



}


