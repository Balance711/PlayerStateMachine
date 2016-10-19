//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var sky: egret.Bitmap = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;



        //////////////////////////////////动画
        var data = RES.getRes("Archer_Idle_json");
        var txtr = RES.getRes("Archer_Idle_png");
        var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
        var mc1: egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData("Archer_Idle"));

        var data = RES.getRes("gif_json");
        var txtr = RES.getRes("gif_png");
        var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
        var mc2: egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData("gif"));
        var standcountainer: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
        var movecountainer: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
        /////////////////////////////////开始

        this.touchEnabled = true;
        this.addChild(standcountainer);
        this.addChild(movecountainer);
        
        var _statemachine = new StateMachine(this, standcountainer,movecountainer, mc1, mc2);
        _statemachine.onEnter();


        this.addEventListener(egret.TouchEvent.TOUCH_TAP, (e: egret.TouchEvent) => {
            _statemachine.targetX = e.stageX;
            _statemachine.targetY = e.stageY;
            _statemachine.nowstate.onExit();
        }, this)



        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this)

    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: Array<any>): void {
        var self: any = this;

        var parser = new egret.HtmlTextParser();
        var textflowArr: Array<Array<egret.ITextElement>> = [];
        for (var i: number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change: Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            self.changeDescription(textfield, lineArr);

            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);

        }
    }

    /**
     * 切换描述内容
     * Switch to described content
     */
    private changeDescription(textfield: egret.TextField, textFlow: Array<egret.ITextElement>): void {
        textfield.textFlow = textFlow;
    }


}



class StateMachine {
    characters: any;
    nowstate: State;
    targetX: number;
    targetY: number;
    Standing: charactersStanding;
    Moving: charactersMoving;
    _standcountainer: egret.DisplayObjectContainer;
    _movecountainer: egret.DisplayObjectContainer;
    _stand: egret.MovieClip;
    _move: egret.MovieClip

    constructor(_characters: any, standcountainer: egret.DisplayObjectContainer, movecountainer: egret.DisplayObjectContainer,
        stand: egret.MovieClip, move: egret.MovieClip) {
        console.log("StateMachine constructor");
        this._standcountainer = standcountainer;
        this._movecountainer = movecountainer;
        this._stand = stand;
        this._move = move;
        this.Standing = new charactersStanding(_characters, this);
        this.Moving = new charactersMoving(_characters, this);
        if (_characters == null) {
            console.log("No picture,StateMachine");
        }
        this.characters = _characters;
        this.nowstate = new charactersStanding(_characters, this);
    }
    onEnter() {
        console.log("StateMachine onEnter");
        console.log(this.nowstate);
        this.nowstate.onEnter();
    }
    onExit() {
        console.log("StateMachine onExit");
        this.nowstate.onExit();
    }
}


////////////////////////////////////////////移动状态
class charactersMoving implements State {
    _characters: any;
    _StateMachine: StateMachine;

    constructor(characters: any, stateMachine: StateMachine) {
        console.log("charactersMoving constructor");
        this._StateMachine = stateMachine;
        this._characters = characters;
    }
    onEnter() {
        console.log("charactersMoving onEnter");
        var _character = egret.Tween.get(this._StateMachine._movecountainer);
        //////////////////////////////////调用走路动画
        this._StateMachine._movecountainer.addChild(this._StateMachine._move);
        this._StateMachine._move.gotoAndPlay(1, -1);
        _character.to({ x: this._StateMachine.targetX, y: this._StateMachine.targetY }, 1000);
        this._StateMachine._standcountainer.x=this._StateMachine.targetX;
        this._StateMachine._standcountainer.y=this._StateMachine.targetY;

        this._StateMachine.nowstate.onExit();
    }
    onExit() {
        console.log("charactersMoving onExit");
        var tim: egret.Timer = new egret.Timer(1000, 1);
        tim.start();
        tim.addEventListener(egret.TimerEvent.TIMER, () => {
            this._StateMachine._movecountainer.removeChild(this._StateMachine._move);
            this._StateMachine._standcountainer.alpha = 1;
        }, this);

        this._StateMachine.nowstate = this._StateMachine.Standing;
        
        this._StateMachine.nowstate.onEnter();
    }

}

////////////////////////////////////站立状态
class charactersStanding implements State {
    _characters: any;
    _StateMachine: StateMachine;
    constructor(characters: any, stateMachine: StateMachine) {
        console.log("charactersStanding constructor");
        this._StateMachine = stateMachine;
        this._characters = characters;
    }

    onEnter() {
        console.log("charactersStanding onEnter");
        ///////////////调用站立动画
        
        this._StateMachine._standcountainer.addChild(this._StateMachine._stand);
        this._StateMachine._stand.gotoAndPlay(1, -1);


    }
    onExit() {
        console.log("charactersStanding onExit");
        this._StateMachine._standcountainer.alpha = 0;
        this._StateMachine.nowstate = this._StateMachine.Moving;
        this._StateMachine.nowstate.onEnter();
    }
}
interface State {
    onEnter();
    onExit();
}

///////////////////////////////////状态机



 /*
class StateMachine {
    _nowstate: State;
    private s: String;

    setState(s: String) {
        console.log(s);
        if (this._nowstate.s == "stand") {
            this._nowstate.onExit();
        }
        this._nowstate = s;
        this._nowstate.onEnter();
    }
}

var s: StateMachine;
s._nowstate

interface State {

}*/

