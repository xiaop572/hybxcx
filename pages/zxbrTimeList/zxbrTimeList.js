// pages/zxbrTimeList/zxbrTimeList.js
const { req } = require('../../utils/request');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brTime: []
  },
  rExamineResult(e) {
    wx.navigateTo({
      url: '../exmineResult/exmineResult?brbm=' + e.currentTarget.dataset.brbm + '&jzsj=' + e.currentTarget.dataset.jzsj + '&brxm=' + e.currentTarget.dataset.brxm,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    req({
      url: util.baseUrl + '/newapi/api/zxzt/getbrday',
      method: "GET",
      data: {
        brbm: options.brbm
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            brTime: res.data.data
          })
        }
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

  }
})