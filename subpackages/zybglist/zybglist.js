// subpackages/zybglist/zybglist.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zyhm:"",
    type:"",
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      zyhm:options.zyhm,
      type:options.type,
      brxm:options.brxm,
      ryrq:options.ryrq
    })
    if(options.type=="jy"){
      this.getjylist()
    }else if(options.type=="yx"){
      this.getyxlist()
    }
  },
  getjylist(){
    req({
      url:util.baseUrl+"/newapi/api/brda/getzymx",
      method:"post",
      data:{
        brbm:this.data.zyhm,
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
          list:res.data.data
        })
      }
    })
  },
  getyxlist(){
    req({
      url:util.baseUrl+"/newapi/api/brda/getkyzylist",
      method:"post",
      data:{
        zyhm:this.data.zyhm,
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
          list:res.data.data
        })
      }
    })
  },
  ryxyq(e) {
    let app = getApp();
    app.globalData.yxpat_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../yxxq/yxxq',
    })
  },
  rjyjg(e) {
    wx.navigateTo({
      url: '/pages/jianyanjieguo/jianyanjieguo?sampleda=' + e.currentTarget.dataset.sampleda + "&instrid=" + e.currentTarget.dataset.instrid + "&sampleno=" + e.currentTarget.dataset.sampleno,
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