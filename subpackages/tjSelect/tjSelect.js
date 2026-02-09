// pages/danweitijian/danweitijian.js
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
    array: ['已婚', '未婚'],
    sexList: ['男', '女'],
    hunyin: "",
    timeList: [],
    time: "",
    sex: "",
    xinmin: "",
    mobile: "",
    cardno: "",
    corp: "",
    fromsource: "",
    openid: "",
    ptype: 19
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
  },
  rgerentj(){
    wx.myNavigateToz({
      url: '../../pages/gerentijian/gerentijian',
    })
  },
  rMyYy2(){
    wx.myNavigateToz({
      url: '../../pages/yuyue/yuyue?type=2',
    })
  },
  rdanweitj(){
    wx.myNavigateToz({
      url: '../../pages/danweitijian/danweitijian',
    })
  },
  rgongwutj(){
    wx.myNavigateToz({
      url: '../gongwuyuantijian/gongwuyuantijian',
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