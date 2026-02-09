// pages/nzkh/nzkh.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isyearinfo: false,
    xingming: "",
    age: "",
    mobile: "",
    tmlist: []
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
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
  },
  inttm() {
    req({
      url: util.baseUrl + "/newapi/api/pt/getdanmuinfo",
      method: "GET",
      data: {
        num:20
      },
      success: (res) => {
        this.playtm(res.data.data)
      }
    })
  },
  playtm(yhlist) {
    this.setData({
      tmlist:[]
    })
    let x = 110;
    let y = 0;
    let speed = 0.3;
    for (let i = 0; i < yhlist.length; i++) {
      y = Math.floor((Math.random() * 400) + 100);
      this.data.tmlist.push({
        avatarUrl: yhlist[i].avatarUrl,
        xinmin: yhlist[i].xinmin,
        x: x,
        y: y
      })
      this.setData({
        tmlist: this.data.tmlist
      })
    }
  },
  getbuyerinfo() {
    req({
      url: util.baseUrl + "/newapi/api/pt/getbuyerinfo",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        this.setData({
          isyearinfo: res.data.status
        })
      }
    })
  },
  submit() {
    if (!this.data.xingming || !this.data.age || !this.data.mobile) {
      wx.showToast({
        title: '请填写完整信息',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/pt/addbuyerinfo",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        xingming: this.data.xingming,
        age: this.data.age,
        mobile: this.data.mobile
      },
      success: res => {
        wx.showToast({
          title: '提交成功',
        })
        this.setData({
          isyearinfo: res.data.status
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  rpro() {
    wx.myNavigateTo({
      url: '../../subpackages/pintuanPro/pintuanPro?id=1119',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getbuyerinfo();
    this.inttm()
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