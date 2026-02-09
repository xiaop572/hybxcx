// pages/order/order.js
const { req } = require('../../utils/request')
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prolist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    req({
      url: util.baseUrl+'/newapi/api/yinxiang/getorderpage',
      method:'POST',
      data:{
        curpage:1,
        limit:999,
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        let arr=res.data.data.filter((item)=>{
          return item.PayStatus===20
        })
        this.setData({
          prolist:arr
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})