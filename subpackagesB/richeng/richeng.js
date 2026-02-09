// subpackagesB/richeng/richeng.js
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    index: -1,
    yclist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getyjlist()
  },
  getyjlist(){
    req({
      url:util.baseUrl+"/newapi/api/huiwu/gethclist",
      method:"POST",
      data:{
        jbid:99,
        searchkey:""
      },
      success:res=>{
        this.setData({
          list:res.data.data
        })
      }
    })
  },
  getyclist(classid){
    console.log(classid)
    req({
      url:util.baseUrl+"/newapi/api/huiwu/getyclist",
      method:"POST",
      data:{
        classid:classid,
        searchkey:""
      },
      success:res=>{
        this.setData({
          yjlist:res.data.data
        })
      }
    })
  },
  changelist(e) {
    let data = e.currentTarget.dataset;
    if (data.index == this.data.index) {
      this.setData({
        index: -1
      })
    } else {
      this.setData({
        index: data.index
      },()=>{
        this.getyclist(data.classid)
      })
    }
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