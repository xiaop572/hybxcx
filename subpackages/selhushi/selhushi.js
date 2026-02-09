// subpackages/selhushi/selhushi.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    hulist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.gethulist()
  },
  gethulist(){
    req({
      url:util.baseUrl+"/newapi/api/sm/smnursepage",
      method:"POST",
      data:{
        curpage:1,
        limit:9999,
        searchkey:""
      },
      success:res=>{
        this.setData({
          hulist:res.data.data
        })
      }
    })
  },
  rhsyy(e){
    if(e.currentTarget.dataset.item.id===7 || e.currentTarget.dataset.item.id===8){
      wx.showToast({
        title: '预约已满',
      })
      return;
    }
    let item=JSON.stringify(e.currentTarget.dataset.item);
    wx.navigateTo({
      url: '../hsyy/hsyy?item='+item,
    })
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
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