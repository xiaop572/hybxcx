// component/zxfc/zxfc.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ssstatus:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  changess(){
    this.setData({
      ssstatus:!this.data.ssstatus
    })
  },
  zanwu() {
    wx.showToast({
      title: '功能开发中...',
    })
  },
  fhsy() {
    wx.reLaunch({
      url: '../home/home',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  rjd() {
    this.yanzheng(() => {
      wx.navigateTo({
        url: '../../subpackagesB/jdyd/jdyd',
      })
    },'../../subpackagesB/jdyd/jdyd')
  },
  yanzheng(callback,url) {
    req({
      url: util.baseUrl + "/newapi/api/huiwu/gethwopenid",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        if (!res.data.status) {
          wx.showToast({
            title: '未注册请登录',
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '../../subpackagesB/login/login?url='+url,
            })
          }, 1500)
        } else {
          callback()
        }
      }
    })
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