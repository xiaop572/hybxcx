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
      "https://wx.pmc-wz.com/materials/ck100q.png",
      "https://wx.pmc-wz.com/materials/ck300q.png"
    ],
    qsrc: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let userinfo=wx.getStorageSync('userInfo');
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
      url: util.baseUrl + "/newapi/api/huodong/givefreebilltest",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            shadevis: true
          })
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
    return {
      title: '和平国际2025年中盛典超级免单礼，三大热门项目免费送~',
      path: '/huodongpage/lqymjkq/kqymjkq?shareopenid=' + wx.getStorageSync('openid'),
      imageUrl: "https://wx.pmc-wz.com/materials/hmb/ymjfxt.jpg"
    };
  }
})