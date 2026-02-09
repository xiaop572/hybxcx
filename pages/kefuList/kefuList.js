// pages/kefuList/kefuList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  rZxList(){
    wx.navigateTo({
      url: '../zxkrList/zxkrList',
    })
  },
  rTjList(){
    wx.navigateTo({
      url: '../tijianList/tijianList',
    })
  },
  rAddZx(){
    wx.navigateTo({
      url: '../addZx/addZX',
    })
  },
  rAddTj(){
    wx.navigateTo({
      url: '../addTj/addTj',
    })
  },
  rCreateQrcode(){
    wx.navigateTo({
      url: '../createQrcode/createQrcode',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  rAddTj(){
    wx.navigateTo({
      url: '../addTj/addTj',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})