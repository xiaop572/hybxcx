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

function normalizeStatus(value) {
  const text = String(value === undefined || value === null ? '' : value)
  if (text === '0') {
    return '已预约'
  }
  if (text === '20') {
    return '已取消'
  }
  return text || '预约记录'
}

function looseNameMatch(rowName, cardName) {
  const rowText = String(rowName || '').trim()
  const cardText = String(cardName || '').trim()
  if (!rowText || !cardText) {
    return true
  }
  return rowText === cardText || rowText.indexOf(cardText) > -1 || cardText.indexOf(rowText) > -1
}

function matchCurrentMember(item, member) {
  const rowCardno = String(pick(item, ['cardno', 'CardNo', 'CARDNO', 'sfzh', 'SFZH', 'zjhm', 'ZJHM']) || '').trim()
  const rowPhone = String(pick(item, ['mobile', 'Mobile', 'MOBILE', 'phone', 'Phone', 'lxdh', 'LXDH']) || '').trim()
  const rowName = String(pick(item, ['xinmin', 'Xinmin', 'XINMIN', 'name', 'Name', 'BRXM', 'brxm']) || '').trim()
  const cardno = String(member.cardno || '').trim()
  const phone = String(member.phone || '').trim()
  const name = String(member.name || '').trim()

  if (cardno && rowCardno) {
    return rowCardno === cardno
  }
  if (phone && rowPhone) {
    return rowPhone === phone && looseNameMatch(rowName, name)
  }
  if (name && rowName) {
    return looseNameMatch(rowName, name)
  }
  return true
}

function normalizeRow(item, index, member) {
  const statusValue = pick(item, ['OrderStatus', 'orderStatus', 'status', 'Status'])
  const id = pick(item, ['Id', 'id', 'ID']) || index
  return {
    id: String(id),
    rawId: id,
    name: pick(item, ['xinmin', 'Xinmin', 'XINMIN', 'name', 'Name']) || member.name,
    phone: pick(item, ['mobile', 'Mobile', 'MOBILE', 'phone', 'Phone']) || member.phone,
    cardno: pick(item, ['cardno', 'CardNo', 'CARDNO', 'sfzh', 'SFZH', 'zjhm', 'ZJHM']) || member.cardno,
    goodsName: pick(item, ['goodsname', 'GoodsName', 'GOODSNAME', 'ProductName', 'productName']) || '体检预约',
    dept: pick(item, ['KSMC', 'ksmc']),
    doctor: pick(item, ['YSXM', 'ysxm']),
    doctorTitle: pick(item, ['ZCMC', 'zcmc']),
    time: normalizeDate(pick(item, ['DeliveryTime', 'deliveryTime', 'YYSJ', 'yysj', 'CreateTime', 'createTime'])),
    status: normalizeStatus(statusValue),
    canCancel: String(statusValue) === '0',
    raw: item
  }
}

Page({
  data: {
    personName: '',
    personPhone: '',
    cardno: '',
    loading: false,
    cancelingId: '',
    emptyText: '',
    list: []
  },

  onLoad(options) {
    const member = this.getCachedMember()
    const personName = decodeValue(options && options.name) || member.name
    const personPhone = decodeValue(options && options.phone) || member.phone
    const cardno = decodeValue(options && (options.cardno || options.sfzh)) || member.cardno

    this.setData({
      personName,
      personPhone,
      cardno
    }, () => {
      this.getAppointmentList()
    })
  },

  onPullDownRefresh() {
    this.getAppointmentList(() => {
      wx.stopPullDownRefresh()
    })
  },

  getCachedMember() {
    const member = wx.getStorageSync(CURRENT_MEMBER_CACHE_KEY) || {}
    const card = wx.getStorageSync(CURRENT_CARD_CACHE_KEY) || {}
    const raw = member.raw || {}
    return {
      name: member.name || raw.brxm || raw.BRXM || raw.xinmin || raw.name || card.name || '',
      phone: member.phone || raw.yddh || raw.YDDH || raw.mobile || raw.phone || card.phone || '',
      cardno: member.sfzh || raw.sfzh || raw.SFZH || raw.cardno || raw.cardNo || card.sfzh || ''
    }
  },

  getCurrentMember() {
    const cached = this.getCachedMember()
    return {
      name: this.data.personName || cached.name,
      phone: this.data.personPhone || cached.phone,
      cardno: this.data.cardno || cached.cardno
    }
  },

  getAppointmentList(done) {
    const member = this.getCurrentMember()

    if (!member.name && !member.phone && !member.cardno) {
      this.setData({
        list: [],
        emptyText: '缺少亲情卡信息，无法查询体检预约记录'
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
      url: util.baseUrl + '/newapi/api/tj/getyuyuetjpage',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        curpage: 1,
        limit: 99999,
        xinmin: member.name,
        mobile: member.phone,
        cardno: member.cardno
      },
      success: res => {
        const payload = res.data || {}
        const rows = Array.isArray(payload.data) ? payload.data : []

        if (payload.status === false) {
          this.setData({
            list: [],
            emptyText: payload.msg || '暂无体检预约记录'
          })
          return
        }

        const list = rows
          .filter(item => matchCurrentMember(item, member))
          .map((item, index) => normalizeRow(item, index, member))

        this.setData({
          list,
          emptyText: list.length ? '' : '当前亲情卡暂无体检预约记录'
        })
      },
      fail: () => {
        this.setData({
          list: [],
          emptyText: '体检预约记录查询失败'
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

  cancelAppointment(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.list[index]
    if (!item || !item.canCancel) {
      return
    }

    wx.showModal({
      title: '提示',
      content: '是否取消体检预约？',
      success: res => {
        if (!res.confirm) {
          return
        }

        this.setData({
          cancelingId: item.id
        })

        req({
          url: util.baseUrl + '/newapi/api/tj/canceltjyuyue',
          method: 'POST',
          data: {
            openid: wx.getStorageSync('openid'),
            tjid: item.rawId
          },
          success: cancelRes => {
            const payload = cancelRes.data || {}
            const success = payload.status === true || String(payload.msg) === '1'
            const message = typeof payload.data === 'string' && payload.data
              ? payload.data
              : (success ? '取消成功' : '取消失败')
            wx.showToast({
              title: message,
              icon: 'none'
            })
            if (success) {
              this.getAppointmentList()
            }
          },
          fail: () => {
            wx.showToast({
              title: '取消失败',
              icon: 'none'
            })
          },
          complete: () => {
            this.setData({
              cancelingId: ''
            })
          }
        })
      }
    })
  }
})
