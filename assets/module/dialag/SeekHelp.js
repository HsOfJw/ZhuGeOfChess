let UIMgr = require("UIMgr");
let GameData = require("GameData");
cc.Class({
    extends: cc.Component,

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },
    onBtnClickTalkLater() {
        UIMgr.destroyUI(this);

    },
    onBtnClickShareNow() {

        let self = this;
        let shareInfo = GameData.share;
        if (shareInfo['2']) {
            console.log("分享取服务端数据", shareInfo['2']);
            let title = shareInfo['2'].info.share_title;
            let imageUrl = shareInfo['2'].info.share_img;

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
        console.log("求助分享成功");
    },

    // update (dt) {},
});
