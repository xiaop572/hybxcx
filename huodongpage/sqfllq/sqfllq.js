// huodongpage/sqfllq/sqfllq.js - 医美福利页面
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReceived: false, // 是否已领取
    coupons: [
      { type: 'discount', value: '8', unit: '折', desc: '医美项目' },
      { type: 'price', value: '500', unit: '元', desc: '代金券' },
      { type: 'coupon', text: '满1000-200' },
      { type: 'coupon', text: '免费体验' },
      { type: 'coupon', text: '专家咨询' }
    ]
  },

  /**
   * 领取福利
   */
  receiveWelfare() {
    if (this.data.isReceived) {
      wx.showToast({
        title: '您已领取过福利',
        icon: 'none'
      });
      return;
    }

    // 检查用户登录状态
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '../../pages/login/login'
        });
      }, 1500);
      return;
    }

    wx.showLoading({
      title: '领取中...'
    });

    // 调用领取福利接口
    req({
      url: util.baseUrl + "/newapi/api/welfare/receive",
      method: "POST",
      data: {
        openid: openid,
        welfareType: 'medical_beauty_welfare'
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.status) {
          this.setData({
            isReceived: true
          });
          wx.showToast({
            title: '领取成功！',
            icon: 'success'
          });
          // 可以跳转到优惠券页面
          setTimeout(() => {
            wx.navigateTo({
              url: '../../subpackagesC/yhq/yhq'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg || '领取失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 查看活动规则
   */
  showRules() {
    wx.showModal({
      title: '活动规则',
      content: '1. 新用户可领取医美福利礼包\n2. 福利包含医美项目折扣券和代金券\n3. 优惠券有效期60天，请及时使用\n4. 每个用户仅限领取一次\n5. 需到店验证身份后使用',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查用户是否已领取过福利
    this.checkWelfareStatus();
  },

  /**
   * 检查福利领取状态
   */
  checkWelfareStatus() {
    const openid = wx.getStorageSync('openid');
    if (!openid) return;

    req({
      url: util.baseUrl + "/newapi/api/welfare/checkStatus",
      method: "POST",
      data: {
        openid: openid,
        welfareType: 'medical_beauty_welfare'
      },
      success: (res) => {
        if (res.data.status && res.data.data.isReceived) {
          this.setData({
            isReceived: true
          });
        }
      }
    });
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