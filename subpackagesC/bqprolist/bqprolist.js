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
    priceSort: false,
    groupid:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(options.groupid){
      this.setData({
        groupid:options.groupid
      })
    }else{
      wx.showToast({
        title: '请扫二维码进入',
      })
      return;
    }
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      if (options.scene.length == 2) {
        options.id = options.scene
      } else {
        let arr = options.scene.split('&');
        if (arr.length < 2) {
          arr = options.scene.split('%26');
        }
        wx.setStorageSync('sponsor', arr[0]);
      }

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
      ptype: 126
    })
    this.getPro()
  },
  getPro() {
    req({
      url: util.baseUrl + "/newapi/api/goods/goodspagelist",
      method: "POST",
      data: {
        "stype": this.data.ptype,
        "curpage": 1,
        "limit": 99999,
        "searchkey": "",
        "sort": this.data.sortIndex,
        groupid:String(this.data.groupid)
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
    console.log(e)
    let app = getApp();
    app.globalData.tc = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: "/subpackagesC/gyyjiesuan/gyyjiesuan"
    })
  },
  rkaquan(e) {
    wx.myNavigateTo({
      url: "/pages/kaquan/kaquan?index=" + e.currentTarget.dataset.index
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