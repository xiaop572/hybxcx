const {
  req
} = require("../../utils/request")
const util = require('../../utils/util')
// pages/zzinfo/zzinfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    name: "",
    num: "",
    remark: "",
    phone: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  rfukuan() {
    req({
      url: util.baseUrl + "/newapi/api/msg/preyinxiangpay",
      method: "POST",
      data: {
        "orderTitle": this.data.options.title,
        "buweiNum": Number(this.data.num),
        "Memo": this.data.remark,
        "OutTradeNo": String(+new Date()),
        "TotalFee": Number(this.data.options.TotalFee),
        "openId": wx.getStorageSync('openid'),
        "xinmin": this.data.name,
        "mobile": this.data.phone,
        "Source": this.data.options.ysmobile,
        "ptype": 16
      },
      success: (res) => {
        if (res.data.msg === '0元交易成功') {
          wx.showToast({
            title: '预约成功'
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '../jianyankaidan/jianyankaidan',
            })
          }, 2000); 
          return;
        }
        if (res.data.status) {
          let data = res.data.data;
          wx.navigateTo({
            url: '../fukuan/fukuan?appId=' + data.appId + '&nonceStr=' + data.nonceStr + '&package=' + data.package + '&paySign=' + data.paySign + '&paymentId=' + data.paymentId + '&signType=' + data.signType + '&timeStamp=' + data.timeStamp + '&TotalFee=' + Number(this.data.options.TotalFee) + '&prepay_id=' + data.prepay_id + '&title=' + this.data.options.title,
          })
        }
      }
    })
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