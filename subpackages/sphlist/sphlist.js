// subpackages/zxlist/zxlist.js
const util = require('../../utils/util');
const {
  req
} = require("../../utils/request");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    fllist:[],
    zxlist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getfl()
  },
  getfl(){
    req({
      url:util.baseUrl+"/newapi/api/cms/getvideotype",
      method:"POST",
      data:{
        classid:0
      },
      success:(res)=>{
        this.setData({
          fllist:res.data.data
        },()=>{
          this.getzxlist()
        })
      }
    })
  },
  getzxlist(){
    req({
      url:util.baseUrl+"/newapi/api/cms/allvideo",
      method:"POST",
      data:{
        "curpage": 1,
        "limit": 99999,
        "typeid": this.data.fllist[this.data.currentIndex].typeid,
        "searchkey": ""
      },
      success:(res)=>{
        this.setData({
          zxlist:res.data.data
        })
      }
    })
  },
  titleClick: function (e) {
    this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx
    },()=>{
      this.getzxlist()
    })
  },
  rspxq(e){
    wx.navigateTo({
      url: '../sph/sph?id='+e.currentTarget.dataset.id,
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