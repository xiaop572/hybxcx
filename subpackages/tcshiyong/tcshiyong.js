// subpackages/tcshiyong/tcshiyong.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowKeyboard: true,
    plate:[],
    parkcode:"",
    mobile:"",
    carcode:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      parkcode:options.parkcode
    })
    let userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      wx.showModal({
        title: '提示',
        content: '请登录',
        showCancel:false,
        complete: (res) => {
          wx.navigateTo({
            url: '../../pages/login/login',
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  cpjpfalse(){
    this.setData({
      isShowKeyboard:false
    })
  },
  cpjptrue(){
    this.setData({
      isShowKeyboard:true
    })
  },
  onPlateKeyboardValueChange(e){
    this.setData({
      plate:e.detail
    })
  },
  submit(){
    if(this.data.plate.length<7){
      wx.showModal({
        title: '提示',
        content: '请填写正确车牌',
        showCancel: false,
        success(res) {
        }
      })
      return;
    }else if(this.data.mobile.length!==11){
      wx.showModal({
        title: '提示',
        content: '请填写正确手机号',
        showCancel: false,
        success(res) {
        }
      })
      return;
    }
    let params={
      openId:wx.getStorageSync('openid'),
      parkcode:this.data.parkcode,
      mobile:this.data.mobile,
      carcode:this.data.plate.join("")
    }
    req({
      url: util.baseUrl + "/newapi/api/car/parkcarduse",
      method: "POST",
      data: params,
      success: (res) => {
        console.log(res)
        if(res.data.status){
          wx.showToast({
            title:res.data.msg,
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '../tcbag/tcbag',
            })
          }, 2000);
        }else{
          wx.showToast({
            title:res.data.msg,
          })
        }
      }
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