// huodongpage/xlybm/xlybm.js\
const {
  req
} = require('../../utils/request');
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xinmin: "",
    age: "",
    sex: "",
    jhr: "",
    mobile: "",
    sexList: ['男', '女'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  bindsexchange(e) {
    this.setData({
      sex: this.data.sexList[e.detail.value]
    })
  },
  rtijiao() {
    if (!this.data.xinmin) {
      wx.showToast({
        title: '请填写姓名',
      })
      return
    } else if (!this.data.age) {
      wx.showToast({
        title: '请填写年龄',
      })
      return
    } else if (!this.data.sex) {
      wx.showToast({
        title: '请选择性别',
      })
      return
    } else if (!this.data.jhr) {
      wx.showToast({
        title: '请填写监护人',
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
    }
    req({
      url: util.baseUrl + "/newapi/api/xys/tjxys",
      method: "POST",
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.mobile,
        xinmin: this.data.xinmin,
        sex: this.data.sex,
        age: this.data.age,
        jhr: this.data.jhr
      },
      success: res => {
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: "报名成功",
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