// pages/yyhd-zf/yyhd-zf.js
const { req } = require('../../utils/request')
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    exList: [],
    mobile: "",
    active: false,
    item: {
      picurl: ""
    }
  },
  showPlace(e) {
    this.setData({
      active: !this.data.active
    })
  },
  submit() {
    if (this.data.mobile) {
      req({
        url: util.baseUrl + '/newapi/api/msg/prepaywexin',
        method: "POST",
        data: {
          "orderTitle": this.data.item.pictitle,
          "OutTradeNo": String(+new Date()),
          "TotalFee": this.data.item.price,
          openId: wx.getStorageSync('openid'),
          mobile: this.data.mobile,
          xinmin: "",
          ptype: Number(this.data.item.ptype)
        },
        success: (res) => {
          if (!res.data.status && res.data.msg == "此用户已经支付过一个订单") {
            wx.showToast({
              title: '该礼包已购买'
            })
            return;
          }else if (res.data.msg === '0元交易成功' && res.data.status) {
            wx.showToast({
              title: '购买成功'
            })
            setTimeout(() => {
              wx.navigateTo({
                url: '../qw/qw?id=' + this.data.item.ptype,
              })
            }, 1500)
            return;
          }
          wx.requestPayment({
            ...res.data.data,
            success: (ress) => {
              if (ress.errMsg === "requestPayment:ok") {
                wx.showToast({
                  title: '支付成功'
                })
                setTimeout(() => {
                  wx.navigateTo({
                    url: '../qw/qw?id=' + this.data.item.ptype,
                  })
                }, 1500)
              } 
            }
          })
        }
      })
    } else {
      wx.showToast({
        title: '请获取手机号'
      })
      return;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      mobile: wx.getStorageSync('realInfo').mobile
    })
    req({
      url: util.baseUrl + '/newapi/api/mindex/huodonglist',
      method: 'POST',
      data: {
        current_page: 1,
        per_page: 20,
        ptype: Number(options.id)
      },
      success: res => {
        if (res.data.Data.list.length === 0) {
          wx.showModal({
            title: '提示',
            content: '暂时没有体验活动',
            showCancel: false,
            success(res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          return;
        }
        this.setData({
          item: res.data.Data.list[0]
        })
      }
    })
  },
  getPhoneNumber(e) {
    if (e.detail.iv && e.detail.encryptedData) {
      req({
        url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile2',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: res => {
          util.setRealInfo(() => {
            this.setData({
              mobile: wx.getStorageSync('realInfo').mobile
            })
          })

        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})