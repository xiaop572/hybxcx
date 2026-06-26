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

function formatNow() {
  const date = new Date()
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function normalizePayload(source) {
  const data = parseMaybeJson(source)
  if (!data || typeof data !== 'object') return {}
  return data
}

function normalizeHeader(source) {
  const data = normalizePayload(source)
  return data.header || data.head || data.baseInfo || data.baseinfo || data.info || data.brxx || data.patient || data
}

function normalizeDetailList(source) {
  const data = normalizePayload(source)
  if (Array.isArray(data)) return data
  const list = data.mxlst || data.mxlist || data.detailList || data.details || data.mxList || data.fyList || data.list || data.rows || data.items || data.data
  return Array.isArray(list) ? list : []
}

function formatHeader(source) {
  return {
    title: pick(source, ['title', 'TITLE', '标题']),
    range: pick(source, ['rqfw', 'RQFW', '费用日期', 'dateRange']),
    zyh: pick(source, ['zyhm', 'ZYHM', 'ZYH', 'zyh', '住院号']),
    name: pick(source, ['brxm', 'BRXM', 'XM', 'xm', 'name', '姓名']),
    gender: pick(source, ['brxb', 'BRXB', 'XB', 'xb', 'sex', '性别']),
    ward: pick(source, ['brbq', 'BRBQ', 'BQMC', 'bqmc', 'wardName', '病区']),
    bed: pick(source, ['brch', 'BRCH', 'CH', 'ch', 'bedNo', '床位']),
    inDate: formatDate(pick(source, ['fyrq', 'FYRQ', 'RYRQ', 'ryrq', 'admitDate', '入院日期'])),
    feeType: pick(source, ['brxz', 'BRXZ', 'FB', 'fb', 'feeType', '费别']),
    pid: pick(source, ['PID', 'pid']),
    totalFee: pick(source, ['zfy', 'ZFY', 'totalFee', '总费用']),
    selfPay: pick(source, ['zfje', 'ZFJE', 'DQZFJE', 'dqzfje', 'selfPay', '当前自费金额']),
    prepay: pick(source, ['jkje', 'JKJE', 'YJK', 'yjk', 'prepay', '预交款']),
    balance: pick(source, ['fyye', 'FYYE', 'YE', 'ye', 'balance', '余额']),
    subtotal: pick(source, ['brxj', 'BRXJ', 'XJ', 'xj', 'subtotal', '小计'])
  }
}

function formatDetail(item, index) {
  return {
    index: pick(item, ['xlh', 'XLH', '序号']) || index + 1,
    name: pick(item, ['fymc', 'FYMC', 'XMMC', 'xmmc', 'name', '项目名称']),
    spec: pick(item, ['xmgg', 'XMGG', 'GG', 'gg', 'spec', '规格']),
    qty: pick(item, ['sl', 'SL', 'qty', '数量']),
    price: pick(item, ['dj', 'DJ', 'price', '单价']),
    amount: pick(item, ['je', 'JE', 'amount', '金额']),
    category: pick(item, ['DLMC', 'dlmc', 'category', '类别']),
    feeType: pick(item, ['fb', 'FB', 'feeType', '费别'])
  }
}

Page({
  data: {
    zyh: '',
    date: '',
    loading: false,
    header: {},
    detailList: [],
    emptyText: '',
    printTime: '',
    sheetScale: 1,
    sheetResetKey: 1,
    sheetX: 0,
    sheetY: 0,
    sheetHeight: 1178
  },

  onLoad(options) {
    const zyh = decodeURIComponent(options.zyh || '')
    const date = decodeURIComponent(options.date || '')
    this.setData({ zyh, date })
    this.fetchDetail()
  },

  fetchDetail() {
    if (!this.data.zyh || !this.data.date) {
      this.setData({ emptyText: '缺少住院号或费用日期' })
      return
    }
    this.setData({ loading: true, emptyText: '', header: {}, detailList: [] })
    req({
      url: util.baseUrl + '/newapi/api/zyfyqd/getzyfyqd',
      method: 'POST',
      data: {
        ZYH: this.data.zyh,
        fyrq: this.data.date,
        FYRQ: this.data.date,
        '费用日期': this.data.date
      },
      success: res => {
        const body = res.data || {}
        const source = body.data !== undefined ? body.data : body
        const header = formatHeader(normalizeHeader(source))
        const detailList = normalizeDetailList(source).map(formatDetail)
        this.setData({
          header,
          detailList,
          printTime: formatNow(),
          sheetHeight: Math.max(1178, Math.ceil((760 + detailList.length * 54) * 0.62)),
          emptyText: detailList.length ? '' : '暂无费用明细'
        })
      },
      fail: () => {
        wx.showToast({ title: '清单查询失败', icon: 'none' })
        this.setData({ emptyText: '清单查询失败，请稍后重试' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  resetSheetView() {
    this.setData({
      sheetScale: 1,
      sheetResetKey: this.data.sheetResetKey + 1,
      sheetX: 0,
      sheetY: 0
    })
  }
})
