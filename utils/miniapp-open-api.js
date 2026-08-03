const config = require('./miniapp-open-config')

const API_BASE = String(config.apiBase || '').replace(/\/+$/, '')
const API_KEY = String(config.apiKey || '').trim()
const DEFAULT_TIMEOUT = Number(config.analyzeTimeoutMs || 600000)
const DEFAULT_CONVERSATION_TITLE = config.conversationTitle || '小程序开放聊天会话'
const DEFAULT_ANALYZE_MESSAGE = config.defaultAnalyzeMessage || '帮我分析一下面相和痣'
const ANALYZE_API_URL = `${API_BASE}/web-api/miniapp/chat/analyze`
const OPENID_WAIT_TIMEOUT_MS = 10000
const OPENID_WAIT_INTERVAL_MS = 100
const DEFAULT_CONVERSATION_STORAGE_KEY = 'miniappConversationId'

function buildApiUrl(path) {
  const normalizedPath = String(path || '').startsWith('/')
    ? String(path || '')
    : `/${String(path || '')}`
  return `${API_BASE}${normalizedPath}`
}

function buildQueryString(params) {
  const query = Object.keys(params || {})
    .map(key => {
      const value = params[key]
      if (value === undefined || value === null || value === '') {
        return ''
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .filter(Boolean)
    .join('&')
  return query ? `?${query}` : ''
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

function readStorageValue(key) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return ''
  }
  try {
    return String(wx.getStorageSync(key) || '').trim()
  } catch (e) {
    return ''
  }
}

function getMiniappOpenid() {
  return readStorageValue('openid')
}

function waitForMiniappOpenid(timeoutMs) {
  const timeout = Math.max(0, Number(timeoutMs === undefined ? OPENID_WAIT_TIMEOUT_MS : timeoutMs))
  const startedAt = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      const openid = getMiniappOpenid()
      if (openid) {
        resolve(openid)
        return
      }
      if (Date.now() - startedAt >= timeout) {
        const error = new Error('用户身份初始化失败，请重新进入小程序')
        error.code = 'MINIAPP_OPENID_REQUIRED'
        reject(error)
        return
      }
      setTimeout(check, OPENID_WAIT_INTERVAL_MS)
    }
    check()
  })
}

function buildAuthHeaders(header, openid) {
  const identity = String(openid || getMiniappOpenid() || '').trim()
  if (!identity) {
    const error = new Error('缺少用户身份，无法请求开放接口')
    error.code = 'MINIAPP_OPENID_REQUIRED'
    throw error
  }
  const headers = Object.assign(
    {},
    API_KEY ? { 'x-api-key': API_KEY } : {},
    header || {}
  )
  Object.keys(headers).forEach(key => {
    const normalizedKey = String(key).toLowerCase()
    if (normalizedKey === 'x-miniapp-test-user-id' || normalizedKey === 'x-miniapp-openid') {
      delete headers[key]
    }
  })
  headers['x-miniapp-openid'] = identity
  return headers
}

function getConversationStorageKey(baseKey, openid) {
  const key = String(baseKey || DEFAULT_CONVERSATION_STORAGE_KEY).trim()
  const identity = String(openid || getMiniappOpenid() || '').trim()
  return key && identity ? `${key}:${identity}` : ''
}

function removeLegacyConversationStorage(baseKey) {
  const key = String(baseKey || DEFAULT_CONVERSATION_STORAGE_KEY).trim()
  if (!key || typeof wx === 'undefined' || !wx.removeStorageSync) {
    return
  }
  try {
    wx.removeStorageSync(key)
  } catch (e) {}
}

function getStoredConversationId(baseKey) {
  removeLegacyConversationStorage(baseKey)
  const key = getConversationStorageKey(baseKey)
  return key ? readStorageValue(key) : ''
}

function setStoredConversationId(conversationId, baseKey) {
  removeLegacyConversationStorage(baseKey)
  const key = getConversationStorageKey(baseKey)
  if (!key || typeof wx === 'undefined') {
    return false
  }
  try {
    if (conversationId) {
      wx.setStorageSync(key, String(conversationId).trim())
    } else {
      wx.removeStorageSync(key)
    }
    return true
  } catch (e) {
    return false
  }
}

function clearStoredConversationId(baseKey) {
  return setStoredConversationId('', baseKey)
}

function request(options) {
  const {
    url,
    method = 'GET',
    data,
    timeout = DEFAULT_TIMEOUT,
    header = {}
  } = options || {}

  return waitForMiniappOpenid().then(openid => {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        timeout,
        header: Object.assign(
          {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          buildAuthHeaders(header, openid)
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

function getConversation(conversationId, options) {
  const query = buildQueryString({
    compact: options && options.compact ? 1 : '',
    limit: options && options.limit
  })
  return request({
    url: buildApiUrl(`/web-api/miniapp/conversations/${encodeURIComponent(conversationId || '')}${query}`),
    timeout: options && options.timeout
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
    header = {},
    timeout = DEFAULT_TIMEOUT
  } = options || {}

  return waitForMiniappOpenid().then(openid => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: ANALYZE_API_URL,
        filePath,
        name,
        fileName,
        formData,
        timeout,
        header: buildAuthHeaders(header, openid),
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
  buildAuthHeaders,
  clearStoredConversationId,
  clearConversationContext,
  createConversation,
  getConversationStorageKey,
  getConversation,
  getConversationWorkflow,
  getProfile,
  getStoredConversationId,
  normalizeImageDataUrl,
  request,
  sendMessage,
  setStoredConversationId,
  analyze,
  getAnalyzeResult,
  uploadAnalyzeFile,
  waitForMiniappOpenid
}
