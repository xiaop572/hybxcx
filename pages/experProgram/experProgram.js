const util = require('../../utils/util')
const { req } = require('../../utils/request')
Page({
  onLoad(options) {
    this.setData({
      mobile: wx.getStorageSync('realInfo').mobile
    })
    req({
      url: util.baseUrl + '/newapi/api/mindex/picturelist',
      method: 'POST',
      data: {
        current_page: 1,
        per_page: 20
      },
      success: res => {
        if (res.data.Data.list.length === 0) {
          wx.showModal({
            title: '提示',
            content: '暂时没有体验活动',
            showCancel:false,
            success(res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          return;
        }
        this.setData({
          exList: res.data.Data.list
        })
      }
    })
  },
  getPhoneNumber(e) {
    if (e.detail.iv && e.detail.encryptedData) {
      req({
        url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: res => {
          util.setRealInfo(() => {
            this.setData({
              mobile: wx.getStorageSync('realInfo').mobile
            })
          })

        }
      })
    }
  },
  changeIndex(e) {
    this.setData({
      current: e.detail.current
    })
  },
  showPlace(e) {
    this.setData({
      active: e.currentTarget.dataset.idx
    })
  },
  submit() {
    if (!this.data.mobile) {
      wx.showToast({
        title: '请先获取手机号'
      })
    } else {
      let currentData = this.data.exList[this.data.current];
      req({
        url: util.baseUrl + '/newapi/api/mindex/tjyuyue',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          mobile: this.data.mobile,
          xiangmu: currentData.pictitle
        },
        success: (res) => {
          wx.showToast({
            title: '预约成功'
          })
          this.setData({
            active: -1
          })
        }
      })
    }
  },
  data: {
    xinmin:"",
    currentList: [],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 5000,
    duration: 500,
    current: 0,
    active: -1,
    mobile: "",
    exList: []
  },
})