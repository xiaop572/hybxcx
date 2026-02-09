// subpackages/liquanhexiaoma/liquanhexiaoma.js
import QR from '../../utils/weappqrcode'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderno:"",
    goodsid:"",
    proname:"",
    addtime:"",
    imgSrc:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(!options.orderno || !options.goodsid){
      wx.showToast({
        title: '兑换错误',
      })
      setTimeout(()=>{
        wx.switchTab({
          url: '../../pages/index/index',
        })
      },1500)
      return;
    }
    this.setData({
      orderno:options.orderno,
      goodsid:options.goodsid,
      expiretime:options.expiretime,
      proname:options.proname
    },()=>{
      this.createQr()
    })
  },
  createQr(options) {
    let that = this;
    let text = "orderno=" + that.data.orderno + "&goodsid=" + that.data.goodsid;
    var imgData = QR.drawImg(text, {
      typeNumber: 4, // 密度
      errorCorrectLevel: 'L', // 纠错等级
      size: 800, // 白色边框
    })
    this.setData({
      imgSrc:imgData
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