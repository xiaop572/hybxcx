const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

// subpackages/cfxiangqing/cfxiangqing.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brbm: "",
    id: "",
    cfdetail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      brbm: options.brbm,
      id: options.id
    })
    this.getcfdetail()
  },
  getcfdetail() {
    req({
      url: util.baseUrl + "/newapi/api/mzcf/getcfdetail",
      method: "POST",
      data: {
        brbm: this.data.brbm,
        id: this.data.id
      },
      success: res => {
        this.setData({
          cfdetail: res.data.data
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