// pages/myInfo/myInfo.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {

    },
    realInfo: {

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  rTian() {
    wx.redirectTo({
      url: '../realInfo/readlInfo'
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    req({
      url: util.baseUrl + '/newapi/api/WechatUser/getuserinfo',
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: resss => {
        if (resss.data.data) {
          wx.setStorageSync('realInfo', resss.data.data),
            wx.setStorageSync('isLogin', true);
        }
        // wx.switchTab({
        //   url: '../index/index',
        // })
      }
    })
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      realInfo: wx.getStorageSync('realInfo')
    }, () => {
      console.log(this.data.userInfo.gender == 0)
    })
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

  }
})