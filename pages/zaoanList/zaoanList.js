// pages/zaoanList/zaoanList.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    haibaoList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    req({
      url:util.baseUrl+"/newapi/api/member/tjtulist",
      method:"POST",
      data:{
        curpage:1,
        limit:9999
      },
      success:res=>{
        this.setData({
          haibaoList:res.data.data
        })
      }
    })
  },
  rcreatehaibao(e) {
    console.log(e)
    wx.navigateTo({
      url: '../zaoanContent/zaoanContent?haibao=' + e.currentTarget.dataset.haibao + '&id=' + e.currentTarget.dataset.id + '&xpos=' + e.currentTarget.dataset.xpos + '&ypos=' + e.currentTarget.dataset.ypos+'&jumpurl='+e.currentTarget.dataset.jumpurl+'&qrwidth='+e.currentTarget.dataset.qrwidth+'&qrheight='+e.currentTarget.dataset.qrheight+"&pictitle="+e.currentTarget.dataset.pictitle+"&kc="+e.currentTarget.dataset.kc
    })
  },
  rzaoan(){
    wx.myNavigateTo({
      url: '../zaoan/zaoan',
    })
  },
  rkqzaoan(){
    wx.myNavigateTo({
      url: '../../subpackages/kqzaoan/kqzaoan',
    })
  },
  rtjzaoan(){
    wx.myNavigateTo({
      url: '../../subpackages/tjzaoan/tjzaoan',
    })
  },
  rckzaoan(){
    wx.myNavigateTo({
      url: '../../subpackages/ckzaoan/ckzaoan',
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