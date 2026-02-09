// subpackages/setInfo/setInfo.js
const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    nickname:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let qrinfo=wx.getStorageSync('qrinfo');
    let userInfo=wx.getStorageSync('userInfo');
    this.setData({
      userInfo:userInfo,
      nickname:qrinfo.nickname
    })
  },
  submit(){
    req({
      url: util.baseUrl + "/newapi/api/WechatUser/setnickname",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        nickname: this.data.nickname
      },
      success: res => {
        if (res.data.status) {
          req({
            url: util.baseUrl + "/newapi/api/WechatUser/getqrinfo",
            data: {
              openid: wx.getStorageSync('openid')
            },
            success: reso => {
              if (reso.data.data) {
                wx.setStorageSync('qrinfo', reso.data.data)
                wx.showToast({
                  title: '设置成功',
                })
              }
            }
          })
        }
      }
    })
  },
  changeAvatar(e){
    console.log(e)
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