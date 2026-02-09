// subpackages/ygtuiguangma/ygtuiguangma.js
import drawQrcode from '../../utils/qrcode'
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ygcode: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getygcode()
  },
  getygcode() {
    req({
      url: util.baseUrl + "/newapi/api/qrcode/getygdm",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        this.setData({
          ygcode: res.data.data
        }, () => {
          this.createQr()
        })
      }
    })
  },
  ygcreate() {
    req({
      url: util.baseUrl + "/newapi/api/qrcode/updateygdm",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        ygdm: this.data.ygcode
      },
      success: () => {
        this.createQr()
      }
    })
  },
  createQr() {
    let that = this;
    let text = "https://wx.pmc-wz.com/tranqrcode/?typeid=0&url=/subpackages/qiyezhuce/qiyezhuce&query=fromid=" + wx.getStorageSync('openid') + ";ygdm=" + this.data.ygcode
    drawQrcode({
      width: 140,
      height: 140,
      canvasId: 'myQrcode',
      // ctx: wx.createCanvasContext('myQrcode'),
      text,
      callback: (e) => {}
      // v1.0.0+版本支持在二维码上绘制图片
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