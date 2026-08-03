const util = require('../../utils/util')
const miniappOpenApi = require('../../utils/miniapp-open-api')

const FILE_BASE_NAME = 'mxloading_face'
const ANALYZE_TIMEOUT = miniappOpenApi.DEFAULT_TIMEOUT || 600000
const ANALYZE_JSON_FILE_SIZE_LIMIT = 2 * 1024 * 1024
const ANALYZE_JSON_BASE64_LENGTH_LIMIT = 2_800_000
const REQUEST_WATCHDOG_MS = 600000
const WORKFLOW_POLL_INTERVAL_MS = 1200
const RESULT_POLL_INTERVAL_MS = 2500
const LOADING_MIN_DURATION_MS = 20000
const LOADING_MAX_DURATION_MS = 30000
const LOADING_PHASES = [
  '正在识别面部轮廓与五官比例...',
  '正在提取面部关注点与局部特征...',
  '正在生成综合评估建议...',
  '正在整理可视化结果页...'
]
const WORKFLOW_STAGE_ORDER = [
  ['cache_lookup', '缓存检查'],
  ['face_analysis', '人脸分析'],
  ['mole_detection', '痣检测'],
  ['prompt_routing', 'Prompt 匹配'],
  ['memory_recall', '图像召回'],
  ['knowledge_retrieval', '知识检索'],
  ['llm_reply', 'LLM 回复']
]

function detectBase64Mime(base64) {
  const text = (base64 || '').trim()
  if (/^data:image\/png;base64,/i.test(text) || /^iVBORw0KGgo/.test(text)) {
    return 'png'
  }
  if (/^data:image\/gif;base64,/i.test(text) || /^R0lGOD/.test(text)) {
    return 'gif'
  }
  if (/^data:image\/webp;base64,/i.test(text) || /^UklGR/.test(text)) {
    return 'webp'
  }
  return 'jpg'
}

function wrapBase64(base64) {
  const text = (base64 || '').trim()
  if (/^data:image\/\w+;base64,/i.test(text)) {
    return text
  }
  const mime = detectBase64Mime(text)
  return `data:image/${mime};base64,${text}`
}

function saveBase64ToTempFile(base64) {
  return new Promise((resolve, reject) => {
    const wrapped = wrapBase64(base64)
    const match = /^data:image\/(\w+);base64,(.*)$/i.exec(wrapped)
    if (!match) {
      reject(new Error('INVALID_BASE64'))
      return
    }
    const format = match[1].toLowerCase()
    const bodyData = match[2]
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`
    const buffer = wx.base64ToArrayBuffer(bodyData)
    wx.getFileSystemManager().writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function readFileAsBase64(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success(res) {
        const base64 = String((res && res.data) || '').trim()
        if (!base64) {
          reject(new Error('EMPTY_BASE64'))
          return
        }
        resolve(base64)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function getFileSize(filePath) {
  return new Promise(resolve => {
    if (!filePath || !wx.getFileInfo) {
      resolve(0)
      return
    }
    wx.getFileInfo({
      filePath,
      success(res) {
        resolve(Number((res && res.size) || 0))
      },
      fail() {
        resolve(0)
      }
    })
  })
}

function getUploadFileName(filePath) {
  const lower = (filePath || '').toLowerCase()
  if (lower.indexOf('.png') !== -1) {
    return 'face.png'
  }
  if (lower.indexOf('.webp') !== -1) {
    return 'face.webp'
  }
  return 'face.jpg'
}

function buildImagePayload(base64, filePath) {
  const fileName = getUploadFileName(filePath)
  const mimeType = /\.png$/i.test(fileName)
    ? 'image/png'
    : /\.webp$/i.test(fileName)
      ? 'image/webp'
      : 'image/jpeg'
  return {
    fileName,
    mimeType,
    dataUrl: miniappOpenApi.normalizeImageDataUrl(base64, mimeType)
  }
}

function shouldUseMultipartAnalyze(fileSize, base64) {
  const normalizedSize = Number(fileSize || 0)
  const base64Length = String(base64 || '').trim().length
  if (normalizedSize > ANALYZE_JSON_FILE_SIZE_LIMIT) {
    return true
  }
  return base64Length > ANALYZE_JSON_BASE64_LENGTH_LIMIT
}

function safeParse(value) {
  if (!value || typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

function coalesce() {
  for (let i = 0; i < arguments.length; i += 1) {
    const text = String(arguments[i] === undefined || arguments[i] === null ? '' : arguments[i]).trim()
    if (text) return text
  }
  return ''
}

function formatDurationShort(ms) {
  const value = Number(ms || 0)
  if (!Number.isFinite(value) || value < 0) return ''
  if (value < 1000) return `${Math.round(value)}ms`
  if (value < 10000) return `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}s`
  return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}s`
}

function getRandomLoadingDuration() {
  return LOADING_MIN_DURATION_MS + Math.floor(Math.random() * (LOADING_MAX_DURATION_MS - LOADING_MIN_DURATION_MS + 1))
}

function getLoadingPhase(progress) {
  const safeProgress = Math.max(0, Math.min(99, Number(progress) || 0))
  const index = Math.min(LOADING_PHASES.length - 1, Math.floor(safeProgress / 25))
  return LOADING_PHASES[index]
}

function getStageDuration(payload, stageKey, timingKey) {
  const timing = payload && payload.timing ? payload.timing : {}
  const timingValue = Number(timing[timingKey])
  if (Number.isFinite(timingValue)) {
    return Math.max(0, timingValue)
  }
  const stages = Array.isArray(payload && payload.stages) ? payload.stages : []
  const stage = stages.find(item => String((item && item.key) || '') === stageKey)
  const stageValue = Number(stage && stage.durationMs)
  return Number.isFinite(stageValue) ? Math.max(0, stageValue) : null
}

function findWorkflowStage(payload, stageKey) {
  const stages = Array.isArray(payload && payload.stages) ? payload.stages : []
  return stages.find(item => String((item && item.key) || '') === stageKey) || null
}

function getStageTimingKey(stageKey) {
  if (stageKey === 'cache_lookup') return 'cacheLookupMs'
  if (stageKey === 'face_analysis') return 'faceMs'
  if (stageKey === 'mole_detection') return 'moleMs'
  if (stageKey === 'prompt_routing') return 'promptRoutingMs'
  if (stageKey === 'memory_recall') return 'imageMemoryRecallMs'
  if (stageKey === 'knowledge_retrieval') return 'retrievalMs'
  if (stageKey === 'llm_reply') return 'replyMs'
  return ''
}

function formatStageProgress(payload, stageKey, label) {
  const stage = findWorkflowStage(payload, stageKey)
  const duration = getStageDuration(payload, stageKey, getStageTimingKey(stageKey))
  if (duration !== null) {
    return `${label} ${formatDurationShort(duration)}`
  }
  const status = String((stage && stage.status) || '').trim()
  if (status === 'running') {
    return `${label} 进行中`
  }
  if (status === 'completed') {
    return `${label} 已完成`
  }
  if (status === 'failed') {
    return `${label} 失败`
  }
  if (status === 'skipped') {
    return `${label} 已跳过`
  }
  return ''
}

function extractWorkflow(source) {
  const payload = safeParse(source)
  if (!payload || typeof payload !== 'object') {
    return null
  }
  const meta = payload.meta && typeof payload.meta === 'object'
    ? payload.meta
    : payload.messageResponse && payload.messageResponse.meta && typeof payload.messageResponse.meta === 'object'
      ? payload.messageResponse.meta
      : null
  if (meta && (meta.timing || meta.thinkingSummary || Array.isArray(meta.analysisSections))) {
      return {
      status: 'completed',
      payload: {
        stage: 'done',
        stageLabel: '处理完成',
        stageMessage: '服务端已完成本轮分析，正在整理结果。',
        thinkingSummary: meta.thinkingSummary || '',
        timing: meta.timing || {},
        stages: []
      }
    }
  }
  if (payload.workflow) return payload.workflow
  if (payload.conversationSnapshot && payload.conversationSnapshot.workflow) {
    return payload.conversationSnapshot.workflow
  }
  if (payload.data) {
    return extractWorkflow(payload.data)
  }
  return null
}

Page({
  data: {
    percent: 0,
    canvasPx: 280,
    requestStateText: LOADING_PHASES[0],
    timingTitle: 'AI生成中',
    timingDetail: '本次加载约 20-30 秒，完成后自动进入结果页。',
    type: '1'
  },

  onLoad(options) {
    const type = String((options && options.type) || '1')
    const sys = wx.getSystemInfoSync()
    this.canvasPx = Math.round(sys.windowWidth * 480 / 750)
    this.setData({
      canvasPx: this.canvasPx,
      type: type === '2' ? '2' : '1'
    })

    this._percent = 0
    this._lastPercent = -1
    this._apiDone = false
    this._minDurationDone = false
    this._navigated = false
    this._timer = null
    this._minDurationTimer = null
    this._timingTimer = null
    this._workflowTimer = null
    this._workflowPollToken = 0
    this._latestWorkflow = null
    this._conversationId = ''
    this._loadStartedAt = 0
    this._timingStartedAt = 0
    this._minDurationMs = getRandomLoadingDuration()
    this._requestWatchdogTimer = null
    this._analyzeAsyncAccepted = false
    this._analyzeClientMessageId = ''
    this._analyzeResultPolling = false
    this._lastAnalyzeResultPollAt = 0
    this._analyzeResultTimer = null
  },

  onReady() {
    this._loadStartedAt = Date.now()
    this._timingStartedAt = this._loadStartedAt
    this._apiDone = true
    this.setData({
      timingDetail: `本次加载约 ${Math.round(this._minDurationMs / 1000)} 秒，完成后自动进入结果页。`
    })
    this.drawProgress(0)
    this.startAnimation()
    this.startTimingProgress()
  },

  startAnimation() {
    // Keep the progress ring aligned with the randomized display duration.
    this._timer = setInterval(() => {
      const elapsed = Date.now() - this._loadStartedAt
      const progress = Math.min(99, Math.floor((elapsed / this._minDurationMs) * 99))
      if (progress !== this._lastPercent) {
        this._lastPercent = progress
        this._percent = progress
        this.setData({ percent: progress })
        this.drawProgress(progress)
      }
    }, 40)

    this._minDurationTimer = setTimeout(() => {
      this._minDurationDone = true
      this.tryFinish()
    }, this._minDurationMs)
  },

  buildTimingBreakdownText(workflow) {
    const payload = workflow && workflow.payload ? workflow.payload : {}
    const progressItems = WORKFLOW_STAGE_ORDER
      .map(item => formatStageProgress(payload, item[0], item[1]))
      .filter(Boolean)
    const elapsed = Number(
      payload && payload.timing && payload.timing.totalMs ||
      payload && payload.totalMs ||
      payload && payload.elapsedMs ||
      payload && payload.elapsed ||
      0
    ) || (this._timingStartedAt ? Date.now() - this._timingStartedAt : 0)
    if (!progressItems.length) {
      return `等待服务端阶段数据，总耗时 ${formatDurationShort(elapsed)}`
    }
    const parts = progressItems.slice(0)
    parts.push(`总耗时 ${formatDurationShort(elapsed)}`)
    return parts.join(' | ')
  },

  updateTimingBreakdown(workflow) {
    this._latestWorkflow = workflow || this._latestWorkflow
    const payload = this._latestWorkflow && this._latestWorkflow.payload
      ? this._latestWorkflow.payload
      : {}
    const stageLabel = coalesce(payload.stageLabel)
    const stageMessage = coalesce(payload.stageMessage)
    const thinkingSummary = coalesce(payload.thinkingSummary)
    const requestStateText = stageLabel || stageMessage || thinkingSummary
      ? [stageLabel ? `当前阶段：${stageLabel}` : '', stageMessage || thinkingSummary]
          .filter(Boolean)
          .join(' | ')
      : this.data.requestStateText
    this.setData({
      requestStateText,
      timingTitle: '阶段耗时拆解',
      timingDetail: this.buildTimingBreakdownText(this._latestWorkflow)
    })
  },

  startTimingProgress() {
    this.stopTimingProgress()
    const updateLoadingCopy = () => {
      const elapsed = Date.now() - this._timingStartedAt
      const progress = Math.min(99, Math.floor((elapsed / this._minDurationMs) * 99))
      const remainingSeconds = Math.max(0, Math.ceil((this._minDurationMs - elapsed) / 1000))
      this.setData({
        requestStateText: getLoadingPhase(progress),
        timingTitle: 'AI生成中',
        timingDetail: remainingSeconds > 0
          ? `预计还需 ${remainingSeconds} 秒，请保持页面停留。`
          : '结果已生成，正在进入报告页。'
      })
    }
    updateLoadingCopy()
    this._timingTimer = setInterval(() => {
      updateLoadingCopy()
    }, 1000)
  },

  stopTimingProgress() {
    if (this._timingTimer) {
      clearInterval(this._timingTimer)
      this._timingTimer = null
    }
  },

  startWorkflowPolling(conversationId) {
    const id = String(conversationId || '').trim()
    if (!id) return
    this.stopWorkflowPolling()
    const token = this._workflowPollToken + 1
    this._workflowPollToken = token

    const tick = () => {
      miniappOpenApi.getConversationWorkflow(id).then(data => {
        if (this._workflowPollToken !== token || this._navigated) return
        const workflow = data && data.workflow ? data.workflow : null
        if (workflow) {
          this.updateTimingBreakdown(workflow)
        }
        this.maybeFetchAnalyzeResult(workflow, false)
      }).catch(err => {
        console.warn('[mxloading] workflow polling failed:', err)
      }).finally(() => {
        if (this._workflowPollToken === token && !this._apiDone && !this._navigated) {
          this._workflowTimer = setTimeout(tick, WORKFLOW_POLL_INTERVAL_MS)
        }
      })
    }

    tick()
  },

  stopWorkflowPolling() {
    this._workflowPollToken += 1
    if (this._workflowTimer) {
      clearTimeout(this._workflowTimer)
      this._workflowTimer = null
    }
  },

  startAnalyzeResultPolling() {
    this.stopAnalyzeResultPolling()
    const tick = () => {
      if (this._apiDone || this._navigated || !this._analyzeAsyncAccepted) {
        return
      }
      this.maybeFetchAnalyzeResult(this._latestWorkflow, true)
      this._analyzeResultTimer = setTimeout(tick, RESULT_POLL_INTERVAL_MS)
    }
    this._analyzeResultTimer = setTimeout(tick, RESULT_POLL_INTERVAL_MS)
  },

  stopAnalyzeResultPolling() {
    if (this._analyzeResultTimer) {
      clearTimeout(this._analyzeResultTimer)
      this._analyzeResultTimer = null
    }
  },

  maybeFetchAnalyzeResult(workflow, force) {
    if (!this._analyzeAsyncAccepted || this._apiDone || this._navigated) {
      return
    }
    if (!this._conversationId || !this._analyzeClientMessageId) {
      return
    }
    if (this._analyzeResultPolling) {
      return
    }
    const payload = workflow && workflow.payload ? workflow.payload : {}
    const status = String(workflow && workflow.status || '').trim().toLowerCase()
    const stage = String(payload.stage || '').trim().toLowerCase()
    const shouldPollNow = !!force || status === 'idle' || status === 'failed' || stage === 'done' || stage === 'llm_reply'
    const now = Date.now()
    if (!shouldPollNow && now - this._lastAnalyzeResultPollAt < RESULT_POLL_INTERVAL_MS) {
      return
    }
    this._analyzeResultPolling = true
    this._lastAnalyzeResultPollAt = now
    miniappOpenApi.getAnalyzeResult(this._conversationId, this._analyzeClientMessageId, false).then(result => {
      if (!result) {
        return
      }
      if (result.ready && result.result) {
        this.commitAnalyzeResult(result.result)
        return
      }
      if (result.ready && result.compact) {
        miniappOpenApi.getAnalyzeResult(this._conversationId, this._analyzeClientMessageId, false).then(fullResult => {
          if (fullResult && fullResult.ready && fullResult.result) {
            this.commitAnalyzeResult(fullResult.result)
            return
          }
          this.commitAnalyzeResult({
            conversation: {
              conversationId: result.conversationId || this._conversationId
            },
            compactReady: true
          })
        }).catch(() => {
          this.commitAnalyzeResult({
            conversation: {
              conversationId: result.conversationId || this._conversationId
            },
            compactReady: true
          })
        })
        return
      }
      if (String(result.status || '').trim().toLowerCase() === 'failed') {
        this.failAndBack(result.error || '分析任务失败，请稍后重试')
      }
    }).catch(err => {
      console.warn('[mxloading] analyze result polling failed:', err)
    }).finally(() => {
      this._analyzeResultPolling = false
    })
  },

  ensureConversationId() {
    if (this._conversationId) {
      this.startWorkflowPolling(this._conversationId)
      return Promise.resolve(this._conversationId)
    }
    return miniappOpenApi.createConversation({
      title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE
    }).then(res => {
      const conversationId = coalesce(
        res && res.conversationId,
        res && res.conversation && res.conversation.conversationId
      )
      if (conversationId) {
        this._conversationId = conversationId
        miniappOpenApi.setStoredConversationId(conversationId)
        this.startWorkflowPolling(conversationId)
      }
      return conversationId
    }).catch(err => {
      console.warn('[mxloading] create conversation failed:', err)
      return ''
    })
  },

  callApi() {
    const imagePath = wx.getStorageSync('faceImagePath') || ''
    const storedBase64 = wx.getStorageSync('faceBase64') || ''
    util.clearJsonCache('rawApiResponse')
    wx.removeStorageSync('miniappAnalyzeResponse')
    console.log('[mxloading] callApi start, imagePath:', imagePath, 'base64 length:', storedBase64.length)

    if (!imagePath && !storedBase64) {
      this.failAndBack('未获取到照片，请重新上传')
      return
    }

    this.setData({
      requestStateText: '已发送生成请求，当前页面仅保留耗时拆解展示，接下来等待服务端一次性返回结果。'
    })
    this.stopRequestWatchdog()
    this._requestWatchdogTimer = setTimeout(() => {
      if (this._apiDone || this._navigated) {
        return
      }
      console.error('[mxloading] analyze watchdog timeout')
      this.failAndBack('服务端处理超时，请稍后重试')
    }, REQUEST_WATCHDOG_MS)

    this.requestAnalyze(imagePath, storedBase64).catch(err => {
      console.warn('[mxloading] analyze by request failed, fallback upload:', err)
      const fallbackTask = imagePath
        ? Promise.resolve(imagePath)
        : saveBase64ToTempFile(storedBase64)
      fallbackTask.then(filePath => {
        this.uploadAnalyzeImage(filePath)
      }).catch(uploadErr => {
        console.error('[mxloading] prepare image fail:', uploadErr)
        this.failAndBack('图片读取失败，请重新上传')
      })
    })
  },

  requestAnalyze(imagePath, storedBase64) {
    return this.ensureConversationId().then(conversationId => {
      return Promise.resolve({
        filePath: imagePath || '',
        base64: storedBase64 || ''
      })
      .then(({ filePath, base64 }) => {
        const resolvedPath = filePath || imagePath
        if (resolvedPath) {
          return {
            filePath: resolvedPath,
            base64
          }
        }
        if (base64) {
          return saveBase64ToTempFile(base64).then(tempFilePath => ({
            filePath: tempFilePath,
            base64
          }))
        }
        return {
          filePath: '',
          base64: ''
        }
      })
      .then(({ filePath, base64 }) => {
        return getFileSize(filePath).then(fileSize => ({
          filePath,
          base64,
          fileSize
        }))
      })
      .then(({ filePath, base64, fileSize }) => {
        console.log('[mxloading] analyze request image length:', base64.length, 'file size:', fileSize)
        if (filePath) {
          console.log('[mxloading] use multipart analyze with uploaded file')
        this.setData({
            requestStateText: '已使用文件直传模式上传原图，正在等待服务端返回分析结果。'
          })
          return miniappOpenApi.uploadAnalyzeFile({
            filePath,
            fileName: getUploadFileName(filePath),
            timeout: ANALYZE_TIMEOUT,
            formData: {
              conversationId: conversationId || '',
              title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE,
              message: miniappOpenApi.DEFAULT_ANALYZE_MESSAGE,
              workflow: 'chat',
              async: 'true'
            }
          })
        }
        return miniappOpenApi.analyze({
          conversationId: conversationId || '',
          title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE,
          message: miniappOpenApi.DEFAULT_ANALYZE_MESSAGE,
          workflow: 'chat',
          async: true,
          images: [buildImagePayload(base64, filePath)]
        })
      })
      .then(response => {
        console.log('[mxloading] analyze request response:', response)
        if (response && response.accepted && response.async) {
          this.handleAnalyzeAcceptedResponse(response)
          return
        }
        this.commitAnalyzeResult(response)
      })
    })
  },

  uploadAnalyzeImage(filePath) {
    const fileName = getUploadFileName(filePath)
    console.log('[mxloading] fallback analyze url:', miniappOpenApi.ANALYZE_API_URL)
    console.log('[mxloading] fallback analyze fileName:', fileName)

    this.ensureConversationId().then(conversationId => {
      miniappOpenApi.uploadAnalyzeFile({
        filePath,
        fileName,
        timeout: ANALYZE_TIMEOUT,
        formData: {
          conversationId: conversationId || '',
          title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE,
          message: miniappOpenApi.DEFAULT_ANALYZE_MESSAGE,
          workflow: 'chat',
          async: 'true'
        }
      }).then(response => {
        console.log('[mxloading] analyze upload response:', response)
        if (response && response.accepted && response.async) {
          this.handleAnalyzeAcceptedResponse(response)
          return
        }
        this.commitAnalyzeResult(response)
      }).catch(err => {
        console.error('[mxloading] analyze upload fail:', err)
        this.failAndBack('分析请求失败，请稍后重试')
      })
    })
  },

  handleAnalyzeAcceptedResponse(response) {
    const messageRequest = response && response.messageRequest ? response.messageRequest : {}
    const conversation = response && response.conversation ? response.conversation : {}
    const conversationId = coalesce(
      response && response.conversationId,
      conversation && conversation.conversationId,
      this._conversationId
    )
    const clientMessageId = coalesce(
      messageRequest && messageRequest.clientMessageId,
      response && response.clientMessageId,
      this._analyzeClientMessageId
    )
    if (conversationId) {
      this._conversationId = conversationId
      miniappOpenApi.setStoredConversationId(conversationId)
      this.startWorkflowPolling(conversationId)
    }
    this._analyzeAsyncAccepted = true
    this._analyzeClientMessageId = clientMessageId
    this.startAnalyzeResultPolling()
    this.setData({
      requestStateText: '服务端已受理分析任务，当前持续展示耗时拆解与阶段进度，结果生成后会自动跳转。'
    })
    this.maybeFetchAnalyzeResult(this._latestWorkflow, true)
  },

  commitAnalyzeResult(response) {
    this.updateTimingBreakdown(extractWorkflow(response))
    try {
      util.saveJsonCache('rawApiResponse', response)
    } catch (e) {
      console.warn('[mxloading] persist rawApiResponse file cache failed:', e)
    }
    if (response && response.conversation && response.conversation.conversationId) {
      miniappOpenApi.setStoredConversationId(response.conversation.conversationId)
    }
    try {
      wx.removeStorageSync('faceBase64')
    } catch (e) {}
    this._apiDone = true
    this._analyzeAsyncAccepted = false
    this.stopAnalyzeResultPolling()
    this.setData({
      requestStateText: '服务端已返回结果，正在整理页面并准备跳转。'
    })
    this.stopRequestWatchdog()
    this.stopWorkflowPolling()
    this.tryFinish()
  },

  failAndBack(title) {
    this.stopWorkflowPolling()
    this.stopAnalyzeResultPolling()
    this.stopTimingProgress()
    this.stopRequestWatchdog()
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    if (this._minDurationTimer) {
      clearTimeout(this._minDurationTimer)
      this._minDurationTimer = null
    }
    wx.showToast({
      title,
      icon: 'none',
      duration: 1800
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 1800)
  },

  tryFinish() {
    if (!this._apiDone || !this._minDurationDone || this._navigated) {
      return
    }
    this.finishTo100()
  },

  finishTo100() {
    if (this._navigated) return
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    if (this._minDurationTimer) {
      clearTimeout(this._minDurationTimer)
      this._minDurationTimer = null
    }
    this._percent = 100
    this.setData({ percent: 100 })
    this.drawProgress(100)
    this._navigated = true
    this.stopWorkflowPolling()
    this.stopAnalyzeResultPolling()
    this.stopTimingProgress()
    this.stopRequestWatchdog()
    setTimeout(() => {
      const resultUrl = this.data.type === '2'
        ? '/subD/mxjieguo3/mxjieguo3'
        : '/subD/mianzhenjieguo/mianzhenjieguo'
      wx.redirectTo({ url: resultUrl })
    }, 120)
  },

  stopRequestWatchdog() {
    if (this._requestWatchdogTimer) {
      clearTimeout(this._requestWatchdogTimer)
      this._requestWatchdogTimer = null
    }
  },

  drawProgress(percent) {
    const size = this.canvasPx
    const ctx = wx.createCanvasContext('progressCanvas', this)
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.37
    const lw = size * 0.045

    ctx.clearRect(0, 0, size, size)

    const glow = ctx.createCircularGradient(cx, cy, r)
    glow.addColorStop(0, 'rgba(255,255,255,0.62)')
    glow.addColorStop(0.58, 'rgba(139,197,255,0.26)')
    glow.addColorStop(1, 'rgba(139,197,255,0.00)')
    ctx.beginPath()
    ctx.arc(cx, cy, r + lw * 1.8, 0, Math.PI * 2)
    ctx.setFillStyle(glow)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.setStrokeStyle('rgba(255,255,255,0.36)')
    ctx.setLineWidth(lw)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, r - lw * 1.7, 0, Math.PI * 2)
    ctx.setStrokeStyle('rgba(255,255,255,0.14)')
    ctx.setLineWidth(Math.max(2, lw * 0.28))
    ctx.stroke()

    if (percent > 0) {
      const startAngle = -Math.PI / 2
      const endAngle = startAngle + (percent / 100) * Math.PI * 2
      const grad = ctx.createLinearGradient(cx - r, cy + r, cx + r, cy - r)
      grad.addColorStop(0, '#FFFFFF')
      grad.addColorStop(0.48, '#B7E7FF')
      grad.addColorStop(1, '#6B8CFF')
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.setStrokeStyle(grad)
      ctx.setLineWidth(lw)
      ctx.setLineCap('round')
      ctx.stroke()

      const dotX = cx + Math.cos(endAngle) * r
      const dotY = cy + Math.sin(endAngle) * r
      ctx.beginPath()
      ctx.arc(dotX, dotY, lw * 0.55, 0, Math.PI * 2)
      ctx.setFillStyle('#FFFFFF')
      ctx.fill()
      ctx.beginPath()
      ctx.arc(dotX, dotY, lw * 0.95, 0, Math.PI * 2)
      ctx.setStrokeStyle('rgba(255,255,255,0.42)')
      ctx.setLineWidth(Math.max(2, lw * 0.18))
      ctx.stroke()
    }

    ctx.draw()
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
    if (this._minDurationTimer) clearTimeout(this._minDurationTimer)
    this.stopWorkflowPolling()
    this.stopAnalyzeResultPolling()
    this.stopTimingProgress()
    this.stopRequestWatchdog()
  }
})
