// pages/callList/callList.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    forGetCallList:null,
    curpage:1,
    limit:10,
    maxcur:0
  },
  uppage(){
    if(this.data.curpage>1){
      this.setData({
        curpage:this.data.curpage-1
      },()=>{
        this.getCallList()
      })
    }
  },
  downpage(){
    if(this.data.curpage<this.data.maxcur){
      this.setData({
        curpage:this.data.curpage+1
      },()=>{
        this.getCallList()
      })
    }
  },
  getCallList() {
    req({
      url: util.baseUrl + "/newapi/api/chat/getfriendlist",
      method: "POST",
      data: {
        "sid": "oEJsU5LvZrKoKFJ5UOh-tv4sGVeI",
        "curpage": this.data.curpage,
        "limit": this.data.limit,
        "ifcheck": 0
      },
      success:(res)=>{
        this.setData({
          list:res.data.data,
          maxcur:Math.ceil(parseInt(res.data.msg)/10)
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCallList()
    this.data.forGetCallList = setInterval(() => {
      this.getCallList();
    }, 2000);
  },
  onUnload() {
    clearInterval(this.data.forGetCallList)
  },
  onHide() {
    clearInterval(this.data.forGetCallList)
  },
  rlxkr(e) {
    console.log(e)
    wx.navigateTo({
       url: '../lxkr/lxkr?fromid='+e.currentTarget.dataset.fromid+"&fromname="+e.currentTarget.dataset.name
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

  /**
   * 生命周期函数--监听页面卸载
   */

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