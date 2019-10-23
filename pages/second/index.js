"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var index_1 = require("../../store/index");
index_1.create(index_1.store, {
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onTap: function () {
        index_1.store.data.data += 1;
        wx.navigateBack();
    },
    onLoad: function () {
    }
});
