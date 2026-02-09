// subpackages/jifenmingxi/jifenmingxi.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectTime: "",
    time: "",
    state: "全部",
    typeid:0,
    stateType: ["全部", "收入", "支出"],
    //typid=0就是所有明细   typeid=1就是增加积分的明细 typeid=2就是减少积分的明细
    typearr: [0, 1, 2],
    itemList: [],
    alljf:0,
    year:2022,
    month:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let date = new Date();
    this.setData({
      selectTime: date.getFullYear() + "年" + (date.getMonth() + 1) + "月",
      time: date.getFullYear() + "-" + (date.getMonth() + 1),
      year:date.getFullYear(),
      month:date.getMonth() + 1
    },()=>{
      this.getjfmxlist();
    })
  },
  bindTypeChange(e) {
    this.setData({
      state: this.data.stateType[e.detail.value],
      typeid:e.detail.value
    },()=>{
      this.getjfmxlist();
    })
  },
  bindDateChange(e) {
    let arr = e.detail.value.split("-")
    this.setData({
      time: e.detail.value,
      selectTime: arr[0] + "年" + arr[1] + "月",
      year:arr[0],
      month:arr[1]
    },()=>{
      this.getjfmxlist()
    })
  },
  getuserjifen(){
    req({
      url:util.baseUrl+"/newapi/api/jifen/getuserjifen",
      method:"POST",
      data:{
        "openid": wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
          alljf:res.data.data.alljf
        })
      }
    })
  },
  getjfmxlist(){
    req({
      url:util.baseUrl+"/newapi/api/jifen/jfmxlist",
      method:"POST",
      data:{
        "openid": wx.getStorageSync('openid'),
        curpage:1,
        limit:9999,
        typeid:this.data.typeid,
        year:this.data.year,
        month:this.data.month
      },
      success:res=>{
        this.setData({
          itemList:res.data.data
        })
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
    this.getuserjifen();
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