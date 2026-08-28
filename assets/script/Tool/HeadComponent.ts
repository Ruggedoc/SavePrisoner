import { _decorator, Camera, CCBoolean, CCFloat, Component, Node } from 'cc';
import { UICoordinateTracker } from './ui-coordinate-tracker';
import { GameGlobal } from '../GameGlobal';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('HeadComponent')
// @requireComponent(UICoordinateTracker)
export class HeadComponent extends Component {

    @property({type: Node, group: { name: "同步3d对象位置", id: "1" }})
    target:Node;
    
    @property({group: { name: "同步3d对象位置", id: "1" }})
    useScale: boolean = true;
    @property({type: CCFloat, group: { name: "同步3d对象位置", id: "1" }})
    distance: number=10;

    private tracker: UICoordinateTracker;

    @property
    private _camera;
    @property(({type: Camera, group: { name: "同步3d对象位置", id: "1" }}))
    get camera() {
        return this._camera;
    }
    set camera(c) {
        this._camera = c;

        this.getTracer();
        this.tracker && (this.tracker.camera = this._camera);
    }

    start() {
        this.getTracer();
        this.tracker.target = this.target;
        this.tracker.camera = this.camera || GameGlobal.mainCamera;
        this.tracker.useScale = this.useScale;
        this.tracker.distance = this.distance;
    }

    private getTracer() {
        if (!this.tracker)
            this.tracker = this.node.getComponent(UICoordinateTracker) || this.node.addComponent(UICoordinateTracker);
    }

}


