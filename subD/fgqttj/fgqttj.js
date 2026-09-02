const { req } = require('../../utils/request')
const util = require('../../utils/util')

const COUPON_MONEY = 688
const COUPON_PROID = 0

Page({
  data: {
    money: COUPON_MONEY,
    xinmin: '',
    mobile: '',
    isSubmitting: false,
    showClaimModal: false,
    showSuccessModal: false
  },

  onLoad() {
    const realInfo = wx.getStorageSync('realInfo') || {}
    this.setData({
      xinmin: realInfo.realname || realInfo.xinmin || '',
      mobile: realInfo.mobile || ''
    })
  },

  onNameInput(e) {
    this.setData({ xinmin: e.detail.value })
  },

  onMobileInput(e) {
    this.setData({ mobile: e.detail.value })
  },

  openClaimModal() {
    this.setData({ showClaimModal: true })
  },

  closeClaimModal() {
    if (!this.data.isSubmitting) {
      this.setData({ showClaimModal: false })
    }
  },

  closeSuccessModal() {
    this.setData({ showSuccessModal: false })
  },

  preventBubble() {},

  goMyCard() {
    wx.navigateTo({ url: '/subpackages/mycard/mycard' })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  submitClaim() {
    if (this.data.isSubmitting) {
      return
    }

    const xinmin = String(this.data.xinmin || '').trim()
    const mobile = String(this.data.mobile || '').trim()
    const openid = wx.getStorageSync('openid')

    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录后领取',
        showCancel: false,
        success: () => this.goLogin()
      })
      return
    }
    if (!xinmin) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(mobile)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    this.setData({
      xinmin,
      mobile,
      isSubmitting: true
    })
    wx.showLoading({ title: '领取中...' })

    req({
      url: util.baseUrl + '/newapi/api/topic/givefgqttj',
      method: 'POST',
      data: {
        openid,
        money: COUPON_MONEY,
        proid: COUPON_PROID,
        xinmin,
        mobile
      },
      success: res => {
        const payload = res.data || {}
        if (payload.status) {
          this.setData({
            showClaimModal: false,
            showSuccessModal: true
          })
          return
        }
        wx.showModal({
          title: '提示',
          content: payload.data || payload.msg || '领取失败，请稍后重试',
          showCancel: false
        })
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({ isSubmitting: false })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '领取688元法国侨团体检券',
      path: '/subD/fgqttj/fgqttj'
    }
  }
})
