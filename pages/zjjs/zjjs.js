// pages/doctorAppoint/doctorAppoint.js
const { req } = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keshiList: [],
    showNav: false,
    doctorList:[]
  },
  changeShowNav() {
    this.setData({
      showNav: !this.data.showNav
    })
  },
  rZjxj(e) {
    let ygdm=e.currentTarget.dataset.ygdm;
    wx.navigateTo({
      url: '../zjxj/zjxj?ygdm='+ygdm,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    req({
      url: util.baseUrl + '/newapi/api/mzyy/getkstree',
      success: res => {
        this.setData({
          keshiList: res.data
        })
        console.log(this.data.keshiList)
      }
    });
    req({
      url: util.baseUrl + '/newapi/api/mindex/doctorall',
      success: res => {
        this.setData({
          doctorList:res.data.data
        })
      }
    })
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

  }
})