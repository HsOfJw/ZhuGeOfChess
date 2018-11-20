require('ald-game');
let UIMgr = require("UIMgr");
let GameData = require("GameData");
let AudioMgr = require("AudioMgr");
let AudioPlayer = require("AudioPlayer");
let GameLocalStorage = require("GameLocalStorage");
let JsonFileCfg = require("JsonFileCfg");
cc.Class({
    extends: cc.Component,

    properties: {
        addNode: {displayName: "添加子节点", default: null, type: cc.Node},
        foreWord: {displayName: "前言", default: null, type: cc.Prefab},
        shadeToggle: {displayName: "震动", default: null, type: cc.Toggle},
        soundToggle: {displayName: "音效", default: null, type: cc.Toggle},
        enterGameBtn: {displayName: "开始游戏按钮", default: null, type: cc.Node},

        inviteButton: {displayName: "邀请按钮", default: null, type: cc.Button},
        moreGameButton: {displayName: "更多游戏按钮", default: null, type: cc.Button},
    },

    onLoad() {
        let self = this;

        //获取配置文件
        /*if (window.wx != undefined) {

            wx.showShareMenu();
            wx.request({
                url: 'https://gather.51weiwan.com/api/app/getConfig',
                data: {
                    game_id: 6,
                },
                success: function (res) {
                    if (res.data.errno == 0) {//返回结果正确
                        let invite_friend = res.data.data.invite_friend;
                        if (invite_friend == 0) {//关闭
                            self.inviteButton.node.active = false;
                        } else {
                            self.inviteButton.node.active = true;
                        }
                        //存储分享相关信息
                        GameData.appId = res.data.data.app_id;
                        GameData.share = res.data.data.share;
                        //更改更多游戏的logo
                        self._loadMoreGameSprite(res.data.data.more_img);

                        //设置转发的标题和image
                        self._setShareAppMessage(res.data.data.share);

                    } else {
                        console.log("服务器获取配置文件返回信息错误");
                    }
                    console.log("服务器获取配置文件返回相应数据", res);
                    console.log("测试分享相关的数据", res.data.data.share);
                    console.log("测试分享相关的数据", res.data.data.share['1']);
                    console.log("测试分享相关的数据", res.data.data.share['2'])
                    ;
                },
            })
        }*/

        GameLocalStorage.initLocalStorage();
        JsonFileCfg.initJson();
        this.addNode.removeAllChildren();

        let isGreenHand = GameLocalStorage.getUid();
        if (!isGreenHand) {//新手
            this.enterGameBtn.active = false;
            UIMgr.createPrefab(this.foreWord, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
            console.log("[LoginScene]  onLoad 判定内存中不存在uid 开始执行微信登录 获取设备信息");

        } else {
            this.enterGameBtn.active = true;
        }
        this.soundToggle.isChecked = GameData.playerGameState.soundOn;
        this.shadeToggle.isChecked = GameData.playerGameState.shakeOn;
        this.onBtnClickSound();
        this.onBtnClickShake();
        if (cc.sys.isBrowser) {
            this.enterGameBtn.active = true;
        }


        let watchVideoInfo = cc.sys.localStorage.getItem("watchVideoInfo_zhuGeOfChess");
        console.log("[LoginScene] watchVideoInfo_zhuGeOfChess=", watchVideoInfo);
        if (watchVideoInfo) {
            GameData.watchVideoInfo.watchVideoCount = watchVideoInfo.watchVideoCount;
        } else {
            GameData.watchVideoInfo.watchVideoCount = 0;
        }


        let currentDate = new Date().toLocaleDateString();
        let isToday = cc.sys.localStorage.getItem("isToday_zhuGeOfChess");
        if (!isToday || isToday !== currentDate) {
            //重置  说明是新的一天
            console.log("[LoginScene] 当前天数是新的一天");
            cc.sys.localStorage.setItem("isToday_zhuGeOfChess", currentDate);
            GameData.watchVideoInfo.watchVideoCount = 0;
            cc.sys.localStorage.setItem("watchVideoInfo_zhuGeOfChess", GameData.watchVideoInfo);
        }

    },
    start() {
    },


    _setShareAppMessage(data) {
        if (data['5']) {
            wx.aldOnShareAppMessage(function () {
                return {
                    title: data['5'].info.share_title,
                    imageUrl: data['5'].info.share_img,
                }
            })
        } else {
            wx.aldOnShareAppMessage(function () {
                return {
                    title: "穿越成诸葛亮，你能改变天下吗？！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    }),
                }
            })
        }
    },

    _loadMoreGameSprite(remoteUrl) {
        let self = this;
        let image = wx.createImage();
        //image.onload = () => {
        image.onload = function () {
            try {
                console.log("11111");
                let texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                let sp = new cc.SpriteFrame(texture);
                console.log(self.moreGameButton.node.width + "---->" + sp.getOriginalSize().width);
                console.log("远程加载的图片的缩放值是", self.moreGameButton.node.width / sp.getOriginalSize().width);
                self.moreGameButton.node.setScale(self.moreGameButton.node.width / sp.getOriginalSize().width);
                self.moreGameButton.getComponent(cc.Sprite).spriteFrame = sp;

            } catch (e) {
                cc.log("加载更多游戏的图标失败", e);
                self.moreGameButton.node.active = false;
            }
        };
        image.src = remoteUrl;
    },


    onBtnClickCannot() {
    },
    onBtnClickEnterGame() {
        GameData.enterMainWay = "loginToMain";
        cc.director.loadScene("MainScene");
    },
    onBtnClickShare() {
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
                    success: self.shareSuccess()
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
                    success: self.shareSuccess()
                })
            }
        }

    },

    shareSuccess() {
        console.log("登录页面分享成功");
    },
    onBtnClickMoreGame() {
        if (window.wx != undefined) {
            wx.navigateToMiniProgram({
                appId: GameData.appId,
                path: '',
                envVersion: 'release',
                success: function () {
                    console.log("跳转到更多游戏成功");
                },
                fail: function (res) {
                    console.log("跳转到更多游戏失败", res);
                },
            })
        }
    },
    onBtnClickSound() {
        if (this.soundToggle.isChecked) {
            console.log("音效关闭");
            AudioPlayer.stopCurrentBackGroundMusic();
            GameData.playerGameState.soundOn = true;

        } else {
            console.log("音效打开");
            AudioMgr.playMainMusic();
            GameData.playerGameState.soundOn = false;
        }
    },
    onBtnClickShake() {
        if (this.shadeToggle.isChecked) {
            console.log("震动关闭");
            GameData.playerGameState.shakeOn = true;
        } else {
            console.log("震动开启");
            GameData.playerGameState.shakeOn = false;
        }
    },

});
