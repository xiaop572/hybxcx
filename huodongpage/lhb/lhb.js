// 领红包
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ischaoshi:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(!options.scene){
      this.setData({
        ischaoshi:true
      })
    }
    let qrTimestamp=options.scene;
    let currentTimestamp=+new Date()
    const timeDifference = (currentTimestamp - qrTimestamp) / 1000;
    if(timeDifference>30){
      this.setData({
        ischaoshi:true
      })
    }
  },
  qhb(){
    req({
      url:util.baseUrl+"/newapi/api/jifen/getonehb",
      method:"GET",
      data:{
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        console.log(wx.sendBizRedPacket)
        wx.sendBizRedPacket({
          ...res.data.data
        })
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