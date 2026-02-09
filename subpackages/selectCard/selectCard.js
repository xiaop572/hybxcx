const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

let app = getApp();
// subpackages/selectCard/selectCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectCardVis: 9,
    daList: [],
    selectindex: 0,
    phone: "",
    brxm:"",
    sfzh:"",
    yddh:"",
    name:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if(options.phone){
      this.setData({
        name:options.name,
        phone: options.phone
      },()=>{
        this.gethisbrdalist()
      })
      return;
    }
    if(options.sfzh){
      this.setData({
        sfzh:options.sfzh,
        brxm:options.brxm,
        yddh:options.yddh
      },()=>{
      this.getsfzhcardlist()
      })
    }
    
    
  },
  changeradio(e) {
    console.log(e)
    this.setData({
      selectindex: e.currentTarget.dataset.index
    })
  },
  raddjzka() {
    wx.redirectTo({
      url: '../addjzka/addjzka',
    })
  },
  raddsfzka() {
    wx.redirectTo({
      url: '../addsfzka/addsfzka?phone=' + this.data.phone,
    })
  },
  gethisbrdalist(){
    req({
      url: util.baseUrl + "/newapi/api/brda/gethisbrdalist",
      method: "POST",
      data: {
        brxm: this.data.name,
        yddh: this.data.phone
      },
      success: (res) => {
        if (res.data.data.length > 0) {
          this.setData({
            daList: res.data.data,
            selectCardVis: 1
          })
        } else {
          this.setData({
            selectCardVis: 9
          })
        }
      }
    })
  },
  getsfzhcardlist() {
    req({
      url: util.baseUrl + "/newapi/api/brda/gethisbrdalistsfzh",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        yddh: this.data.yddh,
        sfzh: this.data.sfzh,
        brxm: this.data.brxm
      },
      success: (res) => {
        if (res.data.data.length > 0) {
          this.setData({
            daList: res.data.data,
            selectCardVis: 1
          })
        } else {
          this.setData({
            selectCardVis: 9
          })
        }
      }
    })
  },
  bindbrda() {
    console.log(app)
    let data = this.data.daList[this.data.selectindex];
    req({
      url: util.baseUrl + "/newapi/api/brda/bindbrdacard",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        brbm: data.BRBM,
        brxm: data.BRXM,
        yddh: data.YDDH,
        sfzh: data.SFZH
      },
      success: (res) => {
        if (res.data.status) {
          wx.showToast({
            title: '绑定成功',
          })
          let jumpurl=app.globalData.jumpurl;
          console.log(jumpurl)
          setTimeout(() => {
            wx.redirectTo({
              url: jumpurl ? jumpurl : "../yxList/yxList",
            })
            app.globalData.jumpurl=""
          }, 2000)
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
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
    console.log(app)
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