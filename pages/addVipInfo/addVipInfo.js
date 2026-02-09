// pages/addVipInfo/addVipInfo.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xinmin: "",
    mobile: "",
    cardno: "",
    openid: "",
    state:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let realinfo = wx.getStorageSync('realInfo');
    if (realinfo) {
      this.setData({
        xinmin: realinfo.realname,
        cardno: realinfo.cardno,
        mobile: realinfo.mobile,
        openid: wx.getStorageSync('openid')
      })
    }
    req({
      url: util.baseUrl + "/newapi/api/member/getusermember",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
          state:Number(res.data.msg)
        })
        console.log(res)
      }
    })
  },
  submit() {
    if (!this.data.openid) {
      wx.showToast({
        title: '请写登录',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '../login/login',
        })
      }, 2000)
    }
    if (this.data.cardno.length !== 18 || this.data.mobile.length !== 11 || !this.data.xinmin) {
      wx.showToast({
        title: "信息填写错误"
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/member/applyfor",
      method: "POST",
      data: {
        xinmin: this.data.xinmin,
        openid: this.data.openid,
        cardno: this.data.cardno,
        mobile: this.data.mobile
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '申请成功',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../my/my',
            })
          }, 2000)
        } else {
          wx.showToast({
            title: '开通失败',
          })
          return;
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