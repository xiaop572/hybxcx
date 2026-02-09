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
    let realinfo=wx.getStorageSync('realInfo')
    this.setData({
      item: app.globalData.pttc
    })
    if(realinfo.realname){
      this.setData({
        name:realinfo.realname,
        phone:realinfo.mobile
      })
    }

  },
  payment() {
    let that = this;
    let ptid = wx.getStorageSync('ptid');
    if (!this.data.name || !this.data.phone) {
      wx.showToast({
        title: '请填写姓名手机',
      })
      return;
    }
    wx.showLoading({
      title: '加载中...'
    })
    req({
      url: util.baseUrl + "/newapi/api/pt/pintuanpay",
      method: "POST",
      data: {
        "summary": "",
        "orderTitle": that.data.item.pictitle,
        "OutTradeNo": String(+new Date()),
        "TotalFee": that.data.item.price,
        "openId": wx.getStorageSync('openid'),
        "xinmin": that.data.name,
        "mobile": that.data.phone,
        "Source": wx.getStorageSync('sponsor'),
        "ptype": 18,
        "proid": that.data.item.id,
        "spes": that.data.item.selSpec,
        "ptid": ptid ? ptid : 0
      },
      success: (res) => {
        if (res.data.status) {
          wx.requestPayment({
            ...res.data.data,
            success: (ress) => {
              if (ress.errMsg === "requestPayment:ok") {
                wx.showToast({
                  title: '支付成功'
                })
                if (res.data.otherData) {
                  wx.redirectTo({
                    url: res.data.otherData,
                  })
                } else {
                  wx.redirectTo({
                    url: '../pintuanbuy/pintuanbuy?id=' + that.data.item.id + "&ptid=" + res.data.code,
                  })
                }
              }
            },
            fail(res) {

            }
          })
        }else{
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showModal({
            showCancel: false,
            title: "提示",
            content: res.data.msg
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