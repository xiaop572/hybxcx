// subpackages/addjzka/addjzka.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brxm: "",
    sfzh: "",
    yddh: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      yddh: options.addsfzka
    })
  },
  next() {
    if (!this.data.brxm || !this.data.sfzh) {
      wx.showToast({
        title: '请填写信息',
      })
      return;
    }
    wx.navigateTo({
      url: '../selectCard/selectCard?yddh=' + this.data.yddh + '&sfzh=' + this.data.sfzh + '&brxm=' + this.data.brxm,
    })
  
  },
  getcode() {
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/brda/sendmzmobile",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.phone
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            code: res.data.data,
            num: 60
          }, () => {
            this.countTime()
          })
        }
      }
    })
  },
  countTime() {
    console.log(this.data.num)
    if (this.data.num <= 0) {
      return;
    }
    this.setData({
      num: this.data.num - 1
    })
    setTimeout(() => {
      this.countTime();
    }, 1000)
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