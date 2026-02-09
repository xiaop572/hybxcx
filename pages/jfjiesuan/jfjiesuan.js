// pages/jiesuan/jiesuan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    name: "",
    phone: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let app = getApp();
    console.log(app)
    this.setData({
      item: app.globalData.tc
    })
  },
  payment() {
    wx.showModal({
      title: '提示',
      content: '您是否要兑换该产品？',
      success:(res) =>{
        if (res.confirm) {
          this.pay()
        } else if (res.cancel) {}
      }
    })

  },
  pay() {
    let that = this;
    if (!this.data.name || !this.data.phone) {
      wx.showToast({
        title: '请填写姓名手机',
      })
      return;
    }
    let params = {
      proid: this.data.item.id,
      OutTradeNo: String(+new Date()),
      TotalJifen: this.data.item.paypoint,
      openId: wx.getStorageSync('openid'),
      Source: wx.getStorageSync('sponsor'),
      xinmin: this.data.name,
      mobile: this.data.phone
    }
    req({
      url: util.baseUrl + "/newapi/api/jifen/jifenpay",
      method: "POST",
      data: params,
      success: resolve => {
        if (resolve.data.status) {
          wx.showToast({
            title: resolve.data.msg,
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/subpackages/mycard/mycard',
            })
          }, 2000)
        } else {
          wx.showModal({
            title: '提示',
            content: resolve.data.data,
            showCancel:false,
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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