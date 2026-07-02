const {
  req
} = require('../../utils/request')
const util = require('../../utils/util')

const BIND_LIST_CACHE_KEY = 'healthpassport_bindyylist'
const BIND_LIST_NORMALIZED_CACHE_KEY = 'healthpassport_bindyylist_normalized'
const CURRENT_MEMBER_CACHE_KEY = 'healthpassport_current_member'

function maskPhone(phone) {
  const text = String(phone || '')
  if (text.length !== 11) {
    return text || '-'
  }
  return text.slice(0, 3) + '****' + text.slice(7)
}

function pickRelation(item, index) {
  const relation = item.relation || item.gx || item.guanxi || item.relationship || item.relationName
  if (relation) {
    return relation
  }
  if (item.iftop === 1 || item.iftop === '1') {
    return '当前'
  }
  return index === 0 ? '家人' : '家人'
}

function cacheBindList(rawList, normalizedList) {
  const raw = Array.isArray(rawList) ? rawList : []
  const normalized = Array.isArray(normalizedList) ? normalizedList : []
  const currentMember = normalized.find(item => {
    const source = item.raw || {}
    return source.iftop === 1 || source.iftop === '1'
  }) || normalized[0] || null

  wx.setStorageSync(BIND_LIST_CACHE_KEY, raw)
  wx.setStorageSync(BIND_LIST_NORMALIZED_CACHE_KEY, normalized)
  wx.setStorageSync(CURRENT_MEMBER_CACHE_KEY, currentMember)
}

Page({
  data: {
    members: [],
    loading: false
  },

  onShow() {
    this.loadBindListCache()
    this.getBindList()
  },

  loadBindListCache() {
    const cachedMembers = wx.getStorageSync(BIND_LIST_NORMALIZED_CACHE_KEY)
    if (Array.isArray(cachedMembers) && cachedMembers.length) {
      this.setData({
        members: cachedMembers
      })
    }
  },

  getBindList() {
    this.setData({
      loading: true
    })
    req({
      url: util.baseUrl + '/newapi/api/yyda/bindyylist',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid')
      },
      success: res => {
        const payload = res.data || {}
        const list = Array.isArray(payload.data) ? payload.data : []
        if (payload.status) {
          const normalizedMembers = list.map((item, index) => this.normalizeMember(item, index))
          cacheBindList(list, normalizedMembers)
          this.setData({
            members: normalizedMembers
          })
        } else {
          wx.showToast({
            title: payload.msg || '获取家人列表失败',
            icon: 'none'
          })
        }
      },
      complete: () => {
        this.setData({
          loading: false
        })
      }
    })
  },

  normalizeMember(item, index) {
    const name = item.brxm || item.name || item.realname || ''
    const phone = item.yddh || item.mobile || item.phone || ''
    const sfzh = item.sfzh || item.SFZH || item.cardno || item.cardNo || ''
    return {
      id: String(item.id || item.yyid || sfzh || phone || index),
      name: name || '未命名家人',
      sfzh,
      relation: pickRelation(item, index),
      phone,
      maskedPhone: maskPhone(phone),
      bindText: '已绑定就诊卡',
      bound: true,
      raw: item
    }
  },

  goBack() {
    wx.navigateBack()
  },

  openMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.members.find(item => item.id === id)
    if (!member) {
      wx.showToast({
        title: '请选择家人',
        icon: 'none'
      })
      return
    }
    wx.setStorageSync(CURRENT_MEMBER_CACHE_KEY, member)
    wx.navigateTo({
      url: '/subpackagesC/healthhome/healthhome?name=' + encodeURIComponent(member.name) + '&phone=' + encodeURIComponent(member.phone || '') + '&sfzh=' + encodeURIComponent(member.sfzh || member.raw.sfzh || member.raw.SFZH || member.raw.cardno || '')
    })
  },

  addMember() {
    wx.navigateTo({
      url: '/subpackages/addqinqing/addqinqing'
    })
  }
})
