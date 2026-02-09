// pages/login/login.js
const util = require('../../utils/util');
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  getUserInfo() {

    // 登录

    wx.getUserProfile({
      desc: "一键授权登录",
      success: (res) => {
        let userInfo = res.userInfo;
        wx.setStorageSync('userInfo', res.userInfo);
        wx.request({
          url: util.baseUrl + '/newapi/api/WechatUser/gettoken',
          method: "POST",
          data: {
            ...userInfo,
            gender: String(userInfo.gender),
            js_code: "",
            openid: wx.getStorageSync('openid')
          },
          success: ress => {
            wx.setStorageSync('token', ress.data.data);
            req({
              url: util.baseUrl + '/newapi/api/WechatUser/getuserinfo',
              data: {
                openid: wx.getStorageSync('openid'),
                token:ress.data.data
              },
              success: resss => {
                if (resss.data.data) {
                  wx.setStorageSync('realInfo', resss.data.data),
                    wx.setStorageSync('isLogin', true);
                }else{
                  wx.showToast({
                    title: '登录错误',
                  })
                  return;
                }
                req({
                  url: util.baseUrl + "/newapi/api/WechatUser/getqrinfo",
                  data: {
                    openid: wx.getStorageSync('openid')
                  },
                  success: reso => {
                    if (resss.data.data) {
                      wx.navigateBack(-1)
                      wx.setStorageSync('qrinfo', reso.data.data)
                    }
                  }
                })
                // wx.switchTab({
                //   url: '../index/index',
                // })
              }
            })

          }
        })
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
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

  }
})