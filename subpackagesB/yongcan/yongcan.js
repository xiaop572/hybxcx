// subpackagesB/yongcan/yongcan.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xinmin: "",
    corp: "",
    mobile: "",
    ptitle: "",
    position: "",
    memo: ""
  },
  next() {
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名',
      })
      return;
    } else if (!this.data.corp) {
      wx.showToast({
        title: '请填写单位',
      })
      return;
    } else if (this.data.mobile.length !== 11) {
      wx.showToast({
        title: '请填写电话',
      })
      return;
    } else if (!this.data.ptitle) {
      wx.showToast({
        title: '请填写专业',
      })
      return;
    } else if (!this.data.position) {
      wx.showToast({
        title: '请填写专业',
      })
      return;
    } else if (!this.data.memo) {
      wx.showToast({
        title: '请填写工作地点',
      })
      return;
    }
    this.tjtsxsbm()
  },
  tjtsxsbm() {
    let that = this;
    req({
      url: util.baseUrl + "/newapi/api/xys/tjtsxsbm",
      method: "post",
      data: {
        ...this.data
      },
      success: res => {
        console.log(res.data)
        if (res.data.status) {
          that.prepayoper()
        } else {
          wx.showToast({
            title: '提交失败',
          })
        }
      }
    })
  },
  prepayoper() {
    req({
      url: util.baseUrl + '/newapi/api/sm/prepayoper',
      method: "POST",
      data: {
        OutTradeNo: String(+new Date()),
        openId: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        corp: this.data.corp,
        typeid: 0
      },
      success: (res) => {
        if(!res.data.status){
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false
          })
          return;
        }
        wx.requestPayment({
          ...res.data.data,
          success: (ress) => {
            if (ress.errMsg === "requestPayment:ok") {
              wx.showToast({
                title: '报名成功'
              })
              this.setData({
                xinmin: "",
                mobile: "",
                corp: "",
                ptitle: "",
                position: "",
                memo: ""
              })
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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