// subpackagesC/yhq/yhq.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    isEmpty: false,
    availableCoupons: [
      {
        id: 1,
        amount: 30,
        condition: 100,
        title: "商城30代金券",
        description: "满100元使用",
        expireTime: "2024-12-31"
      },
      {
        id: 2,
        amount: 50,
        condition: 200,
        title: "体检优惠券",
        description: "体检套餐专用",
        expireTime: "2025-01-15"
      },
      {
        id: 3,
        amount: 20,
        condition: 80,
        title: "新用户专享券",
        description: "首次购买可用",
        expireTime: "2024-12-25"
      }
    ],
    usedCoupons: [
      {
        id: 4,
        amount: 25,
        condition: 100,
        title: "商城25代金券",
        description: "满100元使用",
        useTime: "2024-11-20"
      }
    ],
    expiredCoupons: [
      {
        id: 5,
        amount: 40,
        condition: 150,
        title: "过期优惠券",
        description: "满150元使用",
        expireTime: "2024-10-31"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkEmpty();
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentTab: parseInt(index)
    });
    this.checkEmpty();
  },

  /**
   * 检查当前标签页是否为空
   */
  checkEmpty() {
    const { currentTab, availableCoupons, usedCoupons, expiredCoupons } = this.data;
    let isEmpty = false;
    
    switch (currentTab) {
      case 0:
        isEmpty = availableCoupons.length === 0;
        break;
      case 1:
        isEmpty = usedCoupons.length === 0;
        break;
      case 2:
        isEmpty = expiredCoupons.length === 0;
        break;
    }
    
    this.setData({ isEmpty });
  },

  /**
   * 获取用户未使用的优惠券
   */
  getUserUnusedCoupons() {
    req({
      url: util.baseUrl + "/newapi/api/coupon/getuserunusedcoupons",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({
            availableCoupons: res.data.data
          });
        }
        this.checkEmpty();
      },
      fail: (err) => {
        console.error('获取优惠券失败:', err);
        this.checkEmpty();
      }
    });
  },

  /**
   * 获取用户已使用的优惠券
   */
  getUserUsedCoupons() {
    req({
      url: util.baseUrl + "/newapi/api/coupon/getuserusedcoupons",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({
            usedCoupons: res.data.data
          });
        }
        this.checkEmpty();
      },
      fail: (err) => {
        console.error('获取已使用优惠券失败:', err);
        this.checkEmpty();
      }
    });
  },

  /**
   * 获取用户已过期的优惠券
   */
  getUserExpiredCoupons() {
    req({
      url: util.baseUrl + "/newapi/api/coupon/getuserexpiredcoupons",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({
            expiredCoupons: res.data.data
          });
        }
        this.checkEmpty();
      },
      fail: (err) => {
        console.error('获取已过期优惠券失败:', err);
        this.checkEmpty();
      }
    });
  },

  /**
   * 使用优惠券
   */
  useCoupon(e) {
    const couponId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/tcxq/tcxq?id='+couponId,
    })
  },

  /**
   * 将优惠券从待使用移动到已使用
   */
  moveCouponToUsed(couponId) {
    const { availableCoupons, usedCoupons } = this.data;
    const couponIndex = availableCoupons.findIndex(item => item.id === couponId);
    
    if (couponIndex !== -1) {
      const coupon = availableCoupons[couponIndex];
      // 添加使用时间
      coupon.useTime = new Date().toISOString().split('T')[0];
      
      // 从待使用中移除
      availableCoupons.splice(couponIndex, 1);
      // 添加到已使用
      usedCoupons.unshift(coupon);
      
      this.setData({
        availableCoupons,
        usedCoupons
      });
      
      this.checkEmpty();
    }
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
    this.getUserUnusedCoupons();
    this.getUserUsedCoupons();
    this.getUserExpiredCoupons();
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
    this.getUserUnusedCoupons();
    this.getUserUsedCoupons();
    this.getUserExpiredCoupons();
    wx.stopPullDownRefresh();
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