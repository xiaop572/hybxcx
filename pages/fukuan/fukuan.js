// pages/fukuan/fukuan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:{

    },
    TotalFee:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options:options,
      TotalFee:options.TotalFee
    })
  },
  submitFu(){
    delete this.data.options.TotalFee;
    console.log(this.data.options)
    wx.requestPayment({
      ...this.data.options,
      package:"prepay_id="+this.data.options.prepay_id,
      success: (ress) => {
        if (ress.errMsg === "requestPayment:ok") {
          wx.showToast({
            title: '支付成功'
          })
          wx.navigateTo({
            url: '../jianyankaidan/jianyankaidan',
          })
        }
      },
      fail(res){
        console.log(res)
      }
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})