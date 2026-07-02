const {
  req
} = require('../../utils/request')
const util = require('../../utils/util')

const CARD_LIST_CACHE_KEY = 'healthpassport_medical_cards'
const CURRENT_CARD_CACHE_KEY = 'healthpassport_current_card'

function maskCardNo(cardNo) {
  const text = String(cardNo || '')
  if (!text) {
    return '****************'
  }
  if (text.length <= 4) {
    return text
  }
  return '*'.repeat(Math.max(text.length - 4, 0)) + text.slice(-4)
}

function getCurrentMember() {
  return wx.getStorageSync('healthpassport_current_member') || {}
}

Page({
  data: {
    personName: '',
    personPhone: '',
    cardList: [],
    loading: false,
    emptyText: ''
  },

  onLoad(options) {
    const currentMember = getCurrentMember()
    const raw = currentMember.raw || {}
    const personName = options && options.name
      ? decodeURIComponent(options.name)
      : currentMember.name || raw.brxm || raw.BRXM || ''
    const personPhone = options && options.phone
      ? decodeURIComponent(options.phone)
      : currentMember.phone || raw.yddh || raw.YDDH || raw.mobile || raw.phone || ''

    this.setData({
      personName,
      personPhone
    }, () => {
      this.getCardList()
    })
  },

  normalizeCard(item, index) {
    const cardNo = item.BRBM || item.brbm || item.cardNo || item.cardno || item.card || ''
    const cardName = item.BRXM || item.brxm || item.name || this.data.personName
    const phone = item.YDDH || item.yddh || item.mobile || item.phone || this.data.personPhone
    return {
      id: String(cardNo || index),
      cardNo,
      maskedCardNo: maskCardNo(cardNo),
      name: cardName,
      phone,
      sfzh: item.SFZH || item.sfzh || item.cardno || item.cardNo || '',
      lastVisit: item.XZMC || item.xzmc || item.lastVisit || '',
      raw: item
    }
  },

  getCardList() {
    const brxm = this.data.personName
    const yddh = this.data.personPhone
    if (!brxm || !yddh) {
      this.setData({
        cardList: [],
        emptyText: '缺少姓名或手机号，无法查询就诊卡'
      })
      return
    }

    this.setData({
      loading: true,
      emptyText: ''
    })
    req({
      url: util.baseUrl + '/newapi/api/brda/gethisbrdalist',
      method: 'POST',
      data: {
        brxm,
        yddh,
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        const payload = res.data || {}
        const list = Array.isArray(payload.data) ? payload.data : []
        if (payload.status === false) {
          this.setData({
            cardList: [],
            emptyText: payload.msg || '暂无可用门诊卡'
          })
          return
        }
        const cardList = list.map((item, index) => this.normalizeCard(item, index))

        wx.setStorageSync(CARD_LIST_CACHE_KEY, cardList)
        this.setData({
          cardList,
          emptyText: cardList.length ? '' : '暂无可用门诊卡'
        })
      },
      fail: () => {
        this.setData({
          emptyText: '就诊卡查询失败'
        })
      },
      complete: () => {
        this.setData({
          loading: false
        })
      }
    })
  },

  openCardData(e) {
    const id = e.currentTarget.dataset.id
    const card = this.data.cardList.find(item => item.id === id)
    if (!card) {
      wx.showToast({
        title: '请选择就诊卡',
        icon: 'none'
      })
      return
    }
    wx.setStorageSync(CURRENT_CARD_CACHE_KEY, card)
    wx.navigateTo({
      url: '/subpackagesC/healthcarddata/healthcarddata?name=' + encodeURIComponent(card.name || this.data.personName) + '&cardNo=' + encodeURIComponent(card.maskedCardNo || card.cardNo || '')
    })
  }
})
