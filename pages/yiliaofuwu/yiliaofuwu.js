// subpackages/yiliaofuwu/yiliaofuwu.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  rywz(){
    wx.myNavigateTo({
      url:"/subpackagesDDD/aidh/aidh"
    })
  },
  rmybka(){
    app.globalData.jumpurl = "../../subpackages/mybangka/mybangka"
    wx.myNavigateTo({
      url: '../../subpackages/mybangka/mybangka',
    })
  },
  rc13(){
    wx.myNavigateTo({
      url:"/subpackages/c13/c13"
    })
  },
  rxspdf(){
    wx.myNavigateTo({
      url: '/subpackagesC/xueshengpdf/xueshengpdf',
    })
  },
  rzybl(){
    wx.myNavigateTo({
      url: '/subpackagesC/zybl/zybl',
    })
  },
  rcflist(){
    wx.myNavigateTo({
      url:"../../subpackages/cflist/cflist"
    })
  },
  rblbg(){
    wx.myNavigateTo({
      url:"../blbg/blbg"
    })
  },
  rMyYy: function () {
    wx.myNavigateTo({
      url: '../yuyue/yuyue',
    })
  },

  rMyYy2(){
    wx.myNavigateTo({
      url: '../yuyue/yuyue?type=2',
    })
  },
  rmzyy(){
    wx.myNavigateTo({
      url:'../doctorAppoint/doctorAppoint'
    })
  },
  rtjyy(){
    wx.myNavigateTo({
      url:"../../subpackages/tjSelect/tjSelect"
    })
  },
  rtjjfdh(){
    wx.myNavigateTo({
      url:"../../subpackages/tjdhlist/tjdhlist"
    })
  },
  ryxList(){
    wx.myNavigateTo({
      url:"../../subpackages/yxList/yxList"
    })
  },
  rjianyan(){
    wx.myNavigateTo({
      url:"../../subpackages/jianyanList/jianyanList"
    })
  },
  rzyjc(){
    wx.myNavigateTo({
      url:'../../subpackages/zyjchome/zyjchome'
    })
  },
  rtjpdf(){
    wx.myNavigateTo({
      url:"../../subpackages/tjpdf/tjpdf"
    })
  },
  rReport() {
    wx.navigateTo({
      url: '../report/report'
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
        selected:2
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