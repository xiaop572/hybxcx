const config = require('./miniapp-open-config')

const API_BASE = String(config.apiBase || '').replace(/\/+$/, '')
const API_KEY = String(config.apiKey || '').trim()
const DEFAULT_TIMEOUT = Number(config.analyzeTimeoutMs || 600000)
const DEFAULT_CONVERSATION_TITLE = config.conversationTitle || '小程序开放聊天会话'
const DEFAULT_ANALYZE_MESSAGE = config.defaultAnalyzeMessage || '帮我分析一下面相和痣'
const ANALYZE_API_URL = `${API_BASE}/web-api/miniapp/chat/analyze`

function buildApiUrl(path) {
  const normalizedPath = String(path || '').startsWith('/')
    ? String(path || '')
    : `/${String(path || '')}`
  return `${API_BASE}${normalizedPath}`
}

function safeParseJson(value) {
  if (value === undefined || value === null || value === '') {
    return value
  }
  if (typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

function pickMessage(payload) {
  if (!payload) {
    return ''
  }
  if (typeof payload === 'string') {
    return payload
  }
  if (Array.isArray(payload.message)) {
    return payload.message.filter(Boolean).join('；')
  }
  return payload.message || payload.error || payload.errMsg || ''
}

function request(options) {
  const {
    url,
    method = 'GET',
    data,
    timeout = DEFAULT_TIMEOUT,
    header = {}
  } = options || {}

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      timeout,
      header: Object.assign(
        {
          'Content-Type': 'application/json'
        },
        API_KEY ? { 'x-api-key': API_KEY } : {},
        header
      ),
      success(res) {
        const payload = safeParseJson(res && res.data)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(payload)
          return
        }
        const error = new Error(pickMessage(payload) || `HTTP ${res.statusCode}`)
        error.statusCode = res.statusCode
        error.payload = payload
        reject(error)
      },
      fail(err) {
        const error = new Error((err && (err.errMsg || err.message)) || '网络请求失败')
        error.errMsg = err && err.errMsg
        reject(error)
      }
    })
  })
}

function normalizeImageDataUrl(base64, mimeType) {
  const text = String(base64 || '').trim()
  if (!text) {
    return ''
  }
  if (/^data:image\/\w+;base64,/i.test(text)) {
    return text
  }
  return `data:${mimeType || 'image/jpeg'};base64,${text.replace(/\s+/g, '')}`
}

function getProfile() {
  return request({
    url: buildApiUrl('/web-api/miniapp/profile')
  })
}

function createConversation(data) {
  return request({
    url: buildApiUrl('/web-api/miniapp/conversations'),
    method: 'POST',
    data: {
      title: (data && data.title) || DEFAULT_CONVERSATION_TITLE
    }
  })
}

function getConversation(conversationId) {
  return request({
    url: buildApiUrl(`/web-api/miniapp/conversations/${encodeURIComponent(conversationId || '')}`)
  })
}

function getConversationWorkflow(conversationId) {
  return request({
    url: buildApiUrl(`/web-api/miniapp/conversations/${encodeURIComponent(conversationId || '')}/workflow`)
  })
}

function clearConversationContext(conversationId) {
  return request({
    url: buildApiUrl(`/web-api/miniapp/conversations/${encodeURIComponent(conversationId || '')}/context/clear`),
    method: 'POST',
    data: {}
  })
}

function sendMessage(conversationId, data) {
  return request({
    url: buildApiUrl(`/web-api/miniapp/conversations/${encodeURIComponent(conversationId || '')}/messages`),
    method: 'POST',
    data: data || {}
  })
}

function analyze(data) {
  return request({
    url: ANALYZE_API_URL,
    method: 'POST',
    data
  })
}

function getAnalyzeResult(conversationId, clientMessageId, compact) {
  const compactFlag = compact ? '&compact=1' : ''
  return request({
    url: buildApiUrl(
      `/web-api/miniapp/chat/analyze/result?conversationId=${encodeURIComponent(conversationId || '')}&clientMessageId=${encodeURIComponent(clientMessageId || '')}${compactFlag}`
    )
  })
}

function uploadAnalyzeFile(options) {
  const {
    filePath,
    fileName = 'face.jpg',
    name = 'files',
    formData = {},
    timeout = DEFAULT_TIMEOUT
  } = options || {}

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: ANALYZE_API_URL,
      filePath,
      name,
      fileName,
      formData,
      timeout,
      header: API_KEY
        ? {
            'x-api-key': API_KEY
          }
        : {},
      success(res) {
        const payload = safeParseJson(res && res.data)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(payload)
          return
        }
        const error = new Error(pickMessage(payload) || `HTTP ${res.statusCode}`)
        error.statusCode = res.statusCode
        error.payload = payload
        reject(error)
      },
      fail(err) {
        const error = new Error((err && (err.errMsg || err.message)) || '上传请求失败')
        error.errMsg = err && err.errMsg
        reject(error)
      }
    })
  })
}

module.exports = {
  API_BASE,
  API_KEY,
  ANALYZE_API_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_CONVERSATION_TITLE,
  DEFAULT_ANALYZE_MESSAGE,
  buildApiUrl,
  clearConversationContext,
  createConversation,
  getConversation,
  getConversationWorkflow,
  getProfile,
  normalizeImageDataUrl,
  request,
  sendMessage,
  analyze,
  getAnalyzeResult,
  uploadAnalyzeFile
}
