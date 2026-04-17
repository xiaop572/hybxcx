// huodongpage/fxgs/fxgs.js
const { req } = require('../../utils/request')
const util = require('../../utils/util')

Page({
  data: {
    nickname: '',
    story: '',
    contact: '',
    showSuccessModal: false
  },

  onLoad(options) {},

  onInputNickname(e) {
    this.setData({ nickname: e.detail.value })
  },

  onInputStory(e) {
    this.setData({ story: e.detail.value })
  },

  onInputContact(e) {
    this.setData({ contact: e.detail.value })
  },

  submitForm() {
    const { nickname, story, contact } = this.data

    if (!nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    if (!story.trim() || story.trim().length < 20) {
      wx.showToast({ title: '故事内容至少20字', icon: 'none' })
      return
    }

    if (!contact.trim()) {
      wx.showToast({ title: '请留下联系方式', icon: 'none' })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(contact)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })

    req({
      url: util.baseUrl + '/newapi/api/huodong/storysend',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: contact.trim(),
        nickname: nickname.trim(),
        story: story.trim()
      },
      success: res => {
        wx.hideLoading()
        if (res.data.status) {
          this.setData({ showSuccessModal: true })
        } else {
          wx.showToast({ title: res.data.msg || '提交失败', icon: 'none' });
          this.setData({
            showSuccessModal:true
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      }
    })
  },

  closeSuccessModal() {
    this.setData({ showSuccessModal: false })
  },

  onShareAppMessage() {
    return {
      title: '2026为健康美代言',
      path: '/huodongpage/fxgs/fxgs'
    }
  }
})
