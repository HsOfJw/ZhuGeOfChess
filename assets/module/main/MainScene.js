let Observer = require("Observer");
let UIMgr = require("UIMgr");
let GameData = require("GameData");
let Tips = require("Tips");
let GameLocalStorage = require("GameLocalStorage");
let Util = require("Util");
let JsonFileMgr = require("JsonFileMgr");
let AudioPlayer = require("AudioPlayer");
let AudioMgr = require("AudioMgr");
cc.Class({
    extends: Observer,

    properties: {
        addNode: {displayName: "添加子节点", default: null, type: cc.Node},
        playMethodDemo: {displayName: "玩法演示", default: null, type: cc.Prefab},
        seekHelp: {displayName: "求助", default: null, type: cc.Prefab},
        residueChess: {displayName: "剩余棋子", default: null, type: cc.Label},
        gameVictory: {displayName: "游戏胜利", default: null, type: cc.Prefab},

        checkBoard_upContent: {displayName: "顶部节点", default: null, type: cc.Node},
        checkBoard_centerContent: {displayName: "中部节点", default: null, type: cc.Node},
        checkBoard_downContent: {displayName: "底部节点", default: null, type: cc.Node},


        arm_content: {displayName: "士兵content节点", default: null, type: cc.Node},
        checkBoard: {displayName: "格子子节点", default: null, type: cc.Prefab},
        arm: {displayName: "士兵", default: null, type: cc.Prefab},
        arm_blank: {displayName: "空节点", default: null, type: cc.Prefab},
        arm_empty: {displayName: "无信息", default: null, type: cc.Prefab},

        //新手引导相关
        guideNode_1: {displayName: "新手引导_1", default: null, type: cc.Node},
        guideNode_2: {displayName: "新手引导_2", default: null, type: cc.Node},

        currentLevel: {displayName: "当前级别", default: null, type: cc.Label},
        levelTarget: {displayName: "目标", default: null, type: cc.Label},

        leftPanel: {displayName: "侧拉板", default: null, type: cc.Prefab},
    },

    onLoad() {
        this._initMsg();
        this.initArmArray = [3, 4, 5, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
            28, 29, 30, 31, 32, 33, 34, 35, 38, 39, 40, 45, 46, 47];
        //初始化页面数据的时候  区分游戏进入到主场景的方式
        let enterMainWay = GameData.enterMainWay;
        if (enterMainWay === "loginToMain") {//数据取内存中数据
            let localLevel = GameLocalStorage.getCurrentLevel();
            GameData.playInfo.level = localLevel - 1;
            this.currentLevel.string = "第" + localLevel + "关";

            let levelTar = JsonFileMgr.getLevelStageTip(localLevel);
            if (levelTar) {
                this.levelTarget.string = "目标:剩余" + levelTar.residueChess + "颗棋子";
            }
            this.residueChess.string = GameLocalStorage.getResidueChessNum();
            let archivedFileArray = GameLocalStorage.getArchivedFile();
            //this.armArray = Util.deepCopy(archivedFileArray);
            this.armArray = archivedFileArray.slice(0);
        } else if (enterMainWay === "MainToMain") {
            this.currentLevel.string = "第" + (GameData.playInfo.level + 1) + "关";

            let levelTar = JsonFileMgr.getLevelStageTip(GameData.playInfo.level + 1);
            if (levelTar) {
                this.levelTarget.string = "目标:剩余" + levelTar.residueChess + "颗棋子";
            }

            this.residueChess.string = 32;
            this.armArray = [3, 4, 5, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27,
                28, 29, 30, 31, 32, 33, 34, 35, 38, 39, 40, 45, 46, 47];
        }
        this.checkBoardMap = new Map();//存储的是棋盘的节点信息
        this.armMap = new Map();
        this._initArmData();
        this._initPageData();

        //核心逻辑的辅助数据
        this.beforeChooseChessBoaedId = 0;

        //判断是否进行新手引导
        let isGreenHand = GameLocalStorage.getUid();
        if (!isGreenHand) {
            this.guideNode_1.active = true;
        }
    },
    //初始化每个士兵的位置信息
    _initArmData() {
        for (let k = 1; k < 48; k++) {
            let lineNumber = Math.ceil(k / 7);
            let remainder = k % 7;
            let index = remainder === 0 ? 7 : remainder;
            this.armMap.set(k, {x: -269 + 90 * (index - 1), y: 267.5 - 85 * (lineNumber - 1)});
        }
    },
    _getMsgList() {
        return [
            "checkBoardChoose"
        ];
    },
    // [子类继承接口]消息返回
    _onMsg(msg, data) {
        if (msg == "checkBoardChoose") {
            this.refreshCheckBoardBeChoose(data)
        } else if (msg === "") {
        }
    },
    refreshCheckBoardBeChoose(data) {
        //节点被按下
        for (let [k, v] of  this.armMap) {
            if (k === data) {
                let beChessArm = v.nodeInfo;
                if (beChessArm) {
                    let armItem = beChessArm.getChildByName("arm");
                    let ani = armItem.getComponent(cc.Animation);
                    if (ani) {
                        ani.play();
                    }
                }
            } else {
                let beChessArm = v.nodeInfo;
                if (beChessArm) {
                    let armItem = beChessArm.getChildByName("arm");
                    let ani = armItem.getComponent(cc.Animation);
                    if (ani) {
                        ani.stop();
                    }
                }
            }
        }


        for (let [k, v] of  this.checkBoardMap) {
            if (k !== data) {
                v.getChildByName("startMoveBlank").active = false;
            } else {
                if (this.armArray.indexOf(k) >= 0) {
                    this.beforeChooseChessBoaedId = data;
                    v.getChildByName("startMoveBlank").active = true;
                } else {
                    this._coreLogic(data);
                }
            }
        }
    },


    //点击侧拉板
    onBtnClickLeftPanel() {
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.leftPanel, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },


    onBtnClickSeekHelp() {
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.seekHelp, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },
    onBtnClickPlayMethodDemo() {
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.playMethodDemo, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },
    onBtnClickBack() {
        cc.director.loadScene("LoginScene");
    },
    onBtnClickOnFile() {
        try {
            GameLocalStorage.setCurrentLevel(GameData.playInfo.level + 1);
            //深拷贝数组
            let localArray = this.armArray.slice(0);
            GameLocalStorage.setArchivedFile(localArray);
            let residueChessNum = this.residueChess.string;
            GameLocalStorage.setResidueChessNum(residueChessNum);
            Tips.show("存档成功");
        } catch (e) {
            Tips.show(e.message);
        }
    },
    // 刷新
    onBtnClickRefresh() {
        //点击按钮 播放视频

        //弹出微信窗口
        let content = "";
        let cancelText = "";
        let confirmText = "";
        let dropStarCount = GameData.watchVideoInfo.watchVideoCount;
        if (dropStarCount >= 5) {
            //超限
            content = "分享后可重新开始游戏";
            cancelText = "不分享";
            confirmText = "去分享";
        } else {
            content = "看视频，重新开始游戏";
            cancelText = "不看";
            confirmText = "看视频";
        }
        //弹出微信窗口
        let that = this;
        if (window.wx != undefined) {
            wx.showModal({
                title: "",
                content: content,
                showCancel: true,
                cancelText: cancelText,
                confirmText: confirmText,
                success: function (res) {
                    if (res.confirm) {
                        //点击确定按钮
                        console.log("开始执行看视频或者分享流程");
                        let dropStarCount = GameData.watchVideoInfo.watchVideoCount;
                        if (dropStarCount >= 5) {
                            //超限 去分享
                            that._playToShare();

                        } else {
                            that._secondPage_watchVideo();
                        }

                    } else if (res.cancel) {
                        //点击取消
                        console.log("用户选择了不观看视频");
                    }
                }
            })
        }

    },
    _playToShare() {
        let self = this;
        let shareInfo = GameData.share;
        if (shareInfo['1']) {
            console.log("分享取服务端数据", shareInfo['1']);
            let title = shareInfo['1'].info.share_title;
            let imageUrl = shareInfo['1'].info.share_img;

            if (window.wx != undefined) {
                window.wx.aldShareAppMessage({
                    title: title,
                    imageUrl: imageUrl,
                    success: function () {
                        self.refresh();
                    }
                })
            }
        } else {
            console.log("分享取默认数据");
            if (window.wx != undefined) {
                window.wx.aldShareAppMessage({
                    title: "穿越成诸葛亮，你能改变天下吗？！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    }),
                    success: function () {
                        self.refresh();
                    }
                })
            }
        }

    },

    //执行观看视频的操作
    _secondPage_watchVideo() {
        GameData.directFun = false;



        GameData.watchVideoInfo.watchVideoCount ++;
        cc.sys.localStorage.setItem("watchVideoInfo_zhuGeOfChess", GameData.watchVideoInfo);
        //关闭背景音乐
        AudioPlayer.stopCurrentBackGroundMusic();
        if (window.wx != undefined) {

            let videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-0d7d2782a44ce830'
            });
            videoAd.show()
                .catch(err => {
                    videoAd.load()
                        .then(() => videoAd.show())
                });

            videoAd.onError(res => {
                console.log("[MainScene] 播放视频失败,失败原因", res);
                Tips.show("视频加载失败");
                AudioMgr.playMainMusic();
            });
            videoAd.onClose(res => {
                if (res && res.isEnded || res === undefined) {
                    console.log("视频播放结束，可以下发游戏奖励");
                    if (GameData.directFun) {

                    } else {
                        GameData.directFun = true;
                        this.refresh();
                    }


                }
                else {
                    console.log("用户播放视频中途退出，不下发游戏奖励")
                }
                AudioMgr.playMainMusic();
            });

        }
    },

    //刷新 重置
    refresh() {
        this.residueChess.string = 32;
        this.armArray = [3, 4, 5, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27,
            28, 29, 30, 31, 32, 33, 34, 35, 38, 39, 40, 45, 46, 47];
        this._initArm_content();
        GameData.directFun = false;
    },

    //核心逻辑的判定
    _coreLogic(data) {
        let beforeChessBoardVec = this.armMap.get(this.beforeChooseChessBoaedId);
        if (beforeChessBoardVec) {
            let currentChessBoardVec = this.armMap.get(data);
            //计算两个空格之间的距离
            let offsetX = beforeChessBoardVec.x - currentChessBoardVec.x;
            let offsetY = beforeChessBoardVec.y - currentChessBoardVec.y;
            let distanceOfChessBoard = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            let vec = {};
            vec.x = (beforeChessBoardVec.x + currentChessBoardVec.x) / 2;
            vec.y = (beforeChessBoardVec.y + currentChessBoardVec.y) / 2;
            for (let [k, v] of   this.armMap) {
                if (v.x == vec.x && v.y == vec.y && distanceOfChessBoard < 200 && this.armArray.indexOf(k) >= 0) {
                    //以下注释代码测试时使用
                    //if (v.x == vec.x && v.y == vec.y) { //此算法有bug
                    //可以跳跃
                    let beforeIndex = this.armArray.indexOf(this.beforeChooseChessBoaedId);
                    this.armArray.splice(beforeIndex, 1);
                    let index = this.armArray.indexOf(k);
                    this.armArray.splice(index, 1);
                    this.armArray.push(data);
                    //执行震动
                    let self = this;
                    if (!GameData.playerGameState.shakeOn && window.wx != undefined) {
                        wx.vibrateShort({success: self.shadeSuccess(),});
                    }
                    this._initArm_content();
                    this.residueChess.string = parseInt(this.residueChess.string) - 1;
                    this.stageVictory(this.residueChess.string);
                }

            }
        }

    },
    shadeSuccess() {
        console.log("已经发生震动");
    },

    stageVictory(residueChessNum) {
        let stageLevelItem = JsonFileMgr.getStageLevel(residueChessNum);
        let currentLevel = GameData.playInfo.level;
        if (stageLevelItem && stageLevelItem.id > currentLevel) {//跳出胜利页面
            GameData.playInfo.level = stageLevelItem.id;
            //跳转胜利页面
            this.loadGameVictoryPage();
        }
    },


    loadGameVictoryPage() {
        //过关后自动存档
        GameLocalStorage.setCurrentLevel(GameData.playInfo.level + 1);
        let armArray = [3, 4, 5, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27,
            28, 29, 30, 31, 32, 33, 34, 35, 38, 39, 40, 45, 46, 47];
        GameLocalStorage.setArchivedFile(armArray);
        GameLocalStorage.setResidueChessNum(32);

        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.gameVictory, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },
    _initPageData() {
        this._initCheckBoard();
        this._initArm_content();
    },
    _initCheckBoard() {
        this._initCheckBoard_up();
        this._initCheckBoard_center();
        this._initCheckBoard_down();
    },
    _initCheckBoard_up() {
        this.checkBoard_upContent.removeAllChildren();
        for (let i = 0; i < 6; i++) {
            let armNode = cc.instantiate(this.checkBoard);
            let script = armNode.getComponent("CheckerBoardItem");
            let id = this.initArmArray[i];
            if (script) {
                let data = {};
                data.id = id;
                script.setItemData(data);
            }
            this.checkBoardMap.set(id, armNode);
            this.checkBoard_upContent.addChild(armNode);
        }
    },
    _initCheckBoard_center() {
        this.checkBoard_centerContent.removeAllChildren();
        for (let i = 6; i < 27; i++) {
            let armNode = cc.instantiate(this.checkBoard);
            let script = armNode.getComponent("CheckerBoardItem");
            let id = this.initArmArray[i];
            if (script) {
                let data = {};
                data.id = id;
                script.setItemData(data);
            }
            this.checkBoardMap.set(id, armNode);
            this.checkBoard_centerContent.addChild(armNode);
        }
    },
    _initCheckBoard_down() {
        this.checkBoard_downContent.removeAllChildren();
        for (let i = 27; i < 33; i++) {
            let armNode = cc.instantiate(this.checkBoard);
            let script = armNode.getComponent("CheckerBoardItem");
            let id = this.initArmArray[i];
            if (script) {
                let data = {};
                data.id = id;
                script.setItemData(data);
            }
            this.checkBoardMap.set(id, armNode);
            this.checkBoard_downContent.addChild(armNode);
        }
    },
    _initArm_content() {
        this.arm_content.removeAllChildren();
        for (let i = 1; i < 48; i++) {
            if (this.initArmArray.indexOf(i) >= 0) {
                if (this.armArray.indexOf(i) >= 0) {
                    let armNode = cc.instantiate(this.arm);
                    this.arm_content.addChild(armNode);
                    let value = this.armMap.get(i);
                    value["nodeInfo"] = armNode;
                } else {
                    let arm_blankNode = cc.instantiate(this.arm_blank);
                    this.arm_content.addChild(arm_blankNode);
                }
            } else {
                let arm_emptyNode = cc.instantiate(this.arm_empty);
                this.arm_content.addChild(arm_emptyNode);
            }
        }
    },
    //新手引导
    onBtnClickGuideNode_1() {
        this.guideNode_1.active = false;
        this._onMsg("checkBoardChoose", 39);
        this.guideNode_2.active = true;
    },
    onBtnClickGuideNode_2() {
        this.guideNode_2.active = false;
        this._onMsg("checkBoardChoose", 25);
        GameLocalStorage.setUid(GameData.playInfo.uid);
    },
});
