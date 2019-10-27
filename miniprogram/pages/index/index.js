//index.js
//获取应用实例
const app = getApp()
import { create } from '../../dist/index'
import store from '../../store'

create(store, {
  data: {
  },
  //事件处理函数
  onTap: function () {
    store.data.data += 1;
    store.freshColor();
    wx.navigateTo({
      url: '../second/index'
    })
  },
  onLoad: function () {
  }
})
