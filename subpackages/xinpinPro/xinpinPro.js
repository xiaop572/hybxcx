// pages/basicPro/basicPro.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mername: "",
    sortIndex: 1,
    ptype: 0,
    proList: [],
    priceSort: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    var that = this;
    req({
      url: util.baseUrl + "/newapi/api/goods/getonetype",
      data: {
        id: options.id
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            mername: res.data.data.typename
          }, () => {
            wx.setNavigationBarTitle({
              title: res.data.data.typename
            })
          })
        }
      }
    })
    this.setData({
      ptype: options.id
    })
    this.getPro()
  },
  getPro() {
    req({
      url: util.baseUrl + "/newapi/api/goods/goodsxpss",
      method: "POST",
      data: {
        "limit": 99999,
      },
      success: res => {
        this.setData({
          proList: res.data.data
        })
      }
    })
  },
  rSearch() {
    wx.navigateTo({
      url: '../../pages/search/search',
    })
  },
  PriceSortPro() {
    this.setData({
      sortIndex: this.data.sortIndex === 9 ? 2 : 9,
      priceSort: true
    }, () => {
      this.getPro()
    })
  },
  sortPro(e) {
    if (this.data.sortIndex !== e.currentTarget.dataset.sort) {
      this.setData({
        sortIndex: parseInt(e.currentTarget.dataset.sort),
        priceSort: false
      }, () => {
        this.getPro()
      })
    }
  },
  rtcxq(e) {
    wx.navigateTo({
      url: "../../pages/tcxq/tcxq?id=" + e.currentTarget.dataset.id
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