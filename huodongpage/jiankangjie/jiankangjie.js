// huodongPage/jiankangjie/jiankangjie.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      zxList:[],
      ckList:[],
      tjList:[],
      kqList:[],
      zxhhList:[]
  },
  rtcxq(e) {
    wx.navigateTo({
      url: "../../pages/tcxq/tcxq?id=" + e.currentTarget.dataset.id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if(arr.length<2){
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
    this.getzxList()
    this.getckList();
    this.gettjList();
    this.getkqList();
    this.getzxhhList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getzxList(){
    req({
      url:util.baseUrl+"/newapi/api/topic/topicpagelist",
      method:"POST",
      data:{
        stype:68,
        curpage:1,
        limt:9999,
        searchkey:"",
        sort:9
      },
      success:(res)=>{
        this.setData({
          zxList:res.data.data
        })
      }
    })
  },
  getckList(){
    req({
      url:util.baseUrl+"/newapi/api/topic/topicpagelist",
      method:"POST",
      data:{
        stype:63,
        curpage:1,
        limt:9999,
        searchkey:"",
        sort:9
      },
      success:(res)=>{
        this.setData({
          ckList:res.data.data
        })
      }
    })
  },
  gettjList(){
    req({
      url:util.baseUrl+"/newapi/api/topic/topicpagelist",
      method:"POST",
      data:{
        stype:60,
        curpage:1,
        limt:9999,
        searchkey:"",
        sort:9
      },
      success:(res)=>{
        this.setData({
          tjList:res.data.data
        })
      }
    })
  },
  getkqList(){
    req({
      url:util.baseUrl+"/newapi/api/topic/topicpagelist",
      method:"POST",
      data:{
        stype:62,
        curpage:1,
        limt:9999,
        searchkey:"",
        sort:9
      },
      success:(res)=>{
        this.setData({
          kqList:res.data.data
        })
      }
    })
  },
  getzxhhList(){
    req({
      url:util.baseUrl+"/newapi/api/topic/topicpagelist",
      method:"POST",
      data:{
        stype:90,
        curpage:1,
        limt:9999,
        searchkey:"",
        sort:9
      },
      success:(res)=>{
        this.setData({
          zxhhList:res.data.data
        })
      }
    })
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
    return {
      title: "和平国际第一届女性健康节限时特惠进行中",
      imageUrl: "https://wx.pmc-wz.com/materials/nsjlb.jpg",
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline(){
    return {
      title: "和平国际第一届女性健康节限时特惠进行中",
      imageUrl: "https://wx.pmc-wz.com/materials/nsjlb.jpg",
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid'),
    }
  },
})