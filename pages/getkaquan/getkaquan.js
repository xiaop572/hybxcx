// pages/getkaquan/getkaquan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    mobile: "",
    kaitem: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      options: options
    })
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { //登录拦截
      wx.showToast({
        title: '请登录',
        success() {
          setTimeout(() => {
            wx.navigateTo({
              url: '../login/login',
            })
          }, 1000)
        }
      })
      return;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getka() {
    if (!this.data.options.orderno || !this.data.options.orgopenid || !wx.getStorageSync('userInfo')) {
      wx.showToast({
        title: '接收出错',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/pack/moveorder2user",
      method: "POST",
      data: {
        ...this.data.options,
        newopenid: wx.getStorageSync('openid'),
        mobile: ""
      },
      success: res => {
        console.log(res)
        if (res.data.status) {
          wx.showToast({
            title: '获取成功'
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '../kaquan/kaquan',
            })
          }, 2000);
        }else{
          wx.showModal({
            showCancel: false,
            title: "提示",
            content: res.data.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    req({
      url: util.baseUrl + "/newapi/api/pack/getorderstatus",
      method: "POST",
      data: {
        orderno: this.data.options.orderno,
        orgopenid: this.data.options.orgopenid
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            kaitem: res.data.data
          })
        } else {
          wx.showToast({
            title: '该卡券已领取',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../index/index',
            })
          }, 2000)
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
    return{
      title:"您的好友送您一张卡券",
      imageUrl:"https://wx.pmc-wz.com/hyb/images/"+this.data.options.imgsrc,
      path: '/pages/getkaquan/getkaquan?orderno='+this.data.options.orderno+'&orgopenid='+wx.getStorageSync('openid'),
    }
  }
})