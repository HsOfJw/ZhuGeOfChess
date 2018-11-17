let UIMgr = require("UIMgr");
cc.Class({
    extends: cc.Component,

    properties: {},

    onBtnClickClose() {
        UIMgr.destroyUI(this);
    },


});
