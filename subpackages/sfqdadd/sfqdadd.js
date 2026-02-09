// pages/ynbb/ynbb.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parentid: "",
    name: "",
    scry: "",
    gsmz:"恒泽医疗"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      parentid: options.id
    })
  },
  rtijiao() {
    if (!this.data.name || !this.data.scry) {
      wx.showToast({
        title: '请填写必填信息',
      })
      return;
    }
    wx.showLoading({
      title: '提交中...',
    })
    req({
      url: util.baseUrl + "/newapi/api/Baobei/addclinic",
      method: "POST",
      data: {
        parentid: this.data.parentid,
        name: this.data.name,
        scry: this.data.scry
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.status) {
          wx.showModal({
            title: '提交成功',
            content: res.data.msg,
            showCancel: false
          })
          this.setData({
            name:"",
            scry:""
          })
        } else {
          wx.showModal({
            title: '提交失败',
            content: res.data.msg,
            showCancel: true
          })
        }
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