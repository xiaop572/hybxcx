// pages/exmineResult/exmineResult.js
const { req } = require('../../utils/request');
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xinid: "",
    resultList: [],
    total: 0,
    undone: 0,
    complete: 0,
    brxm:"",
    registdate:"",
    checkdate:"",
    summarydate:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      xinid: options.id,
      brxm:options.brxm
    })
    this.getMx()
  },
  getMx() {
    req({
      url: util.baseUrl + '/newapi/api/zxzt/gettjdetail',
      method: 'GET',
      data: {
        xinid: this.data.xinid
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            resultList: res.data.data.tjmxContent,
            total: res.data.msg,
            undone: 0,
            complete: 0,
            registdate:res.data.data.tjMain.registdate,
            checkdate:res.data.data.tjMain.checkdate,
            summarydate:res.data.data.tjMain.summarydate
          })
          this.statisComplete(res.data.data.tjmxContent)
        }
      }
    })
  },
  statisComplete(arr) {
    if (arr.length > 0) {
      arr.forEach(item => {
        if (item.zt === '暂无结果') {
          this.setData({
            undone: this.data.undone + 1
          })
        } else if (item.zt === '已有结果') {
          this.setData({
            complete: this.data.complete + 1
          })
        }
      })
    }
    return;
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