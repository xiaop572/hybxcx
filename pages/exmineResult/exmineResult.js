// pages/exmineResult/exmineResult.js
const util = require('../../utils/util');
const { req } = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brxm: "",
    date: "",
    resultList: [],
    options: {},
    btnWord: "按总项目查看",
    total: 0,
    undone: 0,
    complete: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options,
      brxm: options.brxm,
      date: options.jzsj,
    })
    this.getMx()
  },
  changeResult() {
    console.log(this.data.btnWord)
    if (this.data.btnWord === '按总项目查看') {
      this.setData({
        btnWord: "按分项目查看"
      })
      this.getZong();
    } else {
      this.setData({
        btnWord: "按总项目查看"
      })
      this.getMx()
    }
  },
  getZong() {
    req({
      url: util.baseUrl + '/newapi/api/zxzt/getbrdetail',
      method: 'POST',
      data: {
        brbm: this.data.options.brbm,
        date: this.data.options.jzsj
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            resultList: res.data.data,
            total: res.data.msg,
            undone: 0,
            complete: 0
          })
          this.statisComplete(res.data.data)
        }
      }
    })
  },
  getMx() {
    req({
      url: util.baseUrl + '/newapi/api/zxzt/getbrdetailmx',
      method: 'POST',
      data: {
        brbm: this.data.options.brbm,
        date: this.data.options.jzsj
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            resultList: res.data.data,
            total: res.data.msg,
            undone: 0,
            complete: 0
          })
          this.statisComplete(res.data.data)
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