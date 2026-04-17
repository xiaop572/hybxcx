// subpackages/tcshiyong/tcshiyong.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowKeyboard: true,
    plate: [],
    parkcode: "",
    mobile: "",
    carcode: "",
    youxuanList: []
  },
  getTimestampFromOptions(options) {
    if (options && options.timestamp) {
      return options.timestamp
    }
    if (!options || !options.scene) {
      return ""
    }
    const sceneText = decodeURIComponent(options.scene)
    const parts = sceneText.split('&')
    for (let i = 0; i < parts.length; i++) {
      const kv = parts[i].split('=')
      if (kv[0] === 'timestamp' && kv[1]) {
        return kv[1]
      }
    }
    return ""
  },
  validateTimestampOrBack(options) {
    const tsText = this.getTimestampFromOptions(options)
    if (!tsText) {
      wx.showModal({
        title: '提示',
        content: '请扫描二维码进入页面',
        showCancel: false,
        complete: () => {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      })
      return false
    }
    let ts = Number(tsText)
    if (!Number.isFinite(ts)) {
      wx.showModal({
        title: '提示',
        content: '请扫描二维码进入页面',
        showCancel: false,
        complete: () => {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      })
      return false
    }
    if (ts < 1000000000000) {
      ts = ts * 1000
    }
    const diff = Date.now() - ts
    const expireMs = 1 * 60 * 60 * 1000
    if (diff > expireMs) {
      wx.showModal({
        title: '提示',
        content: '此二维码失效',
        showCancel: false,
        complete: () => {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      })
      return false
    }
    return true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!this.validateTimestampOrBack(options)) {
      return
    }
    // wx.showModal({
    //   title: '提示',
    //   content: '此功能已下线，如有问题联系对应科室',
    //   showCancel:false,
    //   complete: (res) => {
    //     wx.switchTab({
    //       url: '/pages/index/index',
    //     })
    //   }
    // })
    this.setData({
      parkcode: options.parkcode
    })
    let userInfo = wx.getStorageSync('userInfo');
    this.getyouxuanPro()
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请登录',
        showCancel: false,
        complete: (res) => {
          wx.navigateTo({
            url: '../../pages/login/login',
          })
        }
      })
    }
  },
  rtcxq2(e){
      wx.navigateTo({
        url: "../../pages/tcxq/tcxq?id=" + e.currentTarget.dataset.id
      })
  },
  getyouxuanPro() {
    req({
      url: util.baseUrl + "/frontapi/api/goods/getyouxuanlist",
      method: "POST",
      data: {
        limit: 4
      },
      success: res => {
        this.setData({
          youxuanList: res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  cpjpfalse() {
    this.setData({
      isShowKeyboard: false
    })
  },
  cpjptrue() {
    this.setData({
      isShowKeyboard: true
    })
  },
  onPlateKeyboardValueChange(e) {
    this.setData({
      plate: e.detail
    })
  },
  submit() {
    if (this.data.plate.length < 7) {
      wx.showModal({
        title: '提示',
        content: '请填写正确车牌',
        showCancel: false,
        success(res) {}
      })
      return;
    }
    let params = {
      openId: wx.getStorageSync('openid'),
      carcode: this.data.plate.join("")
    }
    req({
      url: util.baseUrl + "/newapi/api/car/freeparkuse",
      method: "POST",
      data: params,
      success: (res) => {
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false,
            success:()=>{
              wx.switchTab({
                url: '../../pages/index/index',
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false,
            success:()=>{
            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
