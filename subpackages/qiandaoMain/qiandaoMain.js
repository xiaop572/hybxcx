// pages/qiandaoMain/qiandaoMain.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todaysign: 0,
    allnum: 1,
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getqiandao()
  },
  getqiandao() {
    req({
      url: util.baseUrl + "/newapi/api/sign/getqiandao",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        console.log(res)
        this.setData({
          todaysign: res.data.data.todaysign,
          allnum: res.data.data.allnum
        })
      }
    })
  },
  qiandao() {
    wx.showToast({
      title: '活动已结束',
    })
    return ;
    req({
      url: util.baseUrl + "/newapi/api/sign/userqiandao",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        if (res.data.status) {
          this.getqiandao()
        }
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
    
  },
  showRule() {
    this.setData({
      show: !this.data.show
    })
  },
  myAward(){
    wx.navigateTo({
      url: '../../subpackages/myPrize/myPrize',
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
  onShareAppMessage() {
    return{
      title:'慧医宝微商城正式上线！签到有礼，邀请好友全场低至9.9元起！',
      imageUrl:'https://wx.pmc-wz.com/materials/qdban.jpg'
    }
  },
  onShareTimeline(){
    return{
      title:'慧医宝微商城正式上线！签到有礼，邀请好友全场低至9.9元起！',
      imageUrl:'https://wx.pmc-wz.com/materials/qdban.jpg'
    }
  },
})