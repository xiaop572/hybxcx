// pages/qiandaoHome/qiandaoHome.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    proList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options, "options")
    this.getPro();
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
  },
  getPro() {
    req({
      url: util.baseUrl + "/newapi/api/kanjia/getkjpage",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999
      },
      success: res => {
        this.setData({
          proList: res.data.data
        })
      }
    })
  },
  rkan(e) {
    wx.navigateTo({
      url: '../../subpackages/kanPro/kanPro?id=' + e.currentTarget.dataset.item.id,
    })
  },
  rpro(e) {
    wx.navigateTo({
      url: '../../pages/tcxq/tcxq?id=' + e.currentTarget.dataset.id,
    })
  },
  rfenlei() {
    wx.switchTab({
      url: '../skipPage/skipPage',
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
    wx.showToast({
      title: '活动已结束',
    })
    setTimeout(()=>{
      wx.switchTab({
        url: '/pages/index/index',
      })
    },1500)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
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
  onShareTimeline() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '慧医宝微商城正式上线！签到有礼，邀请好友全场低至9.9元起！',
      imageUrl: 'https://wx.pmc-wz.com/materials/qdban.jpg',
      path: '/pages/qiandaoHome/qiandaoHome?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline() {
    return {
      title: '慧医宝微商城正式上线！签到有礼，邀请好友全场低至9.9元起！',
      imageUrl: 'https://wx.pmc-wz.com/materials/qdban.jpg',
      path: '/pages/qiandaoHome/qiandaoHome?fromid=' + wx.getStorageSync('openid')
    }
  },
  rQiandaoMain() {
    wx.myNavigateTo({
      url: '../qiandaoMain/qiandaoMain'
    })
  }
})