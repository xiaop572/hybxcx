// pages/tjhdList/tjhdlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
      options.id=arr[1]
    }
  },
  rhd490(){
    wx.navigateTo({
      url: '../tcxq/tcxq?id=490',
    })
  },
  rhd492(){
    wx.navigateTo({
      url: '../tcxq/tcxq?id=492',
    })
  },
  rhd493(){
    wx.navigateTo({
      url: '../tcxq/tcxq?id=493',
    })
  },
  rhd494(){
    wx.navigateTo({
      url: '../tcxq/tcxq?id=494',
    })
  },
  rhd495(){
    wx.navigateTo({
      url: '../tcxq/tcxq?id=495',
    })
  },
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