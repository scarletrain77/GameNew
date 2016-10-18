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
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        //////////////Please don't copy all of my codes completely--ScarletRain77///////////////
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        var player = new Player();
        player.idle();
        this.addChild(player);
        sky.touchEnabled = true;
        sky.addEventListener(egret.TouchEvent.TOUCH_END, function (e) {
            player.move(e.stageX, e.stageY);
        }, this);
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var Body = (function (_super) {
    __extends(Body, _super);
    function Body(mode) {
        _super.call(this);
        this.timeOnEnterFrame = 0;
        //目前所在的帧数，idle一共8帧，即帧数为0-7
        this.frameNumber = 0;
        //是不是第一次播放
        this.isPlayFirst = true;
        //判断状态切换前的是Run状态还是Idle状态
        this.isRunChild = false;
        this.isIdleChild = false;
        //两个动画的播放起始和结束帧
        this.idleAnimFrameEnd = 7;
        this.runAnimFrameEnd = 7;
        this.mode = "Run";
        var dog01 = new egret.Bitmap(RES.getRes("dog01_png"));
        var dog02 = new egret.Bitmap(RES.getRes("dog02_png"));
        var dog03 = new egret.Bitmap(RES.getRes("dog03_png"));
        var dog04 = new egret.Bitmap(RES.getRes("dog04_png"));
        var dog05 = new egret.Bitmap(RES.getRes("dog05_png"));
        var dog06 = new egret.Bitmap(RES.getRes("dog06_png"));
        var dog07 = new egret.Bitmap(RES.getRes("dog07_png"));
        var dog08 = new egret.Bitmap(RES.getRes("dog08_png"));
        var dog09 = new egret.Bitmap(RES.getRes("dog09_png"));
        var dog10 = new egret.Bitmap(RES.getRes("dog10_png"));
        var dog11 = new egret.Bitmap(RES.getRes("dog11_png"));
        var dog12 = new egret.Bitmap(RES.getRes("dog12_png"));
        var dog13 = new egret.Bitmap(RES.getRes("dog13_png"));
        var dog14 = new egret.Bitmap(RES.getRes("dog14_png"));
        var dog15 = new egret.Bitmap(RES.getRes("dog15_png"));
        var dog16 = new egret.Bitmap(RES.getRes("dog16_png"));
        this.dogIdleArray = [dog01, dog02, dog03, dog04, dog05, dog06, dog07, dog08];
        this.dogRunArray = [dog09, dog10, dog11, dog12, dog13, dog14, dog15, dog16];
        this.mode = mode;
        this.once(egret.Event.ADDED_TO_STAGE, this.onLoad, this);
    }
    var d = __define,c=Body,p=c.prototype;
    p.reset = function () {
        this.isPlayFirst = true;
        if (this.frameNumber == 0) {
            this.frameNumber = 8;
        }
        if (this.isIdleChild == true) {
            this.removeChild(this.dogIdleArray[this.frameNumber - 1]);
            console.log("remove idle" + this.frameNumber);
        }
        else if (this.isRunChild == true) {
            this.removeChild(this.dogRunArray[this.frameNumber - 1]);
            console.log("remove run" + this.frameNumber);
        }
        this.isIdleChild = false;
        this.isRunChild = false;
        this.frameNumber = 0;
    };
    p.onLoad = function (event) {
        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
        this.timeOnEnterFrame = egret.getTimer();
    };
    p.onEnterFrame = function (e) {
        //帧数大于0的时候，才能移除前一帧
        //当帧数为0的时候，移除的是最后一帧
        if (this.mode == "Idle") {
            if (this.frameNumber >= 1) {
                this.removeChild(this.dogIdleArray[this.frameNumber - 1]);
            }
            else if (this.frameNumber == 0 && this.isPlayFirst == false) {
                this.removeChild(this.dogIdleArray[this.idleAnimFrameEnd]);
            }
            this.addChild(this.dogIdleArray[this.frameNumber]);
            this.isIdleChild = true;
            this.frameNumber++;
            if (this.frameNumber == 8) {
                this.frameNumber = 0;
            }
            this.isPlayFirst = false;
            this.timeOnEnterFrame = egret.getTimer();
        }
        else if (this.mode == "Run") {
            //console.log("Run:"+this.frameNumber);
            if (this.frameNumber >= 1) {
                this.removeChild(this.dogRunArray[this.frameNumber - 1]);
            }
            else if (this.frameNumber == 0 && this.isPlayFirst == false) {
                this.removeChild(this.dogRunArray[this.runAnimFrameEnd]);
            }
            this.addChild(this.dogRunArray[this.frameNumber]);
            this.isRunChild = true;
            this.frameNumber++;
            if (this.frameNumber == 8) {
                this.frameNumber = 0;
            }
            this.isPlayFirst = false;
            this.timeOnEnterFrame = egret.getTimer();
        }
    };
    return Body;
}(egret.DisplayObjectContainer));
egret.registerClass(Body,'Body');
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.call(this);
        //var data = RES.getRes("dog_json");
        //var txtr = RES.getRes("dog_png");
        //var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
        //this._body = new egret.MovieClip(mcFactory.generateMovieClipData("dog"));
        this._body = new Body("Idle");
        this._modeText = new egret.TextField();
        this._stateMachine = new StateMachine();
        this._modeText.y = 30;
        this._modeText.text = "Now is playing";
        this.addChild(this._body);
        this.addChild(this._modeText);
        //this._body.gotoAndPlay("idle", -1);
    }
    var d = __define,c=Player,p=c.prototype;
    p.move = function (targetX, targetY) {
        this._stateMachine.setState(new PlayerMoveState(this, targetX, targetY));
    };
    p.idle = function () {
        this._stateMachine.setState(new PlayerIdleState(this));
    };
    return Player;
}(egret.DisplayObjectContainer));
egret.registerClass(Player,'Player');
/**
 * 状态机。currentState现在的状态，setState设置状态。先结束前一个状态，再把现在的状态赋值进来
 */
var StateMachine = (function () {
    function StateMachine() {
    }
    var d = __define,c=StateMachine,p=c.prototype;
    p.setState = function (s) {
        if (this._currentState) {
            this._currentState.onExit();
        }
        this._currentState = s;
        this._currentState.onEnter();
    };
    return StateMachine;
}());
egret.registerClass(StateMachine,'StateMachine');
/**
 * 实现状态。_player为目前的人物，
 */
var PlayerState = (function () {
    function PlayerState(player) {
        this._player = player;
    }
    var d = __define,c=PlayerState,p=c.prototype;
    p.onEnter = function () { };
    p.onExit = function () { };
    return PlayerState;
}());
egret.registerClass(PlayerState,'PlayerState',["State"]);
var PlayerMoveState = (function (_super) {
    __extends(PlayerMoveState, _super);
    function PlayerMoveState(player, targetX, targetY) {
        _super.call(this, player);
        this._targetX = targetX;
        this._targetY = targetY;
    }
    var d = __define,c=PlayerMoveState,p=c.prototype;
    p.onEnter = function () {
        this._player._modeText.text = "Now is moving";
        //var body = new Body("Move");
        //this._player._body.gotoAndPlay("run", -1);
        this._player._body.reset();
        this._player._body.mode = "Run";
        var tw = egret.Tween.get(this._player._body);
        tw.to({ x: this._targetX, y: this._targetY }, 500).call(this._player.idle, this._player);
    };
    return PlayerMoveState;
}(PlayerState));
egret.registerClass(PlayerMoveState,'PlayerMoveState');
var PlayerIdleState = (function (_super) {
    __extends(PlayerIdleState, _super);
    function PlayerIdleState() {
        _super.apply(this, arguments);
    }
    var d = __define,c=PlayerIdleState,p=c.prototype;
    p.onEnter = function () {
        //this._player._body.gotoAndPlay("idle");
        // var body = new Body("Idle");
        this._player._body.reset();
        this._player._body.mode = "Idle";
        this._player._modeText.text = "Now is idling";
    };
    return PlayerIdleState;
}(PlayerState));
egret.registerClass(PlayerIdleState,'PlayerIdleState');
//# sourceMappingURL=Main.js.map