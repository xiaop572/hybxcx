// huodongpage/kqetj/kqetj.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kqList: [],
    etbjList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    req({
      url: util.baseUrl + "/newapi/api/topic/topicpagelist",
      method: "POST",
      data: {
        "stype": 62,
        "curpage": 1,
        "limit": 99999,
        "searchkey": "",
        "sort": 1
      },
      success: res => {
        this.setData({
          kqList: res.data.data
        })
      }
    })
    req({
      url: util.baseUrl + "/newapi/api/topic/topicpagelist",
      method: "POST",
      data: {
        "stype": 64,
        "curpage": 1,
        "limit": 99999,
        "searchkey": "",
        "sort": 1
      },
      success: res => {
        this.setData({
          etbjList: res.data.data
        })
      }
    })
  },
  rpro(e) {
    wx.navigateTo({
      url: '../../pages/tcxq/tcxq?id=' + e.currentTarget.dataset.id,
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