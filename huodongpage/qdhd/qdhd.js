// huodongpage/qdhd/qdhd.js
const {
  req
} = require('../../utils/request')
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedType: '',
    submitting: false,
    showSuccessPopup: false,
    optionList: [
      { label: '手机号', value: 'mobile' },
      { label: '身份证号', value: 'idcard' },
      { label: '年龄', value: 'age' }
    ]
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
  selectType(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      selectedType: value
    })
  },
  submitQuan() {
    if (!this.data.selectedType) {
      wx.showToast({
        title: '请选择一项',
        icon: 'none'
      })
      return
    }
    if (this.data.submitting) {
      return
    }
    this.setData({
      submitting: true
    })
    wx.showLoading({
      title: '提交中...'
    })
    req({
      url: util.baseUrl + '/newapi/api/huodong/give7yearquan',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        money: 0,
        proid: 0,
        xinmin: '',
        mobile: ''
      },
      success: (res) => {
        wx.hideLoading()
        this.setData({
          submitting: false
        })
        if (res.data.status) {
          this.setData({
            showSuccessPopup: true
          })
        } else {
          wx.showToast({
            title: res.data.msg || res.data.data || '提交失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.setData({
          submitting: false
        })
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },
  hideSuccessPopup() {
    this.setData({
      showSuccessPopup: false
    })
  },
  stopBubble() {},
  goMyCard() {
    this.setData({
      showSuccessPopup: false
    })
    wx.navigateTo({
      url: '/subpackages/mycard/mycard'
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
    return {
      title: '和平国际七周年庆，价值777元的健康美礼免费领，数量有限，先到先得！',
      path: '/huodongpage/qdhd/qdhd?fromid=' + wx.getStorageSync('openid'),
      imageUrl: "https://wx.pmc-wz.com/materials/qdhdbanner.png"
    };
  }
})
