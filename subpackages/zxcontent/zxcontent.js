// subpackages/zxcontent/zxcontent.js
const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
var wxParse = require("../../wxParse/wxParse/wxParse.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0,
    item:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that=this;
    this.setData({
      id:options.id
    })
    req({
      url:util.baseUrl+"/newapi/api/cms/getonenews",
      data:{
        id:options.id
      },
      success:(res)=>{
        this.setData({
          item:res.data.data
        })
        wxParse.wxParse('courseDetail', 'html', res.data.data.content, that, 5)
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
  onShareAppMessage(e) {
    return {
      title: this.data.item.title,
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.coverimg,
      path: '/subpackages/zxcontent/zxcontent?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  },
  onShareTimeline(e) {
    return {
      title:  this.data.item.title,
      imageUrl: "https://wx.pmc-wz.com/hyb/images/" + this.data.item.coverimg,
      path: '/subpackages/zxcontent/zxcontent?fromid=' + wx.getStorageSync('openid') + '&id=' + this.data.item.id,
    }
  }
})