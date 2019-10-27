const app = getApp()
import { create } from '../../dist/index'
import store from '../../store'

create(store, {
  data: {
  },
  onTap: function () {
    store.data.data += 1;
    store.freshColor();
    wx.navigateBack()
  },
  onLoad: function () {
  }
})
