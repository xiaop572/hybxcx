// subpackages/xinxuan/xinxuan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xiangList: [],
    currentIndex: 0,
    weihelist:[],
    yihelist:[],
    weifulist:[],
    yifulist:[]
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.weihe();
    this.yihe();
    this.weifu();
    this.yitui()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  weihe() {
    req({
      url: util.baseUrl + "/newapi/api/member/getfriendshareokpay",
      method: "POST",
      data: {
        fromsource: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            weihelist: res.data.data
          })
        }
      }
    })
  },
  yihe() {
    req({
      url: util.baseUrl + "/newapi/api/member/getfriendshareokuse",
      method: "POST",
      data: {
        fromsource: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            yihelist: res.data.data
          })
        }
      }
    })
  },
  weifu() {
    req({
      url: util.baseUrl + "/newapi/api/member/getfriendsharenopay",
      method: "POST",
      data: {
        fromsource: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            weifulist: res.data.data
          })
        }
      }
    })
  },
  yitui() {
    req({
      url: util.baseUrl + "/newapi/api/member/getfriendsharetui",
      method: "POST",
      data: {
        fromsource: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: res => {
        if (res.data.status) {
          this.setData({
            yituilist: res.data.data
          })
        }
      }
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