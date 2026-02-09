// pages/jiaxiang/jiiaxiang.js
var app = getApp()
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xmList: [],
    sum: 0,
    selectArrs: [],
    explainContent: "",
    explainShow: false,
    yuanjia: 0,
    maxmoney: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getxm()
  },
  getxm() {
    req({
      url: util.baseUrl + "/frontapi/api/tj/gettjprod",
      method: "post",
      data: {
        curpage: 1,
        limint: 999999
      },
      success: res => {
        this.setData({
          xmList: res.data.data
        })
      }
    })
  },
  selectItem(e) {
    let index = e.currentTarget.dataset.index;
    let data = this.data.xmList[index];
    let moneySum = 0;
    let choseChange = "xmList[" + index + "].select"
    let selectArr = [];
    let yuan = 0;
    let that = this;
    this.setData({
      [choseChange]: !this.data.xmList[index].select,
      sum: 0,
      yuanjia: 0
    }, () => {
      this.data.xmList.forEach(it => {
        if (it.select) {
          selectArr.push(it);
          moneySum += it.zkprice,
            yuan += it.orgprice
        }
      })
      that.setData({
        sum: parseFloat(moneySum),
        yuanjia: parseFloat(yuan),
        selectArrs: selectArr
      })
    })
  },
  payment() {
    if (this.data.selectArrs.length === 0) {
      wx.showToast({
        title: '请选择加项'
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/hd/savetjmx",
      method: "POST",
      data: {
        dataList: this.data.selectArrs,
        tjid: parseInt(app.globalData.tjyy.id),
        openid: wx.getStorageSync('openid'),
        allmoney: parseFloat(this.data.yuanjia),
        corpmoney: 0,
        personmoney: parseFloat(this.data.sum)
      },
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '预约成功',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../index/index',
            })
          }, 2000)
        }
      }
    })
  },
  close() {
    console.log(this.data.explainShow)
    this.setData({
      explainShow: !this.data.explainShow
    })
  },
  showExplain(e) {
    this.setData({
      explainContent: e.currentTarget.dataset.exp,
      explainShow: !this.data.explainShow
    })
  },
  noclose() {},
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