// subpackages/skipPage/skipPage.js
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
    currentIndex: 0,
    xlList:[],
    proList:[],
    renqiList:[],
    xpList:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getPro()
    this.getxiaoliang();
    this.getrenqi();
    this.getxinpin()
  },
  rAcrossBasicPro(e) {
    wx.myNavigateTo({
      url: "../../pages/acrossBasicPro/acrossBasicPro?mername=" + e.currentTarget.dataset.mername + "&id=" + e.currentTarget.dataset.id
    })
  },
  rBasicPro(e) {
    console.log(e)
    wx.navigateTo({
      url: "../../pages/basicPro/basicPro?mername=" + e.currentTarget.dataset.mername + "&id=" + e.currentTarget.dataset.id
    })
  },
  rZjjs() {
    wx.myNavigateTo({
      url: '../../pages/zjjs/zjjs'
    })
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
    })
  },
  pagechange: function (e) {
    // 通过touch判断，改变tab的下标值
    if ("touch" === e.detail.source) {
      let currentPageIndex = this.data.currentIndex;
      currentPageIndex = e.detail.current;
      // 拿到当前索引并动态改变
      this.setData({
        currentIndex: currentPageIndex,
      })
    }
  },
  getPro() {
    req({
      url: util.baseUrl + "/newapi/api/goods/goodspagelist",
      method: "POST",
      data: {
        "stype": 64,
        "curpage": 1,
        "limit": 3,
        "searchkey": "",
        "sort": this.data.sortIndex
      },
      success: res => {
        this.setData({
          proList: res.data.data
        })
      }
    })
  },
  getxiaoliang(){
    req({
      url: util.baseUrl + "/newapi/api/goods/goodsalenum",
      method: "POST",
      data: {
        "limit": 3,
      },
      success: res => {
        this.setData({
          xlList: res.data.data
        })
      }
    })
  },
  getrenqi(){
    req({
      url: util.baseUrl + "/newapi/api/goods/goodsrenqi",
      method: "POST",
      data: {
        "limit": 3,
      },
      success: res => {
        this.setData({
          renqiList: res.data.data
        })
      }
    })
  },
  getxinpin(){
    req({
      url: util.baseUrl + "/newapi/api/goods/goodsxpss",
      method: "POST",
      data: {
        "limit": 3,
      },
      success: res => {
        this.setData({
          xpList: res.data.data
        })
      }
    })
  },
  rtcxq(e) {
    wx.navigateTo({
      url: "../../pages/tcxq/tcxq?id=" + e.currentTarget.dataset.id
    })
  },
  rSearch(){
    wx.navigateTo({
      url: '../search/search',
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected:1
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})