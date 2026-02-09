const util = require('../../utils/util')
const {
  req
} = require('../../utils/request')

// subpackages/hsyy/hsyy.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: null,
    xinmin: "",
    mobile: "",
    cardno: "",
    address: "",
    memo: "",
    date: "",
    yytime: [],
    isyuedu: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var res1 = Object.prototype.toString.call(options.item) === '[object String]';
    if (!res1) {
      wx.navigateBack(-1)
    }
    this.setData({
      item: JSON.parse(options.item)
    })
    this.getyytime()
  },
  getyytime() {
    req({
      url: util.baseUrl + "/newapi/api/sm/smpaibanpage",
      method: "POST",
      data: {
        "curpage": 1,
        "limit": 9999,
        "searchkey": ""
      },
      success: res => {
        this.setData({
          yytime: res.data.data
        })
      }
    })
  },
  bindTimeChange(e) {
    this.setData({
      date: this.data.yytime[e.detail.value]['returndate']
    })
  },
  rsmxy() {
    wx.navigateTo({
      url: '../smxy/smxy',
    })
  },
  rtijiao() {
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名',
      })
      return
    } else if (!this.data.mobile) {
      wx.showToast({
        title: '请填写手机号',
      })
      return
    } else if (this.data.mobile.length !== 11) {
      wx.showToast({
        title: '手机号为11位',
      })
      return;
    } else if (!this.data.cardno) {
      wx.showToast({
        title: '请填写身份证',
      })
      return
    } else if (this.data.cardno.length !== 18) {
      wx.showToast({
        title: '身份证为18位',
      })
      return
    } else if (!this.data.address) {
      wx.showToast({
        title: '请填写地址',
      })
      return
    } else if (!this.data.date) {
      wx.showToast({
        title: '请选择时间',
      })
      return
    } else if (!this.data.isyuedu) {
      wx.showToast({
        title: '请阅读勾选协议',
      })
      return;
    }
    req({
      url: util.baseUrl + "/newapi/api/sm/personsmfw",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        address: this.data.address,
        cardno: this.data.cardno,
        date: this.data.date,
        nurse: this.data.item.name,
        memo: this.data.memo
      },
      success: res => {
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: res => {
              wx.switchTab({
                url: '../../pages/index/index',
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: res => {

            }
          })
        }
      }
    })
  },
  radioChange(e) {
    console.log(e, this.data.isyuedu)
    this.setData({
      isyuedu: !this.data.isyuedu
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