const { req } = require('../../utils/request')
const util = require('../../utils/util')

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

function pick(obj, keys) {
  for (let i = 0; i < keys.length; i += 1) {
    const value = obj && obj[keys[i]]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return ''
}

function pad2(value) {
  return value < 10 ? `0${value}` : String(value)
}

function formatDate(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'number' || /^\d{10,13}$/.test(String(value))) {
    const text = String(value)
    const timestamp = text.length === 10 ? Number(text) * 1000 : Number(text)
    const date = new Date(timestamp)
    if (!Number.isNaN(date.getTime())) {
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
    }
  }
  const text = String(value).trim()
  const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (match) {
    return `${match[1]}-${pad2(Number(match[2]))}-${pad2(Number(match[3]))}`
  }
  const date = new Date(text)
  if (!Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  }
  return text
}

function normalizeList(source) {
  const data = parseMaybeJson(source)
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  const list = data.list || data.rows || data.data || data.items || data.records
  return Array.isArray(list) ? list : []
}

function getAdmissionNo(item) {
  return String(pick(item, ['ZYH', 'zyh', 'zyhm', 'ZYHM', '住院号', '住院流水号', 'inpatientNo']) || '').trim()
}

function formatAdmission(item, index) {
  return {
    raw: item,
    index: index + 1,
    zyh: getAdmissionNo(item),
    name: pick(item, ['BRXM', 'brxm', 'XM', 'xm', 'name', '姓名']),
    dept: pick(item, ['KSMC', 'ksmc', 'BQMC', 'bqmc', 'deptName', '科室']),
    inDate: formatDate(pick(item, ['RYRQ', 'ryrq', 'RYSJ', '入院日期', 'admitDate'])),
    outDate: formatDate(pick(item, ['CYRQ', 'cyrq', 'CYSJ', '出院日期', 'dischargeDate'])),
    status: pick(item, ['ZYZT', 'zyzt', 'status', '状态'])
  }
}

function normalizeBaseInfo(source) {
  const data = parseMaybeJson(source)
  if (!data || typeof data !== 'object') return {}
  return data.baseInfo || data.baseinfo || data.info || data.brxx || data.patient || data
}

const DATE_LIST_KEYS = [
  'dateList', 'fyrqList', 'feeDateList', 'dates', 'list', 'rows', 'items',
  'records', 'rqList', 'fyDates', '费用日期列表', '日期列表'
]
const DATE_VALUE_KEYS = ['FYRQ', 'fyrq', 'FEE_DATE', 'feeDate', 'RQ', 'rq', 'date', '费用日期', '日期']

function hasDateValue(item) {
  if (typeof item === 'string' || typeof item === 'number') {
    return !!formatDate(item)
  }
  if (!item || typeof item !== 'object') {
    return false
  }
  return !!formatDate(pick(item, DATE_VALUE_KEYS))
}

function findDateList(data, depth) {
  if (!data || depth > 5) return []
  const parsed = parseMaybeJson(data)
  if (Array.isArray(parsed)) {
    return parsed.some(hasDateValue) ? parsed : []
  }
  if (!parsed || typeof parsed !== 'object') return []
  for (let i = 0; i < DATE_LIST_KEYS.length; i += 1) {
    const value = parseMaybeJson(parsed[DATE_LIST_KEYS[i]])
    if (Array.isArray(value) && value.length) {
      return value
    }
  }
  if (hasDateValue(parsed)) {
    return [parsed]
  }
  const keys = Object.keys(parsed)
  for (let i = 0; i < keys.length; i += 1) {
    const value = parseMaybeJson(parsed[keys[i]])
    if (Array.isArray(value) || value && typeof value === 'object') {
      const found = findDateList(value, depth + 1)
      if (found.length) return found
    }
  }
  return []
}

function normalizeDateList(source) {
  return findDateList(source, 0)
}

function formatDateItem(item, index) {
  if (typeof item === 'string' || typeof item === 'number') {
    return { index: index + 1, date: formatDate(item), amount: '' }
  }
  return {
    index: index + 1,
    date: formatDate(pick(item, DATE_VALUE_KEYS)),
    amount: pick(item, ['JE', 'je', 'ZJE', 'zje', 'amount', '金额']),
    raw: item
  }
}

Page({
  data: {
    query: null,
    loading: false,
    list: [],
    emptyText: '',
    activeZyh: '',
    dateList: [],
    loadingZyh: ''
  },

  onLoad() {
    const query = wx.getStorageSync('zyfyqdQuery')
    if (!query || !query.name || !query.idCard || !query.phone) {
      wx.showToast({ title: '请先填写查询信息', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ query })
    this.fetchAdmissionList()
  },

  fetchAdmissionList() {
    const query = this.data.query
    this.setData({ loading: true, emptyText: '', list: [], activeZyh: '', dateList: [], loadingZyh: '' })
    req({
      url: util.baseUrl + '/newapi/api/zyfyqd/getzylist',
      method: 'POST',
      data: {
        brxm: query.name,
        sfz: query.idCard,
        lxdh: query.phone
      },
      success: res => {
        const body = res.data || {}
        const source = body.data !== undefined ? body.data : body
        const list = normalizeList(source).map(formatAdmission)
        this.setData({
          list,
          emptyText: list.length ? '' : '未查询到住院记录'
        })
      },
      fail: () => {
        wx.showToast({ title: '查询失败，请稍后重试', icon: 'none' })
        this.setData({ emptyText: '查询失败，请稍后重试' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  selectAdmission(e) {
    const index = Number(e.currentTarget.dataset.index || 0)
    const item = this.data.list[index]
    if (!item || !item.zyh) {
      wx.showToast({ title: '未获取到住院号', icon: 'none' })
      return
    }
    if (this.data.loadingZyh) return
    if (this.data.activeZyh === item.zyh) {
      this.setData({ activeZyh: '', dateList: [] })
      return
    }
    this.setData({
      dateList: [],
      loadingZyh: item.zyh
    })
    req({
      url: util.baseUrl + '/newapi/api/zyfyqd/getzybaseinfo',
      method: 'POST',
      data: {
        ZYH: item.zyh
      },
      success: res => {
        const body = res.data || {}
        const source = body.data !== undefined ? body.data : body
        const dateList = normalizeDateList(source).map(formatDateItem).filter(item => item.date)
        console.log('[zyfylist] getzybaseinfo dateList:', dateList, 'raw:', source)
        if (!dateList.length) {
          this.setData({ activeZyh: '', dateList: [] })
          wx.showToast({ title: '暂无费用日期', icon: 'none' })
          return
        }
        if (dateList.length === 1) {
          this.openDailyDetail(item.zyh, dateList[0].date)
          return
        }
        this.setData({ activeZyh: item.zyh, dateList })
      },
      fail: () => {
        wx.showToast({ title: '费用日期查询失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ loadingZyh: '' })
      }
    })
  },

  openDailyDetail(zyh, date) {
    wx.navigateTo({
      url: `/subpackagesC/zyfydetail/zyfydetail?zyh=${encodeURIComponent(zyh)}&date=${encodeURIComponent(date)}`
    })
  },

  goDailyDetail(e) {
    const date = String(e.currentTarget.dataset.date || '').trim()
    const zyh = String(e.currentTarget.dataset.zyh || this.data.activeZyh || '').trim()
    if (!zyh || !date) {
      wx.showToast({ title: '缺少住院号或费用日期', icon: 'none' })
      return
    }
    this.openDailyDetail(zyh, date)
  },

  refresh() {
    this.fetchAdmissionList()
  }
})
