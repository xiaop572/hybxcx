const {
  req
} = require("../../utils/request")

const util = require('../../utils/util')
// pages/yizhenbaoming/yizhenbaoming.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: [{
      label: "鳌江",
      value: "鳌江"
    }, {
      label: "金乡",
      value: "金乡"
    }],
    checkList: [{
      label: "有",
      value: "有"
    }, {
      label: "无",
      value: "无"
    }],
    name: "",
    age: "",
    sex: "",
    phone: "",
    addresscheck: "",
    da1: "",
    da2: "",
    da3: "",
    da4: "",
    da5: "",
    da6: "",
    da7: "",
    da8: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  changeselect(e) {
    console.log(e)
    this.setData({
      [e.currentTarget.dataset.target]: e.currentTarget.dataset.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  changecheck(e) {
    console.log(e)
    this.setData({
      addresscheck: e.detail.value[e.detail.value.length - 1]
    })
  },
  submit() {
    if (!this.data.name || !this.data.age || !this.data.sex || !this.data.addresscheck || !this.data.phone || !this.data.da1 || !this.data.da2 || !this.data.da3 || !this.data.da4 || !this.data.da5 || !this.data.da6 || !this.data.da7 || !this.data.da8) {
      wx.showToast({
        title: '信息未填写完整',
      })
      return;
    }
    let params = {
      "xinmin": this.data.name,
      "mobile": this.data.phone,
      "sex": this.data.sex,
      "nianling": this.data.age,
      "address": this.data.addresscheck,
      "da1": this.data.da1,
      "da2": this.data.da2,
      "da3": this.data.da3,
      "da4": this.data.da4,
      "da5": this.data.da5,
      "da6": this.data.da6,
      "da7": this.data.da7,
      "da8": this.data.da8,
      "openid": wx.getStorageSync('openid')
    }
    req({
      url: util.baseUrl + "/newapi/api/hd/baoming",
      method: "POST",
      data: params,
      success: res => {
        if (res.data.status) {
          wx.showToast({
            title: '报名成功',
          })
          this.setData({
            name: "",
            age: "",
            sex: "",
            phone: "",
            addresscheck: "",
            da1: "",
            da2: "",
            da3: "",
            da4: "",
            da5: "",
            da6: "",
            da7: "",
            da8: ""
          })
        } else {
          wx.showToast({
            title: '报名失败',
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