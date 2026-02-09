const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')
let app = getApp()
// subpackages/mybangka/mybangka.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(app)
    this.getMyCard()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  getMyCard() {
    req({
      url: util.baseUrl + "/newapi/api/brda/bindmylist",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.status) {
          this.setData({
            cardlist: res.data.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },
  jiebang(e){
    
    let brbm=e.currentTarget.dataset.brbm;
    wx.showModal({
      title: '提示',
      content: '是否解绑此卡？',
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          req({
            url:util.baseUrl+"/newapi/api/brda/cancelbindcard",
            method:"POST",
            data:{
              brbm:brbm,
              openid:wx.getStorageSync('openid')
            },
            success:res=>{
              this.getMyCard()
            }
          })
        }
      }
    })
    
  },
  raddka() {
    wx.redirectTo({
      url: '../addjzka/addjzka',
    })
  },
  raddtjcard(){
    wx.navigateTo({
      url: '../addtjCard/addtjCard',
    })
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