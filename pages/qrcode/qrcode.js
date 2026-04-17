// pages/qrcode/qrcode.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    nickname: "",
    qrcodeSrc: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      openid: wx.getStorageSync('openid'),
      nickname: userInfo.nickName || ""
    })
    this.getMiniCode()
  },
  getMiniCode() {
    wx.showLoading({
      title: '加载中',
    })
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: "pages/index/index",
        query: this.data.openid || "",
        typeid: 0,
        openid: this.data.openid
      },
      success: res => {
        util.base64src("data:image/jpg;base64," + res.data.data, (imgPath) => {
          this.setData({
            qrcodeSrc: imgPath
          })
          wx.hideLoading()
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '小程序码生成失败',
          icon: 'none'
        })
      }
    })
  },
  saveCode() {
    if (!this.data.qrcodeSrc) {
      wx.showToast({
        title: '请先生成小程序码',
        icon: 'none'
      })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.qrcodeSrc,
      success: () => {
        wx.showToast({
          title: '保存成功'
        })
      },
      fail: () => {
        wx.showToast({
          title: '保存失败，请检查相册权限',
          icon: 'none'
        })
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
