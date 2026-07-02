const {
  req
} = require('../../utils/request')
const util = require('../../utils/util')

const CURRENT_MEMBER_CACHE_KEY = 'healthpassport_current_member'
const CURRENT_CARD_CACHE_KEY = 'healthpassport_current_card'

function decodeValue(value) {
  if (!value && value !== 0) {
    return ''
  }
  try {
    return decodeURIComponent(value)
  } catch (err) {
    return String(value)
  }
}

function pick(source, keys) {
  const data = source || {}
  for (let i = 0; i < keys.length; i += 1) {
    const value = data[keys[i]]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return ''
}

function normalizeDate(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

function normalizeReport(item, index) {
  return {
    id: String(pick(item, ['id', 'Id', 'ID', 'SerialNo', 'serialNo']) || index),
    title: pick(item, ['Title', 'title', 'ReportName', 'reportName', 'TJMC', 'tjmc']) || '体检报告',
    checkDate: normalizeDate(pick(item, ['CheckDate', 'checkDate', 'CHECKDATE', 'CreateTime', 'createTime'])),
    pdfUrl: pick(item, ['pdfdir', 'PDFDIR', 'pdfUrl', 'PdfUrl', 'url', 'Url']),
    raw: item
  }
}

function getCachedMember() {
  const member = wx.getStorageSync(CURRENT_MEMBER_CACHE_KEY) || {}
  const card = wx.getStorageSync(CURRENT_CARD_CACHE_KEY) || {}
  const raw = member.raw || {}
  return {
    name: member.name || raw.brxm || raw.BRXM || raw.xinmin || raw.name || card.name || '',
    phone: member.phone || raw.yddh || raw.YDDH || raw.mobile || raw.phone || card.phone || '',
    cardno: member.sfzh || raw.sfzh || raw.SFZH || raw.cardno || raw.cardNo || card.sfzh || ''
  }
}

Page({
  data: {
    personName: '',
    personPhone: '',
    cardno: '',
    loading: false,
    emptyText: '',
    list: []
  },

  onLoad(options) {
    const member = getCachedMember()
    const personName = decodeValue(options && options.name) || member.name
    const personPhone = decodeValue(options && options.phone) || member.phone
    const cardno = decodeValue(options && (options.cardno || options.sfzh)) || member.cardno

    this.setData({
      personName,
      personPhone,
      cardno
    }, () => {
      this.getReportList()
    })
  },

  onPullDownRefresh() {
    this.getReportList(() => {
      wx.stopPullDownRefresh()
    })
  },

  onHide() {
    wx.hideLoading()
  },

  getReportList(done) {
    if (!this.data.personName || !this.data.personPhone) {
      this.setData({
        list: [],
        emptyText: '缺少亲情卡姓名或手机号，无法查询体检报告'
      })
      if (done) {
        done()
      }
      return
    }

    this.setData({
      loading: true,
      emptyText: ''
    })

    req({
      url: util.baseUrl + '/newapi/api/weilan/qjtpdflist',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        mobile: this.data.personPhone,
        xinmin: this.data.personName,
        cardno: this.data.cardno
      },
      success: res => {
        const payload = res.data || {}
        const rows = Array.isArray(payload.data) ? payload.data : []

        if (payload.status === false) {
          this.setData({
            list: [],
            emptyText: payload.msg || '暂无体检报告'
          })
          return
        }

        const list = rows.map((item, index) => normalizeReport(item, index))
        this.setData({
          list,
          emptyText: list.length ? '' : '当前亲情卡暂无体检报告'
        })
      },
      fail: () => {
        this.setData({
          list: [],
          emptyText: '体检报告查询失败'
        })
      },
      complete: () => {
        this.setData({
          loading: false
        })
        if (done) {
          done()
        }
      }
    })
  },

  lookPdf(e) {
    const pdfUrl = e.currentTarget.dataset.pdf
    if (!pdfUrl) {
      wx.showToast({
        title: '报告地址为空',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    wx.downloadFile({
      url: pdfUrl,
      success: res => {
        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: 'pdf',
          showMenu: true
        })
      },
      fail: () => {
        wx.showToast({
          title: '报告打开失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  copyPath(e) {
    const pdfUrl = e.currentTarget.dataset.pdf
    if (!pdfUrl) {
      return
    }
    wx.setClipboardData({
      data: pdfUrl,
      success: () => {
        wx.showToast({
          title: '路径已复制',
          icon: 'success'
        })
      }
    })
  }
})
