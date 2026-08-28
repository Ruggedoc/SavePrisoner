import { _decorator, Component, game, Label, Vec3 } from 'cc';
import { GameGlobal } from './GameGlobal';
const { ccclass, property } = _decorator;

@ccclass('CoinNumber')
export class CoinNumber extends Component {
    @property(Label)
    lab: Label;

    private coin = 0;
    private playCoin = 0;

    private putTime = 0;

    private ADD_TIME = 250;
    private initPos = new Vec3(-200, 0, 0);


    onLoad() {
        GameGlobal.coinNumber = this;
    }


    protected start() {
        this.coin = GameGlobal.coin;
        this.playCoin = GameGlobal.coin;
        this.lab.string = GameGlobal.coin + '';
    }


    public addCoin(num) {
        this.coin += num;
        this.putTime = game.totalTime;
        GameGlobal.coin = this.coin;
    }


    public subCoin(num) {
        this.coin -= num;
        this.putTime = game.totalTime;
        if (this.coin < 0) this.coin = 0;
        GameGlobal.coin = this.coin;
    }


    public getCoin() {
        return this.coin;
    }


    protected update(dt: number): void {
        // 数字增长动画
        if (this.playCoin != this.coin) {
            let d = this.coin - this.playCoin;
            if (Math.abs(d) < 2) {
                this.playCoin = this.coin;
            } else {
                dt = dt * 1000;
                let t = (this.putTime + this.ADD_TIME) - game.totalTime;
                if (Math.abs(t) <= dt) {
                    this.playCoin = this.coin;
                } else {
                    let sr = t / dt;
                    let dr = Math.round(d / sr);
                    // console.log('======', t, dt, sr, dr)
                    this.playCoin += dr;
                }
                if (this.playCoin < 0) this.playCoin = this.coin;
            }

            this.lab && (this.lab.string = String(this.playCoin));
        }
    }

}


