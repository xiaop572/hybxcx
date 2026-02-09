// subpackages/yiyetixian/yiyetixian.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prominfo:{

    },
    qxje:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getprominfo()
  },
  alltx(){
    this.setData({
      qxje:this.data.prominfo.keti
    })
  },
  getprominfo(){
    req({
      url:util.baseUrl+"/newapi/api/prom/getprominfo",
      method:"POST",
      data:{
        openid:wx.getStorageSync('openid')
      },
      success:(res)=>{
        this.setData({
          prominfo:res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  sqtx(){
    console.log(this.data.qxje)
    if(this.data.qxje=="" || this.data.qxje>this.data.prominfo.keti){
      wx.showToast({
        title: '超过可提金额',
      })
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: ['KRIQOSbcjvDd7m2t6B-TgmqZ38sFzQRrc0P1hH4NmkE', 'XV38p-ZFA-9hEEfTHmZ9TtdcUrRhYsAFu6zFzvMsgGM'],
      success: ress => {
        req({
          url:util.baseUrl+"/newapi/api/prom/usercashsubt",
          method:"POST",
          data:{
            openid:wx.getStorageSync('openid')
          },
          success:res=>{
            this.insertoutpromyjinfo();
          }
        })
      }
    })
   
  },
  insertoutpromyjinfo(){
    req({
      url:util.baseUrl+"/newapi/api/prom/insertoutpromyjinfo",
      method:"POST",
      data:{
        openid:wx.getStorageSync('openid'),
        cashmoney:this.data.qxje
      },
      success:res=>{
        if(res.data.status){
          wx.showModal({
            content:res.data.msg,
            showCancel:false
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