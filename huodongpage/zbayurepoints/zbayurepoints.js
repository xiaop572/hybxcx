const util = require('../../utils/util')
const { req } = require('../../utils/request')

const PAGE_SIZE = 20

function pickValue(obj, keys, defaultValue) {
  for (let i = 0; i < keys.length; i += 1) {
    if (obj && obj[keys[i]] !== undefined && obj[keys[i]] !== null) {
      return obj[keys[i]]
    }
  }
  return defaultValue
}

function toNumber(value, defaultValue) {
  const matched = typeof value === 'string' ? value.match(/[-+]?\d+(\.\d+)?/) : null
  const number = Number(matched ? matched[0] : value)
  return Number.isNaN(number) ? defaultValue : number
}

function unwrapData(payload) {
  if (payload && payload.data !== undefined) {
    return payload.data
  }
  if (payload && payload.Data !== undefined) {
    return payload.Data
  }
  return payload
}

function unwrapList(payload) {
  const data = unwrapData(payload)
  if (Array.isArray(data)) {
    return data
  }
  if (data && Array.isArray(data.list)) {
    return data.list
  }
  if (data && Array.isArray(data.List)) {
    return data.List
  }
  if (data && Array.isArray(data.rows)) {
    return data.rows
  }
  if (data && Array.isArray(data.records)) {
    return data.records
  }
  if (data && data.data && Array.isArray(data.data)) {
    return data.data
  }
  if (data && data.data && Array.isArray(data.data.list)) {
    return data.data.list
  }
  if (data && data.data && Array.isArray(data.data.records)) {
    return data.data.records
  }
  return []
}

function unwrapPoints(payload) {
  const data = unwrapData(payload)
  if (typeof data === 'number' || typeof data === 'string') {
    return toNumber(data, 0)
  }
  const points = pickValue(data, [
    'points',
    'Points',
    'point',
    'Point',
    'score',
    'Score',
    'total',
    'Total',
    'balance',
    'Balance',
    'currentPoints',
    'CurrentPoints',
    'availablePoints',
    'AvailablePoints',
    'available',
    'Available',
    'totalPoints',
    'TotalPoints'
  ], undefined)
  if (points !== undefined) {
    return toNumber(points, 0)
  }
  return toNumber(pickValue(payload, ['msg', 'Msg'], 0), 0)
}

function formatDate(value) {
  const text = String(value || '').trim()
  if (!text) {
    return ''
  }
  const match = text.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)
  if (match) {
    return `${match[1]}.${String(match[2]).padStart(2, '0')}.${String(match[3]).padStart(2, '0')}`
  }
  const date = new Date(text.replace(/-/g, '/'))
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }
  return text
}

function normalizeLog(item, index) {
  const title = pickValue(item, [
    'title',
    'Title',
    'name',
    'Name',
    'typeName',
    'TypeName',
    'remark',
    'Remark',
    'description',
    'Description',
    'source',
    'Source',
    'type',
    'Type'
  ], '积分变动')
  const rawValue = pickValue(item, [
    'points',
    'Points',
    'point',
    'Point',
    'score',
    'Score',
    'amount',
    'Amount',
    'value',
    'Value',
    'change',
    'Change',
    'delta',
    'Delta',
    'changePoints',
    'ChangePoints',
    'pointChange',
    'PointChange'
  ], 0)
  const valueNumber = toNumber(rawValue, 0)
  const rawDate = pickValue(item, [
    'createTime',
    'CreateTime',
    'createdAt',
    'CreatedAt',
    'date',
    'Date',
    'createDate',
    'CreateDate',
    'time',
    'Time'
  ], '')

  return {
    key: pickValue(item, ['id', 'Id', 'logId', 'LogId'], `${index}-${rawDate}-${rawValue}`),
    title,
    date: formatDate(rawDate),
    valueNumber,
    valueText: `${valueNumber >= 0 ? '+' : ''}${valueNumber}`
  }
}

function requestApi(url, data) {
  return new Promise((resolve, reject) => {
    req({
      url,
      method: 'POST',
      data,
      success: resolve,
      fail: reject
    })
  })
}

Page({
  data: {
    points: 0,
    logs: [],
    page: 1,
    limit: PAGE_SIZE,
    loading: false,
    finished: false
  },

  onLoad() {
    this.refreshData()
  },

  onPullDownRefresh() {
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.loading || this.data.finished) {
      return
    }
    this.loadLogs(false)
  },

  refreshData() {
    this.setData({
      logs: [],
      page: 1,
      finished: false
    })
    return Promise.all([
      this.loadPoints(),
      this.loadLogs(true)
    ])
  },

  getRequestData(page, limit) {
    return {
      openid: wx.getStorageSync('openid') || '',
      page,
      limit: limit === undefined ? this.data.limit : limit
    }
  },

  ensureOpenid() {
    if (wx.getStorageSync('openid')) {
      return true
    }
    wx.showToast({
      title: '请先登录后查看',
      icon: 'none'
    })
    return false
  },

  loadPoints() {
    if (!this.ensureOpenid()) {
      return Promise.resolve()
    }

    return requestApi(util.baseUrl + '/newapi/api/zjba/getpoints', this.getRequestData(0, 0))
      .then(res => {
        this.setData({
          points: unwrapPoints(res.data)
        })
      })
      .catch(() => {
        wx.showToast({
          title: '积分获取失败',
          icon: 'none'
        })
      })
  },

  loadLogs(isRefresh) {
    if (!this.ensureOpenid()) {
      return Promise.resolve()
    }

    const page = 0
    this.setData({ loading: true })

    return requestApi(util.baseUrl + '/newapi/api/zjba/getpointlogs', this.getRequestData(page, 0))
      .then(res => {
        const nextLogs = unwrapList(res.data).map(normalizeLog)

        this.setData({
          logs: nextLogs,
          page: 1,
          finished: true
        })
      })
      .catch(() => {
        wx.showToast({
          title: '积分明细获取失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  }
})
