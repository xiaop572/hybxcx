const {
  req
} = require('../../utils/request')
const util = require('../../utils/util')

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
  for (let i = 0; i < keys.length; i += 1) {
    const value = source[keys[i]]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return ''
}

function normalizeRow(item, index, card) {
  const dept = pick(item, ['KSMC', 'ksmc', 'DEPTNAME', 'deptname'])
  const doctor = pick(item, ['YSXM', 'ysxm', 'doctor'])
  const doctorTitle = pick(item, ['ZCMC', 'zcmc'])
  const status = pick(item, ['JZZT', 'jzzt', 'status', 'ZTMC'])
  const sequence = pick(item, ['FZXH', 'fzxh', 'YYXH', 'yyxh'])
  const cardNo = pick(item, ['BRBM', 'brbm', 'JZKH', 'jzkh', 'cardNo', 'cardno']) || card.cardNo
  const canCancel = String(status || '').trim() === '\u5df2\u9884\u7ea6'

  return {
    id: String(pick(item, ['YYLSH', 'yylsh', 'id']) || index),
    name: pick(item, ['BRXM', 'brxm', 'xm', 'name']) || card.name,
    phone: pick(item, ['LXDH', 'lxdh', 'SJHM', 'sjhm', 'YDDH', 'yddh']) || card.phone,
    cardNo,
    dept,
    doctor,
    doctorTitle,
    status,
    canCancel,
    sequence,
    time: pick(item, ['YYSJ', 'yysj', 'GHSJ', 'ghsj', 'OPTIME']),
    title: dept || '门诊挂号',
    raw: item
  }
}

Page({
  data: {
    personName: '',
    personPhone: '',
    cardNo: '',
    sfzh: '',
    loading: false,
    cancelingId: '',
    emptyText: '',
    list: []
  },

  onLoad(options) {
    const currentCard = wx.getStorageSync(CURRENT_CARD_CACHE_KEY) || {}
    const personName = decodeValue(options && options.name) || currentCard.name || ''
    const personPhone = decodeValue(options && options.phone) || currentCard.phone || ''
    const cardNo = decodeValue(options && options.cardNo) || currentCard.cardNo || currentCard.sfzh || ''
    const sfzh = decodeValue(options && options.sfzh) || currentCard.sfzh || ''

    this.setData({
      personName,
      personPhone,
      cardNo,
      sfzh
    }, () => {
      this.getRegistrationList()
    })
  },

  onPullDownRefresh() {
    this.getRegistrationList(() => {
      wx.stopPullDownRefresh()
    })
  },

  getCurrentCard() {
    const currentCard = wx.getStorageSync(CURRENT_CARD_CACHE_KEY) || {}
    return {
      name: this.data.personName || currentCard.name || '',
      phone: this.data.personPhone || currentCard.phone || '',
      cardNo: this.data.cardNo || currentCard.cardNo || '',
      sfzh: this.data.sfzh || currentCard.sfzh || ''
    }
  },

  getRegistrationList(done) {
    const card = this.getCurrentCard()

    if (!card.phone) {
      this.setData({
        list: [],
        emptyText: '缺少手机号，无法查询挂号记录'
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
      url: util.baseUrl + '/newapi/api/mzyy/getyyxxmy',
      method: 'POST',
      data: {
        YYLSH: '0',
        SJHM: card.phone,
        BRLY: 'QYY',
        BRXM: card.name,
        BRBM: card.cardNo,
        SFZH: card.sfzh,
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        const payload = res.data || {}
        const rows = Array.isArray(payload.data) ? payload.data : []

        if (payload.status === false) {
          this.setData({
            list: [],
            emptyText: payload.msg || '暂无挂号记录'
          })
          return
        }

        const list = rows.map((item, index) => normalizeRow(item, index, card))

        this.setData({
          list,
          emptyText: list.length ? '' : '暂无挂号记录'
        })
      },
      fail: () => {
        this.setData({
          list: [],
          emptyText: '挂号记录查询失败'
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

  cancelRegistration(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.list[index]
    if (!item || !item.canCancel) {
      return
    }

    wx.showModal({
      title: '提示',
      content: '是否取消预约？',
      success: res => {
        if (!res.confirm) {
          return
        }

        const raw = item.raw || {}
        this.setData({
          cancelingId: item.id
        })

        req({
          url: util.baseUrl + '/newapi/api/mzyy/cancelyyxx',
          method: 'POST',
          data: {
            YYLSH: pick(raw, ['YYLSH', 'yylsh']) || item.id,
            BRXM: pick(raw, ['BRXM', 'brxm']) || item.name,
            SJHM: pick(raw, ['LXDH', 'lxdh', 'SJHM', 'sjhm', 'YDDH', 'yddh']) || item.phone || this.data.personPhone,
            BRLY: 'QYY'
          },
          success: cancelRes => {
            const payload = cancelRes.data || {}
            wx.showToast({
              title: payload.msg || (payload.status === false ? '取消失败' : '取消成功'),
              icon: 'none'
            })
            if (payload.status !== false) {
              this.getRegistrationList()
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
