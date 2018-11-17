let UIMgr = require("UIMgr");
let GameData = require("GameData");
let JsonFileMgr = require("JsonFileMgr");
let GameLocalStorage = require("GameLocalStorage");
cc.Class({
    extends: cc.Component,

    properties: {
        tips: {displayName: "提示文字", default: null, type: cc.Label},
    },


    onLoad() {
        let playerLevel = GameData.playInfo.level;
        let stageLevel = JsonFileMgr.getLevelStageTip(playerLevel);
        if (stageLevel) {
            this.tips.string = stageLevel.levelStageTip;
        }
    },
    onBtnClickSure() {
        let playerLevel = GameData.playInfo.level;
        if (playerLevel >= 8) {
            UIMgr.destroyUI(this);
        } else {
            UIMgr.destroyUI(this);
            GameData.enterMainWay = "MainToMain";
            cc.director.loadScene("MainScene");
        }
    },
    onBtnClickXiu() {


        let self = this;
        let shareInfo = GameData.share;
        if (shareInfo['3']) {
            console.log("分享取服务端数据", shareInfo['3']);
            let title = shareInfo['3'].info.share_title;
            let imageUrl = shareInfo['3'].info.share_img;

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
                        destHeight: 400,
                    }),
                    success: self.shareSuccess()
                })
            }
        }
    },
    shareSuccess() {
        console.log("游戏胜利分享成功");
    },
    // update (dt) {},
});
