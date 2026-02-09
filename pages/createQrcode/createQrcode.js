const {
  req
} = require("../../utils/request")
const util = require('../../utils/util')
import drawQrcode from '../../utils/qrcode'
// pages/createQrcode/createQrcode.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ysxm: "",
    mobile: "",
    imgsrc: "",
    tiaojie: "",
    pageType: ["医技预约", "门诊预约", "首页","个人体检预约"],
    array: ["/pages/jianyankaidan/jianyankaidan", "/pages/doctorAppoint/doctorAppoint", "/pages/index/index","/pages/gerentijian/gerentijian"],
    page: "",
    nowtype: "",
    tubiao: [ "../assign/yxicon.png","../assign/mzicon.png"],
    tbsrc: ""
  },
  submit() {
    if (!this.data.ysxm && !this.data.mobile) {
      wx.showToast({
        title: '请填写信息',
        icon: 'success',
        duration: 2000
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/yinxiang/addyxdoctor",
      method: "POST",
      data: {
        xinmin: this.data.ysxm,
        mobile: this.data.mobile,
        tiaojie: this.data.tiaojie
      },
      success: res => {
        this.createQr(res.data.data)
      }
    })
  },
  bindTypeChange(e) {
    this.setData({
      nowtype: this.data.pageType[e.detail.value],
      page: this.data.array[e.detail.value],
      tbsrc: this.data.tubiao[e.detail.value]
    })
  },
  createQr(sponsor) {
    let that = this;
    let text = "https://wx.pmc-wz.com/tranqrcode/?typeid=0&url=" + this.data.page + "&query=sponsor=" + sponsor;
    console.log(text)
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'myQrcode',
      // ctx: wx.createCanvasContext('myQrcode'),
      text: text,
      image: {
        imageResource: this.data.tbsrc,
        dx: 80,
        dy: 80,
        dWidth: 40,
        dHeight: 40
      },
      callback: (e) => {
        that.setData({
          imgsrc: "!"
        })
      }
      // v1.0.0+版本支持在二维码上绘制图片
    })
  },
  saveImg() {
    // wx.saveImageToPhotosAlbum({
    //   filePath: this.data.imgsrc,
    //   success: (res) => {

    //   }
    // })
    wx.canvasToTempFilePath({
      canvasId: "myQrcode",
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: Res => {
            wx.showToast({
              title: '保存成功'
            })
          }
        })
      }
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