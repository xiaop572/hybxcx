// subpackages/qiyeHome/qiyeHome.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    userInfo: {
      avatarUrl: ""
    },
    zxproList: [],
    xlproList: [],
    yjproList: [],
    prominfo: {

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    this.getprominfo()
    this.getzxpro();
    this.getxlpro();
    this.getyjpro()

  },
  rpro(e) {
    console.log(e, "测试")
    wx.navigateTo({
      url: '../yiyetcxq/yiyetcxq?id=' + e.currentTarget.dataset.id,
    })
  },
  rxieyi(){
    wx.navigateTo({
      url: '../yiyexieyi/yiyexieyi',
    })
  },
  getzxpro() {
    req({
      url: util.baseUrl + "/newapi/api/prom/promyjgoodsall",
      method: "POST",
      data: {
        "stype": 0,
        "curpage": 1,
        "limit":9999,
        "searchkey": "",
        "sort": 0,
        openid:wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          zxproList: res.data.data
        })
      }
    })
  },
  rtixian() {
    wx.navigateTo({
      url: '../yiyetixian/yiyetixian',
    })
  },
  getxlpro() {
    req({
      url: util.baseUrl + "/newapi/api/prom/promyjgoodsalenum",
      method: "POST",
      data: {
        curpage: 1,
        limit: 6,
        openid:wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          xlproList: res.data.data
        })
      }
    })
  },
  getyjpro() {
    req({
      url: util.baseUrl + "/newapi/api/prom/promyjgoodsnum",
      method: "POST",
      data: {
        curpage: 1,
        limit: 6,
        openid:wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          yjproList: res.data.data
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
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
  },
  getprominfo() {
    req({
      url: util.baseUrl + "/newapi/api/prom/getprominfo",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            prominfo: res.data.data
          })
          wx.setStorageSync('bankpos', res.data.data.bankpos)
        }
      }
    })
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: parseInt(e.currentTarget.dataset.idx)
    })
  },
  pagechange: function (e) {
    // 通过touch判断，改变tab的下标值
    if ("touch" === e.detail.source) {
      let currentPageIndex = this.data.currentIndex;
      currentPageIndex = e.detail.current;
      // 拿到当前索引并动态改变
      this.setData({
        currentIndex: currentPageIndex,
      })
    }
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