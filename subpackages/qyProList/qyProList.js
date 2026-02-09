// subpackages/jifenduihuan/jifenduihuan.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jfspList: [],
    alljf: 0,
    searchkey:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
   this.goodspagelist()
  },
  search(e){
    this.goodspagelist()
  },
  goodspagelist(){
    req({
      url: util.baseUrl + "/newapi/api/prom/promyjgoodsall",
      method: "POST",
      data: {
        "stype": 0,
        "curpage": 1,
        "limit":99999,
        "searchkey": this.data.searchkey,
        "sort": 0,
        openid:wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          jfspList: res.data.data
        })
      }
    })
  },
  rjfxq(e) {
    wx.myNavigateToz({
      url: '../yiyetcxq/yiyetcxq?id=' + e.currentTarget.dataset.id,
    })
  },
  rguize() {
    wx.navigateTo({
      url: '../jifenguize/jifenguize',
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