const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

// subpackages/liquanduihuan/liquanduihuan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    card:"",
    pwd:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
  submit(){
    if(!this.data.card || !this.data.pwd){
      wx.showToast({
        title: '请输入卡号密码',
      })
      return;
    }
    req({
      url:util.baseUrl+"/newapi/api/card/getonecard",
      method:"POST",
      data:{
        openid:wx.getStorageSync('openid'),
        card:this.data.card,
        pwd:this.data.pwd
      },
      success:res=>{
        console.log(res)
        if(res.data.status){
          wx.showToast({
            title: '兑换成功',
          })
          wx.navigateTo({
            url: '../liquanhexiaoma/liquanhexiaoma?orderno='+res.data.data.orderno+"&goodsid="+res.data.data.goodsid+"&expiretime="+res.data.data.expiretime+"&proname="+res.data.data.proname,
          })
        }else{
          wx.showToast({
            title: res.data.msg,
          })
        }
      }
    })
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