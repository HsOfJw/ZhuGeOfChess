let UIMgr = require("UIMgr");
let GameData = require("GameData");
let GameLocalStorage = require("GameLocalStorage");
cc.Class({
    extends: cc.Component,

    properties: {
        indexLabel: {displayName: "", default: null, type: cc.Label},
        bgDirectButton: {displayName: "", default: null, type: cc.Button},
        directButton: {displayName: "跳过按钮", default: null, type: cc.Button},
    },
    onLoad() {
        /*
         this.indexLabel.string="前言:";
        this.directButton.node.active = false;
        this._labelArray = ["参", "与", "本", "游", "戏", "的", "玩",
            "家", "中,", "5", "3", "%", "的", "人", "挑", "战", "失", "败,",
            "4", "6", "%", "的", "人", "选", "择", "放", "弃,", "你", "能", "成", "为", "那", "1", "%", "吗？"];
        this._index = 0;
        this.schedule(this._dynamicShowLabel, 0.3);
        this.bgDirectButton.interactable = false;
        this.scheduleOnce(function () {
            this.bgDirectButton.interactable = true;
            this.directButton.node.active = true;
        }, 11);*/
    },

    onBtnClickDirectForeWord() {
        UIMgr.destroyUI(this);
        let self = this;
        if (window.wx != undefined) {
            //微信登录
            wx.login({
                success: function (res) {
                    console.log("success login", res);
                    if (res.code) {
                        self.resCode = res.code;
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg)
                    }
                }
            });
            //调用微信接口 获取设备信息
            wx.getSystemInfo({
                success: function (res) {
                    console.log("获取设备信息", res);
                    self.model = res;
                    let modelWidth = self.model.windowWidth;
                    let modelHeight = self.model.windowHeight;
                    let buttonWidth = 175 * (modelWidth / (cc.winSize.width));
                    let buttonHeight = 70 * (modelHeight / (cc.winSize.height));
                    let buttonLeft = modelWidth / 2 - 21;
                    let buttonTop = modelHeight / 2 + 75;
                    console.log("创建button按钮");
                    let button = wx.createUserInfoButton({
                        type: 'image ',
                        image: 'http://gather.51weiwan.com//uploads//file//20180728//0972ca89c40fdfd212ec4dd8af1e8ac3.png',
                        style: {
                            left: buttonLeft,
                            top: buttonTop,
                            width: buttonWidth,
                            height: buttonHeight,
                            //lineHeight: 40,
                            //backgroundColor: '#705443',
                            //color: '#ffffff',
                            //textAlign: 'center',
                            //fontSize: 16,
                            //borderRadius: 4
                        }
                    });
                    console.log("button 按钮信息", button);
                    button.onTap((res) => {
                        if (window.wx) {
                            wx.aldSendEvent('authorization', {'authorization': new Date()});
                        }
                        if (res.errMsg == "getUserInfo:ok") {
                            wx.aldSendEvent('authorizationSuccess', {'authorizationSuccess': new Date()});
                            //数据交互
                            console.log("点击按钮获取到的用户信息", res);
                            wx.request({
                                url: 'https://gather.51weiwan.com/api/login/index',
                                data: {
                                    code: self.resCode,
                                    game_id: 6,
                                    iv: res.iv,
                                    encryptedData: res.encryptedData,
                                },
                                success: function (res) {
                                    if (res.data.errno == 0) {//返回结果正确
                                        wx.aldSendEvent('authorizationSuccess', {'authorizationSuccess': new Date()});
                                        button.destroy();
                                        self.loginSuccess(res.data.data);
                                    } else {
                                        console.log("服务器错误，请重新尝试", res.data.errmsg);
                                    }

                                    console.log("服务器相应数据", res);
                                },
                            })
                        }else{
                            wx.aldSendEvent('rejectAuthorizationSuccess', {'rejectAuthorizationSuccess': new Date()});
                        }
                        console.log("点击button 按钮的返回值", res);
                    })
                }
            })
        }
    },
    //第一次进入到游戏中
    loginSuccess(data) {
        console.log("退出登录流程，开始执行游戏逻辑");
        GameData.enterMainWay = "loginToMain";
        GameData.playInfo.uid = data.uid;
        GameData.playInfo.nickName = data.nickName;
        GameData.playInfo.avatarUrl = data.avatarUrl;
        GameData.playInfo.gender = data.gender;
        cc.director.loadScene("MainScene");
    },
    _dynamicShowLabel() {
        this.indexLabel.string += this._labelArray[this._index];
        this._index++;
        if (this._index === this._labelArray.length) {
            this.unschedule(this._dynamicShowLabel);
        }
    }
});
