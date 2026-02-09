// pages/realInfo/readlInfo.js
const { req } = require('../../utils/request');
const util = require('../../utils/util')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    realname: "",
    cardno: "",
    mobile: "",
    privacyAgreed: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面加载时检查是否已有用户信息
    const realInfo = wx.getStorageSync('realInfo') || {};
    const hasExistingInfo = realInfo.realname || realInfo.mobile;
    
    if (hasExistingInfo) {
      this.setData({
        realname: realInfo.realname || "",
        cardno: realInfo.cardno || "",
        mobile: realInfo.mobile || "",
        privacyAgreed: true
      });
    }
  },
  ryinsi(){
    wx.navigateTo({
      url: '../yinsi/yinsi',
    })
  },
  
  // 隐私协议勾选状态变化
  onPrivacyChange(e) {
    const values = e.detail.value;
    this.setData({
      privacyAgreed: values.includes('agree')
    });
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
    const realInfo = wx.getStorageSync('realInfo') || {};
    const hasExistingInfo = realInfo.realname || realInfo.mobile;
    
    this.setData({
      realname: realInfo.realname || "",
      cardno: realInfo.cardno || "",
      mobile: realInfo.mobile || "",
      // 如果已有填写信息，默认勾选隐私协议
      privacyAgreed: hasExistingInfo
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  submit() {
    if (!this.data.realname  || !this.data.mobile) {
      wx.showToast({
        title: "请输入完整信息"
      })
      return;
    }
    
    // 验证是否勾选隐私协议
    if (!this.data.privacyAgreed) {
      wx.showToast({
        title: "请先同意用户隐私协议",
        icon: "none"
      })
      return;
    }
    // if(this.data.cardno.length!==18){
    //   wx.showToast({
    //     title: '身份证为18位',
    //   })
    //   return;
    // }
    req({
      url: util.baseUrl + '/newapi/api/WechatUser/setmobile',
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile
      },
      success: () => {
        req({
          url: util.baseUrl + '/newapi/api/WechatUser/setrealnamecard',
          method: "POST",
          data: {
            openid: wx.getStorageSync('openid'),
            realname: this.data.realname,
            cardno: this.data.cardno
          },
          success() {
            req({
              url: util.baseUrl + '/newapi/api/WechatUser/getuserinfo',
              data: {
                openid: wx.getStorageSync('openid')
              },
              success: resss => {
                if (resss.data.data) {
                  wx.setStorageSync('realInfo', {
                    ...wx.getStorageSync('realInfo'),
                    ...resss.data.data
                  })
                }
                wx.navigateBack()
              }
            })
          }
        })
      }
    })
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