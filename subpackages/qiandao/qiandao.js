// subpackages/qiandao/qiandao.js
const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedDays: [],
    year: "",
    month: "",
    cgshow:false,
    isqd:true,
    show:false,
    jfspList:[],
    qdnum:0
  },
  guanbi(){
    this.setData({
      cgshow:!this.data.cgshow
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let date = new Date();
    this.isuserqd();
    this.setData({
      year: parseInt(date.getFullYear()),
      month: parseInt(date.getMonth()) + 1
    }, () => {
      this.getmonthqd();
    })
    req({
      url: util.baseUrl + "/newapi/api/jifen/jifenlist",
      method: "POST",
      data: {
        curpage: 1,
        limit: 2
      },
      success: res => {
        this.setData({
          jfspList: res.data.data
        })
      }
    })
  },
  rjfdh(){
    wx.navigateTo({
      url: '../jifenduihuan/jifenduihuan',
    })
  },
  rjfxq(e){
    wx.myNavigateToz({
      url: '../../pages/jfxq/jfxq?id='+e.currentTarget.dataset.id,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getmonthqd() {
    req({
      url: util.baseUrl + "/newapi/api/qd/getmonthqd",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        year: this.data.year,
        month: this.data.month
      },
      success: res => {
        this.setData({
          qdnum:parseInt(res.data.methodDescription),
          selectedDays: res.data.data
        })
      }
    })
  },
  isuserqd(){
    req({
      url: util.baseUrl + "/newapi/api/qd/checkqd",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
          isqd:res.data.status
        })
      }
    })
  },
  qiandao() {
    req({
      url: util.baseUrl + "/newapi/api/qd/userqd",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success:res=>{
        if(res.data.status){
          this.setData({
            cgshow:true
          })
          this.isuserqd();
          this.getmonthqd()
        }
      }
    })
  },
  showRule(){
    this.setData({
      show:!this.data.show
    })
  },
  jianchange(e) {
    this.setData({
      year: parseInt(new Date(e.detail.date).getFullYear()),
      month: parseInt(new Date(e.detail.date).getMonth()) + 1
    },()=>{
      this.getmonthqd();
    })
  },
  /**
   * 点击全选触发的事件
   * bind:checkall
   */
  checkall(e) {
    console.log(e.detail.days);
  },
  /** 
   * 点击确定按钮触发的事件
   * bind:select
   */
  cmfclick(e) {
    console.log(e.detail.selectDays);
  },
  /** 
   * 点击清空事件
   * bind:clear
   */
  clear(e) {
    console.log("要清空选中日期")
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
      title: '慧医宝连续签到领积分兑好礼',
      imageUrl: 'https://wx.pmc-wz.com/materials/qdhl.jpg'
    }
  },
  onShareTimeline(){
    return {
      title: '慧医宝连续签到领积分兑好礼',
      imageUrl: 'https://wx.pmc-wz.com/materials/qdhl.jpg'
    }
  },
})