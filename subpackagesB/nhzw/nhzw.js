// subpackagesB/nhzw/nhzw.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xinmin:"",
    info:{},
    showmeng:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  guanbi() {
    this.setData({
      showmeng: false
    })
  },
  fd(){
    wx.previewImage({
      current: "https://wx.pmc-wz.com/materials/zwt.png", // 当前显示图片的http链接
      urls: ["https://wx.pmc-wz.com/materials/zwt.png"] // 需要预览的图片http链接列表
    })
  },
  cx(){
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请输入姓名',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/yuezi/getnhname",
      method: "GET",
      data: {
        openid: wx.getStorageSync('openid'),
        xinmin:this.data.xinmin
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            info:res.data.data,
            showmeng:true
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '查询失败，无此信息',
            showCancel:false
          })
        }
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