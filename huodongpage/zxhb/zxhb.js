const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
// huodongpage/ckhb/ckhb.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shadevis: false,
    width: 0,
    qList: [
      "https://wx.pmc-wz.com/materials/zx300q.png",
      "https://wx.pmc-wz.com/materials/zx500q.png"
    ],
    qsrc: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that =this;
    req({
      url: util.baseUrl + "/newapi/api/hd/minilink",
      method: "POST",
      data: {
        url: "pages/basicPro/basicPro",
        query: "69",
        "typeid": 0,
        openid:wx.getStorageSync('openid')
      },  
      success: res => {
        //base64转换成图片
        util.base64src("data:image/png;base64," + res.data.data, function (e) {
          that.setData({
            qrcodeSrc: e
          })
          wx.hideLoading({
            success: (res) => {
              that.setData({
                loading: true
              })
            },
          })
        })
      }
    })
    let userinfo=wx.getStorageSync('userInfo');
    if(!userinfo){
      wx.showToast({
        title: '请先登录',
        success:()=>{
          setTimeout(()=>{
            wx.navigateTo({
              url: '../../pages/login/login',
            })
          },2000)
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getcard() {
    req({
      url: util.baseUrl + "/newapi/api/feme/givevoucherzheng",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          let money = parseInt(res.data.msg);
          if (money === 300) {
            this.setData({
              qsrc: this.data.qList[0]
            },()=>{
              this.setData({
                shadevis: true,
              })
            })
          } else if (money === 500) {
            this.setData({
              qsrc: this.data.qList[1]
            },()=>{
              this.setData({
                shadevis: true,
              })
            })
          }
        }else{
          wx.showToast({
            title: '此券已领取',
          })
        }
      }
    })

  },
  closeShade() {
    this.setData({
      shadevis: false,
    })
  },
  rcard() {
    wx.navigateTo({
      url: '../../subpackages/mycard/mycard',
    })
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