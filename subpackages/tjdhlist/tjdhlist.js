// subpackages/tjdhlist/tjdhlist.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jfspList:[],
    jfnum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    req({
      url: util.baseUrl + "/newapi/api/jifen/jftjlist",
      method: "POST",
      data: {
        curpage: 1,
        limit: 99999
      },
      success: res => {
        this.setData({
          jfspList: res.data.data
        })
      }
    })
  },
  duihuan(e){
    console.log(e)
    let data=e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '是否兑换'+e.currentTarget.dataset.title,
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          app.globalData.tc=data.item;
          wx.navigateTo({
            url: '../tjjfjiesuan/tjjfjiesuan',
          })
        }
      }
    })
  },
  rtjbg(){
    wx.navigateTo({
      url: '../tjpdf/tjpdf',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getjifen(){
    req({
      url:util.baseUrl+"/newapi/api/tjpdf/getjftjnum",
      method:"post",
      data:{
        openid:wx.getStorageSync('openid')
      },
      success:res=>{
        this.setData({
          jfnum:res.data.data.jftj
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getjifen()
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