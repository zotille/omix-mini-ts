"use strict";
exports.__esModule = true;
//index.js
//获取应用实例
var app = getApp();
var index_1 = require("../../store/index");
index_1.create(index_1.store, {
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    //事件处理函数
    onTap: function () {
        index_1.store.data.data += 1;
        wx.navigateTo({
            url: '../second/index'
        });
    },
    onLoad: function () {
    }
});
