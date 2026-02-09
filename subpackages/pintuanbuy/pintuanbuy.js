// subpackages/pintuanbuy/pintuanbuy.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    ptid: 0,
    ptmx: [],
    day: 0,
    hour: 0,
    minute: 0,
    seconds: 0,
    endtime: 0,
    timer: null,
    istz: false,
    isbuy: true,
    isptw: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    let that = this;
    this.setData({
      ptid: options.ptid
    })
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    wx.setStorageSync('ptid', options.ptid)
    req({
      url: util.baseUrl + "/newapi/api/pt/getonepintuan",
      method: "GET",
      data: {
        id: options.id
      },
      success: res => {
        if (res.data.data.isdelete !== 0) {
          wx.showToast({
            title: '该产品已下架',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../../pages/index/index',
            })
          }, 1000)
        }
        //https://wx.pmc-wz.com/hyb/images/
        this.setData({
          item: res.data.data,
          endtime: res.data.data.enddate
        })

      }
    })

  },
  rpro(){
    wx.myNavigateTo({
      url: '../../subpackages/pintuanPro/pintuanPro?id='+this.data.item.id,
    })
  },
  rptbuy(e) {
    let app = getApp();
    app.globalData.pttc = e.currentTarget.dataset.item
    wx.myNavigateToz({
      url: "../ptjiesuan/ptjiesuan"
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  btnstate() {
    let openid = wx.getStorageSync('openid')
    if (openid === this.data.ptmx[0].openid) {
      this.setData({
        istz: true,
        isbuy: false
      })
    }
    for (let i = 1; i < this.data.ptmx.length; i++) {
      if (this.data.ptmx[i].openid === openid) {
        this.setData({
          isbuy: false
        })
      }
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    this.data.timer = setInterval(() => {
      let timeArr = util.intervalTime(new Date().getTime(), new Date(this.data.endtime));
      if (!timeArr) {
        clearInterval(this.data.timer)
      }
      that.setData({
        day: timeArr[0],
        hour: timeArr[1],
        minute: timeArr[2],
        seconds: timeArr[3]
      })
    }, 1000)
    req({
      url: util.baseUrl + "/newapi/api/pt/ptmxinfo",
      method: "post",
      data: {
        ptid: this.data.ptid
      },
      success: (res) => {
        this.setData({
          ptmx: res.data.data
        }, () => {
          if (res.data.data.length >= 2) {
            this.setData({
              isptw: true
            })
          }
          that.btnstate()
        })
      }
    })
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
    clearInterval(this.data.timer);
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
    return {
      title: '我正在拼团'+this.data.item.pictitle+'，超值钜惠，一起来拼购吧',
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/subpackages/pintuanbuy/pintuanbuy?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id + '&ptid=' + this.data.ptid,
    }
  },
  onShareTimeline() {
    return {
      title: '我正在拼团'+this.data.item.pictitle+'，超值钜惠，一起来拼购吧',
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.picurl,
      path: '/subpackages/pintuanbuy/pintuanbuy?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id + '&ptid=' + this.data.ptid,
    }
  },
})