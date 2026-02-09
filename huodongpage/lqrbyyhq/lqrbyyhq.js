// huodongpage/lqrbyyhq/lqrbyyhq.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponId: 1 // 优惠券ID，可根据实际需求调整
  },

  /**
   * 领取优惠券
   */
  receiveCoupon() {
    const openid = wx.getStorageSync('openid');
    wx.showLoading({
      title: '领取中...'
    });
    req({
      url: util.baseUrl + "/newapi/api/coupon/receivecoupon",
      method: "post",
      data: {
        openid: openid,
        couponId: this.data.couponId
      },
      success: res => {
        wx.hideLoading();
        if (res.data.status) {
          wx.showToast({
            title: '领取成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '/subpackagesC/yhq/yhq',
            })
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none'
          });
        }
      }
    })

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