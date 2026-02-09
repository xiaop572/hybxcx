const {
  req
} = require("../../utils/request")
const util = require('../../utils/util')
// pages/jianyankaidan/jianyankaidan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    options: {

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.sponsor) {
      wx.setStorageSync('sponsor', options.sponsor)
    }
    this.setData({
      options: options
    })
    req({
      url: util.baseUrl + "/newapi/api/mindex/yingxianglist",
      method: "POST",
      data: {
        "ptype": 16,
        "current_page": 1,
        "per_page": 20
      },
      success: (res) => {
        this.setData({
          imgList: res.data.Data.list.reverse()
        })
      }
    })
  },
  rkaidan(row) {
    console.log(row.currentTarget.dataset.kd.pictitle)
    if (row.currentTarget.dataset.kd.pictitle !== '无痛胃肠镜(1515套餐)' && row.currentTarget.dataset.kd.pictitle !== '无痛胃肠镜(医保)') {
      wx.myNavigateTo({
        url: '../zzinfo/zzinfo?id=' + row.currentTarget.dataset.kd.id + '&title=' + row.currentTarget.dataset.kd.pictitle + '&summary=' + row.currentTarget.dataset.kd.summary + '&TotalFee=' + row.currentTarget.dataset.kd.price + '&sponsor=' + this.data.options.sponsor+"&room="+row.currentTarget.dataset.kd.jumpurl,
      })
    } else {
      wx.myNavigateTo({
        url: '../wcj/wcj?id=' + row.currentTarget.dataset.kd.id + '&title=' + row.currentTarget.dataset.kd.pictitle + '&summary=' + row.currentTarget.dataset.kd.summary + '&TotalFee=' + row.currentTarget.dataset.kd.price + '&ysmobile=' + this.data.options.mobile,
      })
    }


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