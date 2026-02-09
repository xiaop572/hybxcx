// pages/zxkrList/zxkrList.js
const { req } = require('../../utils/request')
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage: 1,
    limit: 10,
    page: 0,
    krList: []
  },
  rTJResult(e) {
    wx.navigateTo({
      url: '../TJResult/TJResult?id=' + e.currentTarget.dataset.id + '&brxm=' + e.currentTarget.dataset.brxm,
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
  frontPage() {
    if (this.data.curpage > 1) {
      this.setData({
        curpage: this.data.curpage - 1
      }, function () {
        this.getList()
      })

    }
  },
  nextPage() {
    if (this.data.curpage < this.data.page) {
      this.setData({
        curpage: this.data.curpage + 1
      }, function () {
        this.getList()
      })
    }
  },
  getList() {
    req({
      url: util.baseUrl + '/newapi/api/zxzt/gettjpage',
      method: 'POST',
      data: {
        curpage: this.data.curpage,
        limit: this.data.limit
      },
      success: res => {
        if (res.data.status) {
          console.log(res.data.data)
          this.setData({
            page: Math.ceil(parseInt(res.data.msg) / this.data.limit),
            krList: res.data.data
          })
        }
      }
    })
  },
  onShow: function () {
    this.getList()
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