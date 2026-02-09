// pages/basicPro/basicPro.js
var app = getApp()
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    sortIndex:0,
    priceSort: false,
    searchKey:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that =this;
    this.setData({
      list:app.globalData.searchList,
      searchKey:app.globalData.searchKey
    })
  },
  rSearch(){
    wx.redirectTo({
      url: '../search/search',
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
      url: "../tcxq/tcxq?id=" + e.currentTarget.dataset.id
    })
  },
  getPro() {
    req({
      url: util.baseUrl + "/newapi/api/goods/goodspagelist",
      method: "POST",
      data: {
        "stype": this.data.ptype,
        "curpage": 1,
        "limit": 99999,
        "searchkey": this.data.searchKey,
        "sort": this.data.sortIndex
      },
      success: res => {
        this.setData({
          list: res.data.data
        })
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