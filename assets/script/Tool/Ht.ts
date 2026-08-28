import { _decorator, AssetManager, assetManager, Component, Node, Prefab, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Ht')
export class Ht {
    public static resBundle = null;
    public static preflist: { [key: string]: Prefab } = null;  	    //预制体
    public static img_prop: { [key: string]: any } = null;  	    //道具图片
    
    public static initHt(){  
        let self = this;
        assetManager.loadBundle("resources", (err, bundle:AssetManager.Bundle) => 
        {
            self.resBundle = bundle;
            bundle.loadDir("jun_fab/add", Prefab, function (err, assets) ///UI
            {
                if(!err)
                {
                    //预制体保存进入字典
                    self.preflist = {};
                    for(let i:number = 0;i < assets.length;i++)
                    {
                        self.preflist[(assets[i] as Prefab).name] = assets[i] as Prefab; 
                        console.log((assets[i] as Prefab).name);
                        
                    }
                }
            });
        })

    }


    public static getImg_prop(node,str){
        let self = this;
        if(this.img_prop != null && this.img_prop[str] != null){
            node.getComponent(Sprite).spriteFrame = this.img_prop[str];
            return;
        }
        if(this.img_prop == null){
            this.img_prop = [];
        }

        Ht.resBundle.load("UI/win/"+str+"/spriteFrame", SpriteFrame, (err, frame) => {
            if(frame != null){
                self.img_prop[str] = frame;
                if(node && node.getComponent(Sprite)){
                    node.getComponent(Sprite).spriteFrame = frame;
                }
             }
         });
    }


}


