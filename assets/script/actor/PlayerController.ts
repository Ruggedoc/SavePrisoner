import { _decorator, Collider, Component, ICollisionEvent, physics, Quat, RigidBody, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const P3_moveDir = new Vec3();
const P3_prevDir = new Vec3();
const P3_dirNormalize = new Vec3();

const P2_moveDir = new Vec3();
const P2_targetRotation = new Quat();

const P1_curNodePos = new Vec3();
const P1_followNodeWorldPos = new Vec3();
const P1_followNodeLocalPos = new Vec3();
const P1_dirNormalize = new Vec3();
const P1_moveDir = new Vec3();
const P1_prevDir = new Vec3();


const P4_moveDir = new Vec3();
const P4_fromRotation = new Quat();
const P4_goalDirEuler = new Vec3();
const P4_goalRotation = new Quat();
const P4_toRotation = new Quat();
const P4_curRotation = new Quat();

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    isUpdateRotation = true;

    moveSpeed = 7;
    rigidBody: RigidBody;
    colliders: Collider[];
    controllEnable = true;
    inCollisionColliders: Set<Collider> = new Set();
    private rigidBodyMask = 0;
    private rigidUseGravity = true;
    onCollisionEnterNotice?: (evt: ICollisionEvent) => void;
    protected onLoad(): void {
        this.rigidBody = this.getComponent(RigidBody);
        this.rigidBodyMask = this.rigidBody.getMask();
        this.rigidUseGravity = this.rigidBody.useGravity;
        this.colliders = this.getComponents(Collider);
    }
    protected start(): void {
        this.rigidBody.angularFactor = new Vec3(0, 0, 0);
        this.rigidBody.angularDamping = 1;

        this.rigidBody.linearDamping = 0.1;
        this.setControllEnable(this.controllEnable);

        this.colliders.forEach(v => {
            v.on('onCollisionEnter', this.onCollisionEnter, this);
            v.on("onCollisionExit", this.onCollisionExit, this);
        })
    }
    isPlayerCollider(collider: Collider) {
        return this.colliders.indexOf(collider) != -1;
    }

    private onCollisionEnter(evt: ICollisionEvent) {
        this.inCollisionColliders.add(evt.otherCollider);
        if (this.groundCollider != null) {
            if (evt.otherCollider === this.groundCollider) {
                this._isPhysicsInJiTui = false;
                this.groundCollider = null;
            }
        }
        this.onCollisionEnterNotice?.(evt);
    }
    private _extJiTuiCondition = false;
    private _isExtJiTuiCondition = true;
    setWaitExtJiTuiCondition() {
        this._isExtJiTuiCondition = false;
    }
    private onCollisionExit(evt: ICollisionEvent) {
        this.inCollisionColliders.delete(evt.otherCollider);
    }
    get isInJiTui() {
        if (this._extJiTuiCondition) {
            return this._isExtJiTuiCondition || this._isPhysicsInJiTui;
        }
        return this._isPhysicsInJiTui;
    }
    private _isPhysicsInJiTui = false;
    private groundCollider: Collider;
    jiTui(dir: Vec3, groundCollider: Collider, extJiTuiCondition = false) {
        if (this.isInJiTui) {
            return;
        }
        this._extJiTuiCondition = extJiTuiCondition;
        this._isPhysicsInJiTui = true;
        this._isExtJiTuiCondition = true;
        this.groundCollider = groundCollider;
        this.rigidBody.applyImpulse(dir);
    }
    move(dir: Vec3) {
        if (this.isInJiTui) {
            return;
        }
        if (!dir || Vec3.ZERO.equals(dir)) {
            this.rigidBody.setLinearVelocity(Vec3.ZERO);
            this.clearAngularVelocity();
            return;
        }
        P3_dirNormalize.set(dir);
        //仅计算xz轴位移
        P3_dirNormalize.y = 0;
        P3_dirNormalize.normalize();

        P3_moveDir.set(dir);
        //仅计算xz轴位移
        P3_moveDir.y = 0;
        P3_moveDir.normalize();

        P3_moveDir.multiplyScalar(this.moveSpeed);
        this.rigidBody.getLinearVelocity(P3_prevDir);
        // 刚体移动
        if (!Vec3.equals(P3_prevDir, P3_moveDir)) {
            this.rigidBody.setLinearVelocity(P3_moveDir);
        }

        // 更新旋转
        if (this.isUpdateRotation) {
            this.directUpdateRotation(P3_dirNormalize);
        }
    }
    directUpdateRotation(moveDir: Vec3) {
        if (this.isInJiTui) {
            return;
        }
        P2_moveDir.set(moveDir);
        // 更新旋转
        Quat.fromViewUp(P2_targetRotation, P2_moveDir, Vec3.UP);
        this.rigidBody.node.setRotation(P2_targetRotation);
        this.clearAngularVelocity();
    }
    slerpUpdateRotation(moveDir: Vec3, dt: number, rotationSpeed = 90) {
        P4_moveDir.set(moveDir);
        P4_moveDir.y = 0;
        P4_moveDir.normalize();

        this.node.getRotation(P4_curRotation);

        Quat.fromViewUp(P4_fromRotation, P4_moveDir, Vec3.UP).getEulerAngles(P4_goalDirEuler);
        Quat.fromEuler(P4_goalRotation, 0, P4_goalDirEuler.y, 0);
        Quat.rotateTowards(P4_toRotation, P4_curRotation, P4_goalRotation, rotationSpeed * dt * 360 * Math.PI / 180);
        this.rigidBody.node.setRotation(P4_toRotation);
        this.clearAngularVelocity();
    }
    //角色向targetNode移动 要逐帧调用
    updateMoveToTarget(dt: number, targetNode: Vec3) {
        if (!targetNode) {
            return false;
        }
        this.node.getPosition(P1_curNodePos);
        P1_followNodeWorldPos.set(targetNode);

        this.node.parent.inverseTransformPoint(P1_followNodeLocalPos, P1_followNodeWorldPos);

        P1_dirNormalize.set(P1_followNodeLocalPos);
        P1_dirNormalize.subtract(P1_curNodePos);
        //仅计算xz轴位移
        P1_dirNormalize.y = 0;

        let goalDistance = P1_dirNormalize.length();

        P1_dirNormalize.normalize();

        P1_moveDir.set(P1_dirNormalize);
        P1_moveDir.multiplyScalar(this.moveSpeed);

        let step = this.moveSpeed * dt;

        if (step >= goalDistance) {
            //剩余距离不足
            this.rigidBody.setLinearVelocity(Vec3.ZERO);
            this.clearAngularVelocity();
            return true;
        } else {
            this.rigidBody.getLinearVelocity(P1_prevDir);
            // 刚体移动
            if (!Vec3.equals(P1_prevDir, P1_moveDir)) {
                this.rigidBody.setLinearVelocity(P1_moveDir);
            }
            // 更新旋转
            if (this.isUpdateRotation) {
                this.directUpdateRotation(P1_dirNormalize);
            }

            return false;
        }
    }
    clearAngularVelocity() {
        this.rigidBody.setAngularVelocity(Vec3.ZERO);
    }
    setControllEnable(val: boolean) {
        if (this.controllEnable && !val) {
            this.rigidBody.clearState();
        }
        this.controllEnable = val;
        this.rigidBody.enabled = val;
        this.colliders.forEach(v => v.enabled = val);
    }
    setKineMatic() {
        this.rigidBody.type = physics.ERigidBodyType.KINEMATIC;
    }
    setDynamic() {
        this.rigidBody.type = physics.ERigidBodyType.DYNAMIC;
    }
    setStatic() {
        this.rigidBody.type = physics.ERigidBodyType.STATIC;
    }
    private isThrough = false;
    setThrough(val: boolean) {
        if (this.isThrough === val) {
            return;
        }
        this.isThrough = val;
        if (val) {
            this.rigidBody.setMask(0);
            this.rigidBody.useGravity = false;
        } else {
            this.rigidBody.setMask(this.rigidBodyMask);
            this.rigidBody.useGravity = this.rigidUseGravity;
        }
    }
    protected onDestroy(): void {
        super.onDestroy?.();
        this.colliders.forEach(v => {
            v.off('onCollisionEnter', this.onCollisionEnter, this);
            v.off("onCollisionExit", this.onCollisionExit, this);
        })
    }
}