// subpackages/jifenduihuan/jifenduihuan.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jfspList:[],
    alljf:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    req({
      url: util.baseUrl + "/newapi/api/jifen/jifenlist",
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
  rjfxq(e){
    wx.myNavigateToz({
      url: '../../pages/jfxq/jfxq?id='+e.currentTarget.dataset.id,
    })
  },
  rguize(){
    wx.navigateTo({
      url: '../jifenguize/jifenguize',
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