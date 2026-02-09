// pages/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: 27.947435, //纬度
    longitude: 120.686171, //经度
    markers: [{
      id: 1,
      width: 70, //标记宽
      height: 80, //标记高
      latitude: 27.947437,
      longitude: 120.686171,
    }]
  },
  biaoji(e) {
    console.log("标记目的地点击", e)
    // wx.getLocation({//获取当前地址信息
    //   type: 'wgs84',
    //   success(res) {
    //     const latitude = res.latitude
    //     const longitude = res.longitude
    //     const speed = res.speed
    //     const accuracy = res.accuracy
    //     wx.openLocation({//跳转腾讯地图查看并可以进行导航
    //       latitude: 27.947435,
    //       longitude: 120.686171,
    //     })
    //   },fail(res){//未授权地理位置处理
    //     wx.showModal({
    //       title: '请授权',
    //       content: '若未授权地理位置,您将不能正常使用导航功能',
    //       confirmText:"授权",
    //       success (res) {
    //         if (res.confirm) {
    //           console.log('用户点击确定')
    //           wx.openSetting({//跳转设置授权界面
    //           })
    //         } else if (res.cancel) {
    //           console.log('用户点击取消')
    //         }
    //       }
    //     })
    //   }  
    // })
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