const app = getApp()
import { create, store } from '../../store/index'

interface IndexData {
  motto: string
  userInfo: {}
  hasUserInfo: boolean
  canIUse: boolean
}
interface IndexOption {
  onTap: () => void
}
create<IndexData, IndexOption>(store, {
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onTap: function () {
    store.data.data += 1;
    wx.navigateBack()
  },
  onLoad: function () {
  }
})
