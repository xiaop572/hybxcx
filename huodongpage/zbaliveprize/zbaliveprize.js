const util = require('../../utils/util')
const { req } = require('../../utils/request')

const IMAGE_BASE_URL = util.baseUrl + '/hyb/ximages/'

function getUploadPath(payload) {
  const list = payload && payload.data && payload.data.list
  return Array.isArray(list) && list[0] ? String(list[0].file_path || '') : ''
}

function getImageUrl(path) {
  const value = String(path || '').trim()

  if (!value || /^(https?:)?\/\//.test(value) || /^(wxfile|http|https):/.test(value)) {
    return value
  }

  if (value.indexOf('/') === 0) {
    return util.baseUrl + value
  }

  if (value.indexOf('hyb/ximages/') === 0) {
    return util.baseUrl + '/' + value
  }

  return IMAGE_BASE_URL + value
}

function getErrorMessage(payload, defaultMessage) {
  if (!payload) {
    return defaultMessage
  }

  return payload.msg || payload.message || (typeof payload.data === 'string' ? payload.data : '') || defaultMessage
}

function isLoginExpired(payload) {
  return !!payload && (Number(payload.code) === 14007 || Number(payload.data) === 14007)
}

Page({
  data: {
    assets: {
      wenzhouLogo: util.externalUrl + '/zbayure-team-wenzhou.png',
      zhujiLogo: util.externalUrl + '/zbayure-team-zhuji.png',
      vsLogo: util.externalUrl + '/zbayure-vs.png'
    },
    cardOptions: [
      {
        key: 'health-198',
        maxProjects: 1,
        name: '价值198元健康美礼包（5选1，整形项目3院通用）',
        items: [
          '超声波洁牙1次',
          '超声波疗法（理疗）3次',
          '高压氧体验1次',
          '光子嫩肤1次（和平国际医院/和平整形环城路院区/和平整形府东路院区通用）',
          '单部位脱毛1次（和平国际医院/和平整形环城路院区/和平整形府东路院区通用）'
        ]
      },
      {
        key: 'health-1980',
        maxProjects: 2,
        name: '价值1980元健康美礼包（6选2，整形项目3院通用）',
        items: [
          '680元健康体检套餐',
          '第二人生玻尿酸1支（和平国际医院/和平整形环城路院区/和平整形府东路院区通用）',
          '光子嫩肤1次（和平国际医院/和平整形环城路院区/和平整形府东路院区通用）',
          '超声波洁牙1次',
          '体外冲击波疗法1次',
          '超声波疗法（理疗）6次'
        ]
      }
    ],
    selectedCardKey: '',
    selectedProjectIndexes: [],
    selectedProjectFlags: [],
    nickname: '',
    mobile: '',
    screenshotPath: '',
    screenshotPreview: '',
    phoneLoading: false,
    uploading: false,
    submitting: false,
    submitted: false
  },

  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  onMobileInput(e) {
    this.setData({
      mobile: String(e.detail.value || '').replace(/\D/g, '').slice(0, 11)
    })
  },

  selectCard(e) {
    if (this.data.submitting || this.data.submitted) {
      return
    }

    const key = e.currentTarget.dataset.key

    this.setData({
      selectedCardKey: key || '',
      selectedProjectIndexes: [],
      selectedProjectFlags: []
    })
  },

  selectProject(e) {
    if (this.data.submitting || this.data.submitted) {
      return
    }

    const projectIndex = Number(e.currentTarget.dataset.index)

    if (!Number.isInteger(projectIndex)) {
      return
    }

    const selectedCard = this.data.cardOptions.find(item => item.key === this.data.selectedCardKey)

    if (!selectedCard) {
      return
    }

    const maxProjects = selectedCard.maxProjects || 1
    const selectedProjectIndexes = this.data.selectedProjectIndexes || []
    const selectedIndexPosition = selectedProjectIndexes.indexOf(projectIndex)
    let nextSelectedIndexes

    if (maxProjects === 1) {
      // 单选礼包点击其他项目时直接替换，无需先取消当前选择。
      nextSelectedIndexes = [projectIndex]
    } else if (selectedIndexPosition >= 0) {
      nextSelectedIndexes = selectedProjectIndexes.slice()
      nextSelectedIndexes.splice(selectedIndexPosition, 1)
    } else if (selectedProjectIndexes.length < maxProjects) {
      nextSelectedIndexes = selectedProjectIndexes.concat(projectIndex)
    } else {
      wx.showToast({
        title: '该礼包最多选择' + maxProjects + '项',
        icon: 'none'
      })
      return
    }

    const nextSelectedFlags = []
    nextSelectedIndexes.forEach(index => {
      nextSelectedFlags[index] = true
    })

    this.setData({
      selectedProjectIndexes: nextSelectedIndexes,
      selectedProjectFlags: nextSelectedFlags
    })
  },

  getPhoneNumber(e) {
    if (this.data.phoneLoading || this.data.submitting || this.data.submitted) {
      return
    }

    const detail = e.detail || {}

    if (!detail.iv || !detail.encryptedData) {
      wx.showToast({
        title: '未获取手机号，可手动填写',
        icon: 'none'
      })
      return
    }

    this.setData({
      phoneLoading: true
    })

    req({
      url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile2',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        iv: detail.iv,
        encryptedData: detail.encryptedData,
        session_key: wx.getStorageSync('sessionKey')
      },
      success: res => {
        const payload = res.data || {}
        const phone = typeof payload.data === 'string'
          ? payload.data
          : String((payload.data && (payload.data.mobile || payload.data.phoneNumber)) || '')

        if (!payload.status || !/^1\d{10}$/.test(phone)) {
          wx.showToast({
            title: getErrorMessage(payload, '获取手机号失败'),
            icon: 'none'
          })
          return
        }

        this.setData({
          mobile: phone
        })
        wx.showToast({
          title: '获取成功',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '获取手机号失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          phoneLoading: false
        })
      }
    })
  },

  chooseImage() {
    if (this.data.uploading || this.data.submitting || this.data.submitted) {
      return
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original'],
      success: res => {
        const file = res.tempFiles && res.tempFiles[0]

        if (!file || !file.tempFilePath) {
          wx.showToast({
            title: '未获取到图片',
            icon: 'none'
          })
          return
        }

        this.uploadImage(file.tempFilePath)
      }
    })
  },

  uploadImage(filePath) {
    this.setData({
      screenshotPath: '',
      screenshotPreview: filePath,
      uploading: true
    })

    wx.uploadFile({
      url: util.baseUrl + '/newapi/api/youx/upload',
      filePath,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + wx.getStorageSync('token')
      },
      success: res => {
        try {
          const payload = JSON.parse(res.data || '{}')

          if (isLoginExpired(payload)) {
            this.resetUploadedImage()
            wx.showModal({
              title: '需要授权登录',
              content: '请先授权登录，登录成功后请重新上传中奖截图。',
              confirmText: '去登录',
              cancelText: '取消',
              success: modalRes => {
                if (modalRes.confirm) {
                  wx.navigateTo({
                    url: '/pages/login/login'
                  })
                }
              }
            })
            return
          }

          const uploadPath = getUploadPath(payload)

          if (res.statusCode < 200 || res.statusCode >= 300 || payload.status === false || !uploadPath) {
            throw new Error(getErrorMessage(payload, '上传失败'))
          }

          this.setData({
            screenshotPath: uploadPath,
            screenshotPreview: getImageUrl(uploadPath)
          })
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } catch (error) {
          this.resetUploadedImage()
          wx.showToast({
            title: error.message || '上传失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        this.resetUploadedImage()
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          uploading: false
        })
      }
    })
  },

  resetUploadedImage() {
    this.setData({
      screenshotPath: '',
      screenshotPreview: ''
    })
  },

  previewImage() {
    if (!this.data.screenshotPreview) {
      return
    }

    wx.previewImage({
      current: this.data.screenshotPreview,
      urls: [this.data.screenshotPreview]
    })
  },

  submitForm() {
    if (this.data.submitting || this.data.submitted) {
      return
    }

    const nickname = String(this.data.nickname || '').trim()
    const mobile = String(this.data.mobile || '').trim()

    if (!nickname) {
      wx.showToast({
        title: '请填写直播间昵称',
        icon: 'none'
      })
      return
    }

    if (!/^1\d{10}$/.test(mobile)) {
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      })
      return
    }

    if (this.data.uploading) {
      wx.showToast({
        title: '图片正在上传',
        icon: 'none'
      })
      return
    }

    if (!this.data.screenshotPath) {
      wx.showToast({
        title: '请上传中奖截图',
        icon: 'none'
      })
      return
    }

    const selectedCard = this.data.cardOptions.find(item => item.key === this.data.selectedCardKey)

    if (!selectedCard) {
      wx.showToast({
        title: '请选择中奖卡券',
        icon: 'none'
      })
      return
    }

    const selectedProjectIndexes = this.data.selectedProjectIndexes || []
    const selectedProjects = selectedProjectIndexes
      .map(index => selectedCard.items[index])
      .filter(Boolean)
    const maxProjects = selectedCard.maxProjects || 1

    if (selectedProjects.length !== maxProjects) {
      wx.showToast({
        title: '请选择' + maxProjects + '项礼包项目',
        icon: 'none'
      })
      return
    }

    const openid = wx.getStorageSync('openid')

    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '请登录后提交兑奖信息',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
      return
    }

    this.setData({
      submitting: true
    })

    req({
      url: util.baseUrl + '/newapi/api/youx/postyou',
      method: 'POST',
      data: {
        binqinpic: '',
        cardno: '',
        memo: '浙BA聊个球 BA 直播间中奖登记',
        mobile,
        openid,
        sex: '',
        weixin: nickname,
        wendupic: this.data.screenshotPath,
        xinmin: nickname,
        address: selectedCard.name + '；项目：' + selectedProjects.join('、'),
        nl: 0
      },
      success: res => {
        const payload = res.data || {}

        if (!payload.status) {
          wx.showToast({
            title: getErrorMessage(payload, '提交失败，请重试'),
            icon: 'none'
          })
          return
        }

        this.setData({
          submitted: true
        })
        wx.showModal({
          title: '登记成功',
          content: '中奖礼品卡券将在3个工作日内发放到【慧医宝】小程序账户，请留意短信提醒。',
          showCancel: false
        })
      },
      fail: () => {
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          submitting: false
        })
      }
    })
  }
})
