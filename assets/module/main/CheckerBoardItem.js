/**
 * 棋盘格子的类
 */
let ObserverMgr = require("ObserverMgr");
cc.Class({
    extends: cc.Component,
    properties: {
        id: {displayName: "id", default: null, type: cc.Label},
    },


    onLoad() {

    },
    setItemData(data) {
        this.id.string = data.id;
    },
    onBtnClickItem() {
        console.log("当前id=" + this.id.string);
        ObserverMgr.dispatchMsg("checkBoardChoose", this.id.string);
    },
    // update (dt) {},
});
