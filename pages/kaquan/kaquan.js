// pages/kaquan/kaquan.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kaList: [],
    options: {},
    currentIndex: 0,
    tuiList: [],
    wanList: [],
    zengkaList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      currentIndex:parseInt(options.index)
    })
    this.getpackorder();
    this.getpackorderokpage();
    this.getpackrefundorderpage();
    this.getordermovels();
  },
  rkaqrcode(e) {
    console.log(e)
    wx.navigateTo({
      url: '../kaqrcode/kaqrcode?orderno=' + e.currentTarget.dataset.orderno + '&price=' + e.currentTarget.dataset.price + '&goodsname=' + e.currentTarget.dataset.goodsname + "&imgsrc=" + e.currentTarget.dataset.imgsrc + "&id=" + e.currentTarget.dataset.ids + "&deli=" + e.currentTarget.dataset.deli+"&xinmin="+e.currentTarget.dataset.xinmin+"&picurl="+e.currentTarget.dataset.picurl+'&paytime='+e.currentTarget.dataset.paytime+"&spes="+e.currentTarget.dataset.spes+"&iftui="+e.currentTarget.dataset.iftui+'&nopay='+e.currentTarget.dataset.nopay,
    })
  },
  rArticleTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../article/article?id=' + id
    })
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
    })
  },
  getpackorder() {
    req({
      url: util.baseUrl + "/newapi/api/pack/getpackorderpage",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        this.setData({
          kaList: res.data.data
        })
      }
    })
  },
  ryy(e){
    wx.navigateTo({
      url:e.currentTarget.dataset.url
    })
  },
  getordermovels(){
    req({
      url: util.baseUrl + "/newapi/api/pack/getordermovels",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        this.setData({
          zengkaList: res.data.data
        })
      }
    })
  },
  getpackorderokpage() {
    req({
      url: util.baseUrl + "/newapi/api/pack/getpackorderokpage",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        this.setData({
          wanList: res.data.data
        })
      }
    })
  },
  getpackrefundorderpage() {
    req({
      url: util.baseUrl + "/newapi/api/pack/getpackrefundorderpage",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 9999
      },
      success: (res) => {
        this.setData({
          tuiList: res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  setshare(e) {
    this.setData({
      options: e.target.dataset
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    return {
      title: "您的好友送您一张卡券",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.options.imgsrc,
      path: '/pages/getkaquan/getkaquan?orderno=' + this.data.options.orderno + '&orgopenid=' + wx.getStorageSync('openid'),
    }
  }
})