//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
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
        //////////////Please don't copy all of my codes completely--ScarletRain77///////////////
        var sky: egret.Bitmap = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        var body = new Body();
        this.addChild(body);

        var timer: egret.Timer = new egret.Timer(500);

        //var dog02:egret.Bitmap = this.createBitmapByName("dog02_png");
        //var dog02:egret.Bitmap = this.createBitmapByName("dog02_png");
        //var dog02:egret.Bitmap = this.createBitmapByName("dog02_png");



        var player = new Player();
        //player.idle();
        // this.addChild(player);

        sky.touchEnabled = true;
        sky.addEventListener(egret.TouchEvent.TOUCH_END, (e) => {
            player.move(e.stageX, e.stageY);
        }, this);



        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json
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
}

class Body extends egret.DisplayObjectContainer {
    private dogArray: egret.Bitmap[];
    private timeOnEnterFrame: number = 0;
    //目前所在的帧数，idle一共8帧，即帧数为0-7
    private frameNumber = 0;

    public constructor() {
        super();
        var dog01: egret.Bitmap = new egret.Bitmap(RES.getRes("dog01_png"));
        var dog02: egret.Bitmap = new egret.Bitmap(RES.getRes("dog02_png"));
        var dog03: egret.Bitmap = new egret.Bitmap(RES.getRes("dog03_png"));
        var dog04: egret.Bitmap = new egret.Bitmap(RES.getRes("dog04_png"));
        var dog05: egret.Bitmap = new egret.Bitmap(RES.getRes("dog05_png"));
        var dog06: egret.Bitmap = new egret.Bitmap(RES.getRes("dog06_png"));
        var dog07: egret.Bitmap = new egret.Bitmap(RES.getRes("dog07_png"));
        var dog08: egret.Bitmap = new egret.Bitmap(RES.getRes("dog08_png"));
        this.dogArray = [dog01, dog02, dog03, dog04, dog05, dog06, dog07, dog08];
        this.once(egret.Event.ADDED_TO_STAGE, this.onLoad, this);        
    }

    private onLoad(event: egret.Event) {
        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
        this.timeOnEnterFrame = egret.getTimer();
    }
    private onEnterFrame(e: egret.Event) {
       // var now = egret.getTimer();
        //var time = this.timeOnEnterFrame;
       // var pass = now - time;
        //console.log("onEnterFrame: ", (1000 / pass).toFixed(5));
        //if (pass == 200) {
            if (this.frameNumber >= 1) {
                this.removeChild(this.dogArray[this.frameNumber - 1]);
            }
            this.addChild(this.dogArray[this.frameNumber]);
            this.frameNumber++;
            if(this.frameNumber == 8){
                this.frameNumber = 0;
            }
        //}
        this.timeOnEnterFrame = egret.getTimer();
    }

}

class Player extends egret.DisplayObjectContainer {
    _modeText: egret.TextField;
    _body: egret.MovieClip;
    _stateMachine: StateMachine;


    constructor() {
        super();
        var data = RES.getRes("dog_json");
        var txtr = RES.getRes("dog_png");
        var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);

        this._body = new egret.MovieClip(mcFactory.generateMovieClipData("dog"));
        this._modeText = new egret.TextField();
        this._stateMachine = new StateMachine();

        this._modeText.y = 30;
        this._modeText.text = "Now is playing";

        this.addChild(this._body);
        this.addChild(this._modeText);

        this._body.gotoAndPlay("idle", -1);
    }

    move(targetX: number, targetY: number) {
        this._stateMachine.setState(new PlayerMoveState(this, targetX, targetY));
    }

    idle() {
        this._stateMachine.setState(new PlayerIdleState(this));
    }
}

/**
 * 状态机。currentState现在的状态，setState设置状态。先结束前一个状态，再把现在的状态赋值进来
 */
class StateMachine {
    _currentState: State;
    setState(s: State) {
        if (this._currentState) {
            this._currentState.onExit();
        }
        this._currentState = s;
        this._currentState.onEnter();
    }
}

/**
 * 状态接口，有两个方法。
 */
interface State {
    onEnter();
    onExit();
}

/**
 * 实现状态。_player为目前的人物，
 */
class PlayerState implements State {
    _player: Player;
    constructor(player: Player) {
        this._player = player;
    }

    onEnter() { }
    onExit() { }
}

class PlayerMoveState extends PlayerState {
    _targetX: number;
    _targetY: number;
    constructor(player: Player, targetX: number, targetY: number) {
        super(player);
        this._targetX = targetX;
        this._targetY = targetY;
    }
    onEnter() {
        this._player._modeText.text = "Now is moving";
        this._player._body.gotoAndPlay("run", -1);
        var tw = egret.Tween.get(this._player._body);
        tw.to({ x: this._targetX, y: this._targetY }, 500).call(this._player.idle, this._player);
    }
}

class PlayerIdleState extends PlayerState {

    onEnter() {
        this._player._body.gotoAndPlay("idle");
        this._player._modeText.text = "Now is idling";
    }
}