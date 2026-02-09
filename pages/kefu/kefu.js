// pages/kefu/kefu.js
const util = require('../../utils/util')
const { req } = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: "",
    password: ""
  },
  submit() {
    console.log(this.data)
    req({
      url: util.baseUrl + '/newapi/api/zxzt/userlogin',
      method: 'POST',
      data: {
        mobile: this.data.mobile,
        password: this.data.password
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          })
          wx.setStorageSync('kefuMobile', this.data.mobile)
          wx.navigateTo({
            url: '../kefuList/kefuList',
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'error',
            duration: 2000
          })
        }
      }
    })
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let kefuMobile= wx.getStorageSync('kefuMobile');
    if(kefuMobile){
      this.setData({
        mobile:kefuMobile
      })
    }
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