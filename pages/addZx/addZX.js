// pages/addZx/addZX.js
const util = require('../../utils/util')
const { req } = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brxm: "",
    mobie: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  submit() {
    req({
      url: util.baseUrl + '/newapi/api/zxzt/addzxkehu',
      method: 'POST',
      data: {
        brxm: this.data.brxm,
        mobie: this.data.mobie,
        kefushouji: wx.getStorageSync('kefushouji')
      },
      success: res => {
        if (res.data.data > 0) {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          })
          this.setData({
            brxm:"",
            mobie:""
          })
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'success',
            duration: 2000
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