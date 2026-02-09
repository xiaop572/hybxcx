// pages/kaqrcode/kaqrcode.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
import QR from '../../utils/weappqrcode'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderno: "",
    kalist: [],
    options: {},
    currentIndex: 0,
    wanList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!options.orderno) {
      wx.showToast({
        title: '获取出错',
      })
      setTimeout(() => {
        wx.redirectTo({
          url: '../index/index',
        })
      })
      return;
    }
    this.setData({
      orderno: options.orderno,
      id: options.id,
      options: {
        ...options
      },
    })
    this.getordermx()
    this.getpackordermxok()
  },
  getordermx() {
    req({
      url: util.baseUrl + '/newapi/api/pack/getpackordermx',
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        orderno: this.data.orderno
      },
      success: (res) => {
        if (res.data.data.length > 0) {
          this.setData({
            kalist: res.data.data
          }, () => {
            this.batCreate()
          })
        }
      }
    })
  },
  refund(e){
    app.globalData.tuiItem=this.data.options
    wx.navigateTo({
      url: '../../subpackages/tuikuan/tuikuan?deli='+this.data.deli,
    })
  },
  refund1() {
    wx.showModal({
      title: '提示',
      content: '是否申请退款',
      success:(ress)=>{
        if (ress.confirm) {
          req({
            url: util.baseUrl + "/newapi/api/refund/postform",
            method: "POST",
            data: {
              orderid: parseInt(this.data.id),
              reson: "",
              openid: wx.getStorageSync('openid')
            },
            success: res => {
              if (res.data.status) {
                this.setData({
                  deli: 10
                })
              }
            }
          })
        } else if (ress.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  getpackordermxok() {
    req({
      url: util.baseUrl + '/newapi/api/pack/getpackordermxok',
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        orderno: this.data.orderno
      },
      success: (res) => {
        if (res.data.data.length > 0) {
          this.setData({
            wanList: res.data.data
          }, () => {})
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  batCreate() {
    this.data.kalist.forEach((item) => {
      this.createQr(item)
      this.setData({
        kalist: this.data.kalist
      })
    })
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
    })
  },
  createQr(options) {
    console.log(options)
    let that = this;
    let text = "orderno=" + options.orderno + "&goodsid=" + options.goodsid;
    var imgData = QR.drawImg(text, {
      typeNumber: 4, // 密度
      errorCorrectLevel: 'L', // 纠错等级
      size: 800, // 白色边框
    })
    console.log(imgData)
    options.qrImgSrc = imgData;
    // drawQrcode({
    //   width: 200,
    //   height: 200,
    //   canvasId: 'myQrcode',
    //   // ctx: wx.createCanvasContext('myQrcode'),
    //   text: text,
    //   callback: (e) => {
    //     that.setData({
    //       imgsrc: "!"
    //     })
    //   }
    //   // v1.0.0+版本支持在二维码上绘制图片
    // })
  },
  gettuistate(){
    req({
      url: util.baseUrl + '/newapi/api/refund/postrefundzt',
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        orderid: parseInt(this.data.options.id)
      },
      success: (res) => {
       this.setData({
         deli:parseInt(res.data.data)
       })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.gettuistate()
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
  onShareAppMessage(e) {
    return {
      title: "您的好友送您一张卡券",
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.options.imgsrc,
      path: '/pages/getkaquan/getkaquan?orderno=' + this.data.options.orderno + '&orgopenid=' + wx.getStorageSync('openid'),
    }
  }
})