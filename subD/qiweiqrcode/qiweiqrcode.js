const util = require('../../utils/util')
const { req } = require('../../utils/request')

const TARGET_PAGE = 'huodongpage/qiweixc/qiweixc'
const OPENID_RETRY_COUNT = 10

Page({
  data: {
    qrcodeSrc: '',
    loading: true,
    errorMessage: ''
  },

  onLoad() {
    this.generateCode()
  },

  onUnload() {
    if (this.openidTimer) {
      clearTimeout(this.openidTimer)
    }
  },

  generateCode() {
    if (this.openidTimer) {
      clearTimeout(this.openidTimer)
    }
    this.setData({
      qrcodeSrc: '',
      loading: true,
      errorMessage: ''
    })
    this.waitForOpenid(OPENID_RETRY_COUNT)
  },

  waitForOpenid(retryCount) {
    const openid = String(wx.getStorageSync('openid') || '').trim()
    if (openid) {
      this.requestMiniCode(openid)
      return
    }
    if (retryCount <= 0) {
      this.setData({
        loading: false,
        errorMessage: '个人身份获取失败，请重新生成'
      })
      return
    }
    this.openidTimer = setTimeout(() => {
      this.waitForOpenid(retryCount - 1)
    }, 300)
  },

  requestMiniCode(openid) {
    req({
      url: util.baseUrl + '/newapi/api/hd/minilink',
      method: 'POST',
      data: {
        url: TARGET_PAGE,
        query: 'fromid=' + openid,
        typeid: 0,
        openid
      },
      success: res => {
        const base64 = res.data && res.data.data
        if (!base64) {
          this.showGenerateError((res.data && res.data.msg) || '二维码生成失败')
          return
        }
        const imageData = String(base64).indexOf('data:image/') === 0
          ? String(base64)
          : 'data:image/png;base64,' + base64
        util.base64src(imageData, imagePath => {
          this.setData({
            qrcodeSrc: imagePath,
            loading: false,
            errorMessage: ''
          })
        })
      },
      fail: () => {
        this.showGenerateError('网络异常，请重新生成')
      }
    })
  },

  showGenerateError(message) {
    this.setData({
      loading: false,
      errorMessage: message
    })
  },

  previewCode() {
    if (!this.data.qrcodeSrc) {
      return
    }
    wx.previewImage({
      current: this.data.qrcodeSrc,
      urls: [this.data.qrcodeSrc]
    })
  },

  saveCode() {
    if (!this.data.qrcodeSrc) {
      wx.showToast({ title: '二维码尚未生成', icon: 'none' })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.qrcodeSrc,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: err => {
        if (err && err.errMsg && err.errMsg.indexOf('auth deny') !== -1) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许保存图片到相册',
            confirmText: '去设置',
            success: result => {
              if (result.confirm) {
                wx.openSetting()
              }
            }
          })
          return
        }
        wx.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    })
  },

  onShareAppMessage() {
    const openid = wx.getStorageSync('openid') || ''
    return {
      title: '添加和平体检客服',
      path: '/' + TARGET_PAGE + '?fromid=' + openid
    }
  }
})
