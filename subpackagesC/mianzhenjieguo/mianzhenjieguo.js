// subpackagesC/mianzhenjieguo/mianzhenjieguo.js
const util = require('../../utils/util')
const miniappOpenApi = require('../../utils/miniapp-open-api')
let chatMessageSeed = 0
const TTS_CHUNK_BYTES = 300
const ANALYZE_JSON_FILE_SIZE_LIMIT = 2 * 1024 * 1024
const ANALYZE_JSON_BASE64_LENGTH_LIMIT = 2_800_000
let ttsPlugin

function getTtsPlugin() {
  if (ttsPlugin !== undefined) {
    return ttsPlugin
  }
  try {
    ttsPlugin = requirePlugin('WechatSI')
  } catch (e) {
    ttsPlugin = null
  }
  return ttsPlugin
}

const DEFAULT_REPORT = {
  title: '面部分析结果',
  subtitle: '智能识别面部、皮肤、美容整形等问题',
  basicFeatures: [],
  emotionList: [],
  overallIntro: '',
  overallSections: [],
  summaryText: ''
}

const H5_SECTION_TITLES = ['1.识别判断', '2.治疗方案(详情请看下面的说明图)', '3.生活建议', '4.预测建议']
const DEFAULT_MOLE_FOCUS_NOTE = '问题：这处疑似交界痣或色素痣位于日常容易受摩擦、日晒或表情牵动影响的区域，除了会影响局部皮肤的干净整洁度，也需要继续关注边界、颜色和后续变化情况。 解决：建议先做专业皮肤检测和面诊评估，再根据实际边界、深浅和位置选择更合适的处理方式，例如精准激光或微创去除。处理后通常恢复节奏较快，但这类色素痣仍有复发、色沉或留痕风险，尤其在皮肤偏薄或高活动区域，更需要把能量控制和术后护理一起做好。'

const DEFAULT_TIMING_TEXT = '耗时拆解：等待服务端阶段数据'
const DEFAULT_WORKFLOW_TEXT = '当前页已直连统一 Web API，后续追问会继续沿用当前会话上下文。'

const DETAIL_MODAL_MAP = {
  0: {
    modalTitle: '皮肤管理建议',
    modalIntro: '这里聚焦日常护理、当前处理方向和后续观察建议，帮助先从皮肤管理层面看整体状态。',
    highlights: '',
    blocks: [
      {
        title: '皮肤管理建议',
        desc: '当前还没有独立的皮肤管理建议，建议先完成图像分析后再查看。',
        images: []
      }
    ]
  },
  1: {
    modalTitle: '痣识别说明与局部命中图',
    modalIntro: '这里展示痣识别摘要与局部命中图，便于继续观察边界、颜色和周边皮肤状态。',
    highlights: '',
    blocks: [
      {
        title: '识别判断',
        desc: '未识别到痣目标。',
        images: []
      },
      {
        title: '暂无局部命中图',
        desc: '如果工作流返回局部痣识别图，这里会自动展开显示。',
        images: []
      }
    ]
  }
}

const IMAGE_KEYS = [
  'annotated_image', 'annotatedImage', 'processed_image', 'processedImage',
  'result_image', 'resultImage', 'analysis_image', 'analysisImage',
  'face_image', 'faceImage', 'image_url', 'imageUrl', 'image', 'img', 'photo',
  'picurl', 'picUrl'
]

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

function normalizeText(value) {
  if (value === undefined || value === null) {
    return ''
  }
  if (typeof value === 'string') {
    return value.replace(/\r/g, '').trim()
  }
  if (Array.isArray(value)) {
    return value.map(item => normalizeText(item)).filter(Boolean).join('\n')
  }
  if (typeof value === 'object') {
    return Object.keys(value).map(key => {
      const text = normalizeText(value[key])
      return text ? `${key}：${text}` : ''
    }).filter(Boolean).join('\n')
  }
  return String(value).trim()
}

function normalizeSpeechText(value) {
  return normalizeText(value)
    .replace(/[#*_`~>\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function coalesce() {
  for (let i = 0; i < arguments.length; i += 1) {
    const text = normalizeText(arguments[i])
    if (text) {
      return text
    }
  }
  return ''
}

function formatIssueSolutionSummary(issue, solution) {
  return `${issue}，解决思路是${solution}。`
}

function normalizeFocusCardSummaryText(text) {
  const source = coalesce(text).replace(/\r\n?/g, '\n').trim()
  if (!source) {
    return ''
  }
  const firstParagraph = source
    .split(/\n+/)
    .map(item => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)[0] || ''
  if (!firstParagraph) {
    return ''
  }
  const sentences = firstParagraph.match(/[^。！？!?]+[。！？!?]?/g) || [firstParagraph]
  const filtered = sentences
    .map(item => item.trim())
    .filter(Boolean)
    .filter(item => !/(这张局部图对应|对应置信度|置信度|confidence|检测结果|检测框|bbox|cropBbox)/i.test(item))
  return (filtered.length ? filtered.join('') : firstParagraph).trim()
}

function ensureMoleFocusCardSummary(card) {
  if (!card) {
    return card
  }
  const summary = normalizeFocusCardSummaryText(card.summary) ||
    normalizeFocusCardSummaryText(card.note) ||
    normalizeFocusCardSummaryText(card.reason) ||
    DEFAULT_MOLE_FOCUS_NOTE
  return Object.assign({}, card, {
    summary,
    note: normalizeFocusCardSummaryText(card.note) || summary
  })
}

function normalizeModelFocusCards(cards) {
  if (!Array.isArray(cards)) {
    return []
  }
  return cards.map(item => ({
    title: coalesce(item && item.title),
    summary: normalizeFocusCardSummaryText(item && item.summary),
    reason: coalesce(item && item.reason)
  })).filter(item => item.title || item.summary)
}

function applyModelFocusCardCopy(cards, modelCards) {
  if (!Array.isArray(cards) || !cards.length) {
    return []
  }
  const normalizedModelCards = normalizeModelFocusCards(modelCards)
  if (!normalizedModelCards.length) {
    return cards.map(card => Object.assign({}, card))
  }
  const shouldApplyByIndex = normalizedModelCards.length >= cards.length
  const sharedSummary = normalizedModelCards.length === 1 && normalizedModelCards[0].summary
    ? normalizedModelCards[0].summary
    : ''
  return cards.map((card, index) => {
    const modelCard = shouldApplyByIndex ? (normalizedModelCards[index] || {}) : {}
    const nextSummary = normalizeFocusCardSummaryText(
      modelCard.summary || sharedSummary || card.summary || card.note || card.reason
    )
    return Object.assign({}, card, {
      title: shouldApplyByIndex && modelCard.title ? modelCard.title : card.title,
      summary: nextSummary,
      note: normalizeFocusCardSummaryText(card.note) || nextSummary,
      reason: coalesce(card.reason, '')
    })
  })
}

function getUtf8Bytes(value) {
  return unescape(encodeURIComponent(value || '')).length
}

function toCharList(value) {
  return String(value || '').split('')
}

function appendArray(target, items) {
  ;(items || []).forEach(item => {
    target.push(item)
  })
}

function getArrayMin(list) {
  if (!Array.isArray(list) || !list.length) {
    return 0
  }
  let result = Number(list[0] || 0)
  list.forEach((item, index) => {
    if (!index) {
      return
    }
    const value = Number(item || 0)
    if (value < result) {
      result = value
    }
  })
  return result
}

function getArrayMax(list) {
  if (!Array.isArray(list) || !list.length) {
    return 0
  }
  let result = Number(list[0] || 0)
  list.forEach((item, index) => {
    if (!index) {
      return
    }
    const value = Number(item || 0)
    if (value > result) {
      result = value
    }
  })
  return result
}

function splitByUtf8Bytes(value, maxBytes) {
  const chunks = []
  let current = ''
  toCharList(value).forEach(char => {
    if (current && getUtf8Bytes(current + char) > maxBytes) {
      chunks.push(current)
      current = char
      return
    }
    current += char
  })
  if (current) {
    chunks.push(current)
  }
  return chunks
}

function splitSpeechText(value) {
  const text = normalizeSpeechText(value)
  if (!text) {
    return []
  }
  const sentences = text.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [text]
  const chunks = []
  let current = ''

  sentences.forEach(sentence => {
    if (!sentence) {
      return
    }
    if (getUtf8Bytes(sentence) > TTS_CHUNK_BYTES) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      appendArray(chunks, splitByUtf8Bytes(sentence, TTS_CHUNK_BYTES))
      return
    }
    if (current && getUtf8Bytes(current + sentence) > TTS_CHUNK_BYTES) {
      chunks.push(current)
      current = sentence
      return
    }
    current += sentence
  })

  if (current) {
    chunks.push(current)
  }
  return chunks
}

function getLocalFileSize(filePath) {
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

function shouldUseMultipartAnalyze(fileSize, dataUrl) {
  const normalizedSize = Number(fileSize || 0)
  const bodyLength = normalizeText(dataUrl).length
  if (normalizedSize > ANALYZE_JSON_FILE_SIZE_LIMIT) {
    return true
  }
  return bodyLength > ANALYZE_JSON_BASE64_LENGTH_LIMIT
}

function buildEmotionList(emotions) {
  if (!emotions || typeof emotions !== 'object' || Array.isArray(emotions)) {
    return []
  }
  const labelMap = {
    neutral: '平静',
    happy: '愉悦',
    sad: '低落',
    angry: '愤怒',
    fear: '紧张',
    disgust: '厌恶',
    surprise: '惊讶'
  }
  return Object.keys(emotions).map(key => {
    const value = normalizeText(emotions[key])
    if (!value) return null
    return {
      key,
      label: labelMap[key] || key,
      value
    }
  }).filter(Boolean)
}

function normalizeAnalysisSections(meta, replyText) {
  const sectionTitles = H5_SECTION_TITLES
  const sections = Array.isArray(meta && meta.analysisSections) ? meta.analysisSections : []
  const normalized = sections
    .map((item, index) => {
      const key = normalizeText(item && item.key)
      const rawTitle = normalizeText(item && (item.title || item.label))
      let title = rawTitle || sectionTitles[index] || `第${index + 1}段`
      if (key === 'recognitionJudgment') title = H5_SECTION_TITLES[0]
      if (key === 'treatmentPlan') title = H5_SECTION_TITLES[1]
      if (key === 'lifeAdvice') title = H5_SECTION_TITLES[2]
      if (key === 'predictionAdvice') title = H5_SECTION_TITLES[3]
      const content = normalizeText(item && (item.content || item.summary))
      return {
        index: index + 1,
        key,
        title,
        content
      }
    })
    .filter(item => item.content && item.title !== '治疗处方' && item.key !== 'treatmentPrescription')

  if (normalized.length) {
    return normalized.map((item, index) => ({
      index: index + 1,
      title: item.title,
      content: item.content
    }))
  }

  return splitSectionReply(replyText).slice(0, sectionTitles.length).map((item, index) => ({
    index: index + 1,
    title: sectionTitles[index] || `第${index + 1}段`,
    content: item
  }))
}

function pickOverallIntro(meta, payload, replyText) {
  return normalizeText(
    meta && (
      meta.overallSummary ||
      meta.overallIntro ||
      meta.summary ||
      meta.faceSummary
    ) ||
    payload && (
      payload.overallSummary ||
      payload.summary ||
      payload.reply
    ) ||
    replyText
  )
}

function buildOverallSpeechText(report) {
  if (!report) {
    return ''
  }
  const parts = []
  const append = (title, value) => {
    const text = normalizeSpeechText(value)
    if (text) {
      parts.push(`${title}。${text}`)
    }
  }

  append('总结分析', report.overallIntro || report.summaryText)
  ;(report.overallSections || []).forEach(item => {
    append(item.title || '', item.content)
  })

  return normalizeSpeechText(parts.join('。')).slice(0, 5000)
}

function getAnalysisSectionContent(meta, key) {
  const sections = Array.isArray(meta && meta.analysisSections) ? meta.analysisSections : []
  const target = sections.find(item => normalizeText(item && item.key) === key)
  return normalizeText(target && (target.content || target.summary))
}

function buildQuickQuestions(meta) {
  const backendQuestions = Array.isArray(meta && meta.followupQuestions)
    ? meta.followupQuestions.map(item => normalizeText(item)).filter(Boolean)
    : []
  if (backendQuestions.length) {
    return backendQuestions.slice(0, 3)
  }
  const questions = []
  const hasFace = Boolean(meta && (meta.face || meta.appearance))
  const mole = meta && meta.mole ? meta.mole : {}
  const hasMole = Boolean(
    mole.summary ||
    mole.readingSummary ||
    (Array.isArray(mole.detections) && mole.detections.length)
  )
  const hasSkin = Boolean(
    getAnalysisSectionContent(meta, 'lifeAdvice') ||
    getAnalysisSectionContent(meta, 'treatmentPlan') ||
    getAnalysisSectionContent(meta, 'treatmentPrescription')
  )

  if (hasFace) {
    questions.push('如果只考虑整形方向，我应该优先面诊哪几个部位？')
  }
  if (hasMole) {
    questions.push('结合这次痣的结果，我现在更适合继续观察，还是尽快去医院检查？')
  }
  if (hasSkin) {
    questions.push('如果我暂时不做项目，接下来一周的皮肤管理重点应该放在哪里？')
  }

  const fallbacks = [
    '你可以继续帮我细讲这次最值得优先关注的一个问题吗？',
    '如果按轻重缓急排序，下一步我应该先做哪件事？',
    '如果我补一张更清晰的正脸近照，你最想重点复核什么？'
  ]

  fallbacks.forEach(item => {
    if (questions.length < 3 && questions.indexOf(item) === -1) {
      questions.push(item)
    }
  })

  return questions.slice(0, 3)
}

function splitSectionReply(replyText) {
  const text = normalizeText(replyText)
  if (!text) {
    return []
  }
  const titles = ['识别判断', '治疗方案', '生活建议', '预测建议']
  const positions = titles.map((title, index) => {
    const reg = new RegExp(`(?:^|\\n)\\s*${index + 1}[\\.、．]\\s*${title}\\s*[：:]?\\s*`)
    const match = text.match(reg)
    return match ? {
      index,
      title,
      start: match.index,
      contentStart: match.index + match[0].length
    } : null
  }).filter(Boolean).sort((a, b) => a.start - b.start)
  if (!positions.length) {
    return text.split(/\n+/).map(item => item.trim()).filter(Boolean)
  }
  return positions.map((item, index) => {
    const end = index + 1 < positions.length ? positions[index + 1].start : text.length
    return text.slice(item.contentStart, end).trim()
  }).filter(Boolean)
}

function getOriginalFaceImage(meta) {
  const storagePath = normalizeText(wx.getStorageSync('faceImagePath') || '')
  if (storagePath) {
    return storagePath
  }
  const storageImage = wrapBase64Image(wx.getStorageSync('faceBase64') || '')
  if (storageImage) {
    return storageImage
  }
  const face = meta && meta.face ? meta.face : {}
  return wrapBase64Image(
    face.sourceImageBase64 ||
    face.originalImageBase64 ||
    meta && (meta.sourceImageBase64 || meta.originalImageBase64) ||
    ''
  )
}

function getFaceOverlayImage(meta) {
  const renderedOverview = getRenderedImageAsset(meta, 'faceOverview')
  if (renderedOverview && renderedOverview.image) {
    return renderedOverview.image
  }
  const face = meta && meta.face ? meta.face : {}
  return wrapBase64Image(face.overlayImageBase64 || '')
}

function getMoleOverlayImage(meta) {
  const renderedOverview = getRenderedImageAsset(meta, 'moleOverview')
  if (renderedOverview && renderedOverview.image) {
    return renderedOverview.image
  }
  const mole = meta && meta.mole ? meta.mole : {}
  return wrapBase64Image(mole.overlayImageBase64 || '')
}

function getRenderedImages(meta) {
  return meta && meta.renderedImages && typeof meta.renderedImages === 'object'
    ? meta.renderedImages
    : {}
}

function getRenderedImageAsset(meta, key, fallbackTitle) {
  const asset = getRenderedImages(meta)[key]
  if (!asset || typeof asset !== 'object') {
    return null
  }
  const image = wrapBase64Image(
    asset.dataUrl ||
    asset.imageBase64 ||
    asset.overlayImageBase64 ||
    asset.base64 ||
    asset.url ||
    asset.image ||
    ''
  )
  if (!image) {
    return null
  }
  return {
    title: normalizeText(asset.title) || fallbackTitle || '',
    desc: normalizeText(asset.summary || asset.note || asset.desc || ''),
    image,
    refs: Array.isArray(asset.refs) ? asset.refs : [],
    raw: asset
  }
}

function getRenderedImageCards(meta, key, fallbackTitlePrefix) {
  const cards = getRenderedImages(meta)[key]
  if (!Array.isArray(cards)) {
    return []
  }
  return cards.map((item, index) => {
    const image = wrapBase64Image(
      item && (
        item.dataUrl ||
        item.imageBase64 ||
        item.overlayImageBase64 ||
        item.base64 ||
        item.url ||
        item.image
      )
    )
    if (!image) {
      return null
    }
    return {
      title: normalizeText(item && item.title) || `${fallbackTitlePrefix || '局部图'}${index + 1}`,
      desc: normalizeText(item && (item.summary || item.note || item.desc)),
      image,
      refs: Array.isArray(item && item.refs) ? item.refs : [],
      raw: item
    }
  }).filter(Boolean)
}

function visualImageFromAsset(asset, fallbackTitle, fallbackNote) {
  if (!asset || !asset.image) {
    return null
  }
  return {
    title: normalizeText(asset.title) || fallbackTitle || '图像',
    src: asset.image,
    note: normalizeText(asset.desc) || fallbackNote || '',
    refs: Array.isArray(asset.refs) ? asset.refs : []
  }
}

function dedupeVisualImages(images) {
  const seen = {}
  return (images || []).filter(item => {
    if (!item || !item.src) {
      return false
    }
    if (seen[item.src]) {
      return false
    }
    seen[item.src] = true
    return true
  })
}

function hasSingleKeypointRef(image) {
  return Array.isArray(image && image.refs) && image.refs.length === 1
}

function getImagePathOrder(meta) {
  const paths = []
  const append = value => {
    const text = normalizeText(value)
    if (text && paths.indexOf(text) === -1) {
      paths.push(text)
    }
  }
  ;(meta && meta.imagePaths || []).forEach(append)
  ;(meta && meta.analysisImagePaths || []).forEach(append)
  append(meta && meta.face && meta.face.sourceImagePath)
  append(meta && meta.mole && meta.mole.sourceImagePath)
  return paths
}

function getImagePathLabel(meta, path, fallback) {
  const text = normalizeText(path)
  if (!text) {
    return fallback || ''
  }
  const index = getImagePathOrder(meta).indexOf(text)
  return index >= 0 ? `图像${index + 1}` : (fallback || '图像')
}

function formatImagePathMeta(meta, path, fallback) {
  const text = normalizeText(path)
  if (!text) {
    return fallback || ''
  }
  return `${getImagePathLabel(meta, text, '图像')}（${text}）`
}

function normalizeLandmarkRefs(refs) {
  if (!Array.isArray(refs)) {
    return []
  }
  return refs.map(item => Number(item))
    .filter(item => Number.isFinite(item) && item >= 1 && item <= 68)
    .map(item => Math.round(item))
    .filter((item, index, list) => list.indexOf(item) === index)
    .sort((a, b) => a - b)
}

function collectAggregateLandmarkRefs(meta) {
  const recommendations = meta && meta.appearance && Array.isArray(meta.appearance.recommendations)
    ? meta.appearance.recommendations
    : []
  const concerns = meta && meta.appearance && Array.isArray(meta.appearance.concerns)
    ? meta.appearance.concerns
    : []
  const recommendationRefs = recommendations.reduce((list, item) => {
    return list.concat(Array.isArray(item.landmarkRefs) ? item.landmarkRefs : [])
  }, [])
  const concernRefs = concerns.reduce((list, item) => {
    return list.concat(Array.isArray(item.landmarkRefs) ? item.landmarkRefs : [])
  }, [])
  return normalizeLandmarkRefs(recommendationRefs.length ? recommendationRefs : concernRefs)
}

const FACE_LANDMARK_FOCUS_GROUPS = [
  {
    key: 'nose',
    title: '鼻部局部放大',
    refs: [28, 29, 30, 31, 32, 33, 34, 35, 36]
  },
  {
    key: 'chin',
    title: '下庭局部放大',
    refs: [7, 8, 9, 10, 11, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]
  },
  {
    key: 'jawline',
    title: '轮廓局部放大',
    refs: [1, 3, 5, 7, 9, 11, 13, 15, 17]
  },
  {
    key: 'centerline',
    title: '中轴局部放大',
    refs: [1, 9, 17, 28, 29, 30, 31, 34, 49, 55]
  }
]

function clampViewBox(box, width, height) {
  const safeWidth = Math.max(1, Number(width || 0))
  const safeHeight = Math.max(1, Number(height || 0))
  const nextWidth = Math.max(80, Math.min(safeWidth, Number(box.width || 0)))
  const nextHeight = Math.max(80, Math.min(safeHeight, Number(box.height || 0)))
  const maxX = Math.max(0, safeWidth - nextWidth)
  const maxY = Math.max(0, safeHeight - nextHeight)
  return {
    x: Math.max(0, Math.min(maxX, Number(box.x || 0))),
    y: Math.max(0, Math.min(maxY, Number(box.y || 0))),
    width: nextWidth,
    height: nextHeight
  }
}

function buildFocusCrop(points, width, height) {
  if (!Array.isArray(points) || !points.length || width <= 0 || height <= 0) {
    return null
  }
  const xs = points.map(item => Number(item.x || 0))
  const ys = points.map(item => Number(item.y || 0))
  const minX = getArrayMin(xs)
  const maxX = getArrayMax(xs)
  const minY = getArrayMin(ys)
  const maxY = getArrayMax(ys)
  const spanX = Math.max(90, maxX - minX)
  const spanY = Math.max(90, maxY - minY)
  const padX = Math.max(40, spanX * 0.6)
  const padY = Math.max(40, spanY * 0.7)
  const side = Math.max(220, spanX + padX * 2, spanY + padY * 2)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  return clampViewBox({
    x: centerX - side / 2,
    y: centerY - side / 2,
    width: side,
    height: side
  }, width, height)
}

function buildFocusCard(source, width, height, keypoints, refs, crop, title, key) {
  const refSet = new Set(refs)
  const imageWidthPercent = width / crop.width * 100
  const imageHeightPercent = height / crop.height * 100
  const imageLeftPercent = -crop.x / crop.width * 100
  const imageTopPercent = -crop.y / crop.height * 100
  const frameRatioPercent = crop.height / crop.width * 100
  const points = keypoints.map(point => {
    const index = Number(point && point.index || 0)
    const x = Number(point && point.x || 0)
    const y = Number(point && point.y || 0)
    const active = refSet.has(index)
    const radius = active ? 11 : 4
    const diameter = radius * 2
    return {
      index,
      active,
      style: [
        `left:${(x - crop.x) / crop.width * 100}%`,
        `top:${(y - crop.y) / crop.height * 100}%`,
        `width:${diameter / crop.width * 100}%`,
        `height:${diameter / crop.height * 100}%`,
        `margin-left:${-radius / crop.width * 100}%`,
        `margin-top:${-radius / crop.height * 100}%`
      ].join(';') + ';',
      labelStyle: [
        `left:${(radius + 5) / diameter * 100}%`,
        `top:${-(radius + 3) / diameter * 100}%`,
        'font-size:22rpx;'
      ].join(';') + ';'
    }
  }).filter(item => item && item.index)
  return {
    key,
    title,
    refs,
    summary: getAestheticFocusSummary(title, refs),
    source,
    frameStyle: `padding-top:${frameRatioPercent}%;`,
    imageStyle: `width:${imageWidthPercent}%;height:${imageHeightPercent}%;left:${imageLeftPercent}%;top:${imageTopPercent}%;`,
    points,
    boxes: []
  }
}

function getAestheticFocusSummary(title, refs) {
  const joinedRefs = Array.isArray(refs) && refs.length ? `${refs.join('、')}号点` : '对应点位'
  const normalizedTitle = normalizeText(title)
  if (normalizedTitle.indexOf('鼻') !== -1) {
    return formatIssueSolutionSummary(
      `问题主要集中在鼻部支撑和鼻尖鼻翼比例上，${joinedRefs} 附近还值得再细看`,
      '先按自然微调的思路评估鼻尖立体度、鼻翼收束和中轴线协调，再结合面诊决定是否需要轻度优化'
    )
  }
  if (normalizedTitle.indexOf('轮廓') !== -1) {
    return formatIssueSolutionSummary(
      `问题主要在外轮廓和下颌缘的衔接还可以更利落，${joinedRefs} 一带适合继续细看`,
      '先围绕下颌缘紧致提升和下庭比例评估，再决定要不要做更细的轮廓微调'
    )
  }
  if (normalizedTitle.indexOf('下庭') !== -1) {
    return formatIssueSolutionSummary(
      `问题主要是下庭长度和口周衔接还可以再顺一些，${joinedRefs} 一带值得继续观察`,
      '先把下巴比例、下颌缘线条和侧面衔接一起评估，再按面诊结果决定轻度优化方向'
    )
  }
  if (normalizedTitle.indexOf('中轴') !== -1) {
    return formatIssueSolutionSummary(
      `问题主要在面部中轴与五官协调度还可以再对齐，${joinedRefs} 附近适合继续确认`,
      '先把鼻唇下巴的连贯性拆开看，再按自然微调来定是否需要进一步面诊'
    )
  }
  return formatIssueSolutionSummary(
    `问题主要是这组局部点位的比例和平衡度还有进一步确认的空间，${joinedRefs} 一带可以继续观察`,
    '先结合高清正脸和面诊把重点区域拆开评估，再按自然、分步的方式决定方案'
  )
}

function buildFaceOverviewPreviewCard(source, width, height, keypoints, highlightedRefs, title, key) {
  if (!source || width <= 0 || height <= 0 || !Array.isArray(keypoints) || !keypoints.length) {
    return null
  }
  const refs = normalizeLandmarkRefs(highlightedRefs)
  const refSet = new Set(refs)
  const points = keypoints.map(point => {
    const index = Number(point && point.index || 0)
    const x = Number(point && point.x || 0)
    const y = Number(point && point.y || 0)
    if (!index || !Number.isFinite(x) || !Number.isFinite(y)) {
      return null
    }
    const active = refSet.has(index)
    const radius = active ? 12 : 5
    const diameter = radius * 2
    return {
      index,
      active,
      style: [
        `left:${x / width * 100}%`,
        `top:${y / height * 100}%`,
        `width:${diameter / width * 100}%`,
        `height:${diameter / height * 100}%`,
        `margin-left:${-radius / width * 100}%`,
        `margin-top:${-radius / height * 100}%`
      ].join(';') + ';',
      labelStyle: [
        `left:${(radius + 4) / diameter * 100}%`,
        `top:${-(radius + 2) / diameter * 100}%`
      ].join(';') + ';'
    }
  }).filter(Boolean)
  return {
    key: key || 'face_overview',
    title: title || '68点位图',
    refs,
    summary: `已在客户端基于 ${points.length} 个点位实时描绘`,
    source,
    previewMode: 'landmark',
    frameStyle: `padding-top:${height / width * 100}%;`,
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points,
    boxes: []
  }
}

function createFaceFocusCards(source, width, height, keypoints, highlighted) {
  const refs = Array.isArray(highlighted)
    ? highlighted
    : highlighted && typeof highlighted.length === 'number'
      ? Array.prototype.slice.call(highlighted)
      : []
  if (!source || width <= 0 || height <= 0 || !Array.isArray(keypoints) || !keypoints.length || !refs.length) {
    return []
  }
  const cards = FACE_LANDMARK_FOCUS_GROUPS.map(group => {
    const matchedRefs = refs.filter(item => group.refs.indexOf(item) !== -1)
    if (!matchedRefs.length) {
      return null
    }
    const points = keypoints.filter(item => matchedRefs.indexOf(Number(item && item.index || 0)) !== -1)
    const crop = buildFocusCrop(points, width, height)
    return crop ? buildFocusCard(source, width, height, keypoints, matchedRefs, crop, group.title, group.key) : null
  }).filter(Boolean)

  if (cards.length) {
    return cards
  }
  const genericPoints = keypoints.filter(item => refs.indexOf(Number(item && item.index || 0)) !== -1)
  const crop = buildFocusCrop(genericPoints, width, height)
  return crop ? [buildFocusCard(source, width, height, keypoints, refs, crop, '命中点局部放大', 'generic')] : []
}

function buildRecommendationFocusCards(meta, source, recommendation) {
  const face = meta && meta.face ? meta.face : {}
  const imageSize = face.imageSize && typeof face.imageSize === 'object' ? face.imageSize : {}
  const width = Number(imageSize.width || 0)
  const height = Number(imageSize.height || 0)
  const keypoints = Array.isArray(face.keypoints) ? face.keypoints : []
  const refs = normalizeLandmarkRefs(recommendation && recommendation.landmarkRefs)
  if (refs.length <= 1) {
    return []
  }
  return createFaceFocusCards(source, width, height, keypoints, refs)
}

function normalizeDetectionBbox(rawBbox, width, height) {
  if (!Array.isArray(rawBbox) || rawBbox.length < 4 || width <= 0 || height <= 0) {
    return null
  }
  const x1 = Math.max(0, Math.min(width, Number(rawBbox[0] || 0)))
  const y1 = Math.max(0, Math.min(height, Number(rawBbox[1] || 0)))
  const x2 = Math.max(0, Math.min(width, Number(rawBbox[2] || 0)))
  const y2 = Math.max(0, Math.min(height, Number(rawBbox[3] || 0)))
  if (!(x2 > x1 && y2 > y1)) {
    return null
  }
  return {
    x1,
    y1,
    x2,
    y2,
    width: x2 - x1,
    height: y2 - y1
  }
}

function expandDetectionCrop(box, width, height, padRatio) {
  const ratio = Number(padRatio || 0.22)
  const padX = Math.max(24, box.width * ratio)
  const padY = Math.max(24, box.height * ratio)
  return clampViewBox({
    x: box.x1 - padX,
    y: box.y1 - padY,
    width: box.width + padX * 2,
    height: box.height + padY * 2
  }, width, height)
}

function extractPercentStyleValue(styleText, key) {
  const source = normalizeText(styleText)
  if (!source || !key) {
    return NaN
  }
  const matcher = new RegExp(`${key}\\s*:\\s*([-\\d.]+)%`, 'i')
  const match = source.match(matcher)
  return match ? Number(match[1]) : NaN
}

function buildMoleFocusCardsFromPreviewCard(previewCard) {
  if (!previewCard || !previewCard.source || !Array.isArray(previewCard.boxes) || !previewCard.boxes.length) {
    return []
  }
  const width = Number(previewCard.width || 0)
  const height = Number(previewCard.height || 0)
  if (width <= 0 || height <= 0) {
    return []
  }
  const cards = previewCard.boxes.map((item, index) => {
    const style = normalizeText(item && item.style)
    const leftPercent = extractPercentStyleValue(style, 'left')
    const topPercent = extractPercentStyleValue(style, 'top')
    const widthPercent = extractPercentStyleValue(style, 'width')
    const heightPercent = extractPercentStyleValue(style, 'height')
    if (![leftPercent, topPercent, widthPercent, heightPercent].every(value => Number.isFinite(value))) {
      return null
    }
    const box = normalizeDetectionBbox([
      width * leftPercent / 100,
      height * topPercent / 100,
      width * (leftPercent + widthPercent) / 100,
      height * (topPercent + heightPercent) / 100
    ], width, height)
    if (!box) {
      return null
    }
    const crop = expandDetectionCrop(box, width, height, 0.22)
    const imageWidthPercent = width / crop.width * 100
    const imageHeightPercent = height / crop.height * 100
    const imageLeftPercent = -crop.x / crop.width * 100
    const imageTopPercent = -crop.y / crop.height * 100
    const frameRatioPercent = crop.height / crop.width * 100
    const label = normalizeText(item && item.label) || `目标${index + 1}`
    return {
      key: `mole_preview_focus_${index + 1}`,
      title: `痣局部命中图${index + 1}`,
      refs: [],
      summary: DEFAULT_MOLE_FOCUS_NOTE,
      source: previewCard.source,
      frameStyle: `padding-top:${frameRatioPercent}%;`,
      imageStyle: `width:${imageWidthPercent}%;height:${imageHeightPercent}%;left:${imageLeftPercent}%;top:${imageTopPercent}%;`,
      points: [],
      boxes: [
        {
          style: [
            `left:${(box.x1 - crop.x) / crop.width * 100}%`,
            `top:${(box.y1 - crop.y) / crop.height * 100}%`,
            `width:${box.width / crop.width * 100}%`,
            `height:${box.height / crop.height * 100}%`
          ].join(';') + ';',
          label
        }
      ]
    }
  }).filter(Boolean)
  console.log('[mianzhenjieguo] buildMoleFocusCardsFromPreviewCard result', {
    width,
    height,
    boxCount: previewCard.boxes.length,
    focusCardCount: cards.length
  })
  return cards.map(ensureMoleFocusCardSummary)
}

function collectMoleDetectionCandidates(meta) {
  const mole = meta && meta.mole ? meta.mole : {}
  const directDetections = Array.isArray(mole.detections) ? mole.detections : []
  const overlayDetections = Array.isArray(mole.focusOverlays)
    ? mole.focusOverlays.map((item, index) => ({
        id: normalizeText(item && item.id) || `overlay_${index + 1}`,
        label: normalizeText(item && item.title) || `目标${index + 1}`,
        confidence: undefined,
        bbox: Array.isArray(item && item.bbox) ? item.bbox : [],
        cropBbox: Array.isArray(item && item.cropBbox) ? item.cropBbox : []
      }))
        .filter(item => Array.isArray(item.bbox) && item.bbox.length === 4)
    : []
  return directDetections.length ? directDetections : overlayDetections
}

function buildMoleFocusCardsFromDetections(source, width, height, detections) {
  if (!source || width <= 0 || height <= 0 || !detections.length) {
    if (detections.length) {
      console.warn('[mianzhenjieguo] buildMoleFocusCards skipped', {
        hasSource: !!source,
        width,
        height,
        detectionCount: detections.length
      })
    }
    return []
  }
  const cards = detections.map((item, index) => {
    const box = normalizeDetectionBbox(item && item.bbox, width, height)
    const cropSource = normalizeDetectionBbox(item && item.cropBbox, width, height) || box
    if (!box || !cropSource) {
      console.warn('[mianzhenjieguo] invalid mole bbox', {
        index,
        bbox: item && item.bbox,
        cropBbox: item && item.cropBbox,
        width,
        height
      })
      return null
    }
    const crop = expandDetectionCrop(cropSource, width, height, 0.22)
    const imageWidthPercent = width / crop.width * 100
    const imageHeightPercent = height / crop.height * 100
    const imageLeftPercent = -crop.x / crop.width * 100
    const imageTopPercent = -crop.y / crop.height * 100
    const frameRatioPercent = crop.height / crop.width * 100
    const label = normalizeText(item && item.label) || `目标${index + 1}`
    return {
      key: `mole_focus_${index + 1}`,
      title: `痣局部命中图${index + 1}`,
      refs: [],
      summary: DEFAULT_MOLE_FOCUS_NOTE,
      source,
      frameStyle: `padding-top:${frameRatioPercent}%;`,
      imageStyle: `width:${imageWidthPercent}%;height:${imageHeightPercent}%;left:${imageLeftPercent}%;top:${imageTopPercent}%;`,
      points: [],
      boxes: [
        {
          style: [
            `left:${(box.x1 - crop.x) / crop.width * 100}%`,
            `top:${(box.y1 - crop.y) / crop.height * 100}%`,
            `width:${box.width / crop.width * 100}%`,
            `height:${box.height / crop.height * 100}%`
          ].join(';') + ';',
          label
        }
      ]
    }
  }).filter(Boolean)
  console.log('[mianzhenjieguo] buildMoleFocusCards result', {
    source,
    width,
    height,
    detectionCount: detections.length,
    focusCardCount: cards.length
  })
  return cards.map(ensureMoleFocusCardSummary)
}

function buildMoleFocusCards(meta, source) {
  const face = meta && meta.face ? meta.face : {}
  const renderedImages = meta && meta.renderedImages && typeof meta.renderedImages === 'object'
    ? meta.renderedImages
    : {}
  const renderedMoleOverview = renderedImages.moleOverview && typeof renderedImages.moleOverview === 'object'
    ? renderedImages.moleOverview
    : {}
  const imageSize = meta && meta.mole && meta.mole.imageSize && typeof meta.mole.imageSize === 'object'
    ? meta.mole.imageSize
    : face.imageSize && typeof face.imageSize === 'object'
      ? face.imageSize
      : {}
  const width = Number(imageSize.width || renderedMoleOverview.width || 0)
  const height = Number(imageSize.height || renderedMoleOverview.height || 0)
  const directDetections = meta && meta.mole && Array.isArray(meta.mole.detections) ? meta.mole.detections : []
  const overlayDetections = meta && meta.mole && Array.isArray(meta.mole.focusOverlays)
    ? meta.mole.focusOverlays.filter(item => Array.isArray(item && item.bbox) && item.bbox.length === 4)
    : []
  const detections = collectMoleDetectionCandidates(meta)
  const cards = buildMoleFocusCardsFromDetections(source, width, height, detections)
  console.log('[mianzhenjieguo] buildMoleFocusCards sources', {
    directDetectionCount: directDetections.length,
    overlayDetectionCount: overlayDetections.length,
    width,
    height,
    focusCardCount: cards.length
  })
  return cards
}

function buildRenderedPreviewCard(asset, width, height, key) {
  if (!asset || !asset.image) {
    return null
  }
  const safeWidth = Number(width || 0)
  const safeHeight = Number(height || 0)
  const ratio = safeWidth > 0 && safeHeight > 0 ? safeHeight / safeWidth * 100 : 100
  return {
    key: key || 'rendered_preview',
    title: normalizeText(asset.title) || '图像预览',
    refs: Array.isArray(asset.refs) ? asset.refs : [],
    summary: normalizeText(asset.desc),
    source: asset.image,
    frameStyle: `padding-top:${ratio}%;`,
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points: [],
    boxes: []
  }
}

function buildRenderedFocusCards(meta, key, fallbackTitlePrefix) {
  const cards = getRenderedImageCards(meta, key, fallbackTitlePrefix).map((item, index) => ({
    key: `rendered_focus_${index + 1}`,
    title: item.title || `${fallbackTitlePrefix || '局部图'}${index + 1}`,
    refs: Array.isArray(item.refs) ? item.refs : [],
    summary: normalizeFocusCardSummaryText(item.desc) || (
      String(fallbackTitlePrefix || '').indexOf('痣') !== -1
        ? DEFAULT_MOLE_FOCUS_NOTE
        : formatIssueSolutionSummary(
          '问题主要是这组局部点位的比例和平衡度还有进一步确认的空间',
          '先结合高清正脸和面诊把重点区域拆开评估，再按自然、分步的方式决定方案'
        )
    ),
    source: item.image,
    frameStyle: 'padding-top:100%;',
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points: [],
    boxes: []
  }))
  return String(fallbackTitlePrefix || '').indexOf('痣') !== -1
    ? cards.map(ensureMoleFocusCardSummary)
    : cards
}

function buildMoleOverlayFocusCards(meta) {
  const mole = meta && meta.mole ? meta.mole : {}
  const cards = Array.isArray(mole.focusOverlays) ? mole.focusOverlays : []
  return cards.map((item, index) => {
    const image = wrapBase64Image(
      item && (
        item.overlayImageBase64 ||
        item.dataUrl ||
        item.imageBase64 ||
        item.base64 ||
        item.url ||
        item.image
      )
    )
    if (!image) {
      return null
    }
    return {
      key: `mole_overlay_${index + 1}`,
      title: normalizeText(item && item.title) || `痣局部命中图${index + 1}`,
      refs: [],
      summary: normalizeFocusCardSummaryText(item && (item.summary || item.note || item.desc)) || DEFAULT_MOLE_FOCUS_NOTE,
      source: image,
      frameStyle: 'padding-top:100%;',
      imageStyle: 'width:100%;height:100%;left:0;top:0;',
      points: [],
      boxes: []
    }
  }).filter(Boolean).map(ensureMoleFocusCardSummary)
}

function buildMoleOverviewPreviewCard(meta, source) {
  const mole = meta && meta.mole ? meta.mole : {}
  const face = meta && meta.face ? meta.face : {}
  const imageSize = mole.imageSize && typeof mole.imageSize === 'object'
    ? mole.imageSize
    : face.imageSize && typeof face.imageSize === 'object'
      ? face.imageSize
      : {}
  const width = Number(imageSize.width || 0)
  const height = Number(imageSize.height || 0)
  const directDetections = Array.isArray(mole.detections) ? mole.detections : []
  const overlayDetections = Array.isArray(mole.focusOverlays)
    ? mole.focusOverlays.map((item, index) => ({
        label: normalizeText(item && item.title) || `目标${index + 1}`,
        bbox: Array.isArray(item && item.bbox) ? item.bbox : [],
        cropBbox: Array.isArray(item && item.cropBbox) ? item.cropBbox : []
      }))
        .filter(item => Array.isArray(item.bbox) && item.bbox.length === 4)
    : []
  const detections = directDetections.length ? directDetections : overlayDetections
  const renderedOverview = getRenderedImageAsset(meta, 'moleOverview', '痣识别图')
  const hasDetections = Array.isArray(detections) && detections.length > 0
  const previewSource = hasDetections
    ? (source || renderedOverview && renderedOverview.image || '')
    : (renderedOverview && renderedOverview.image || source || '')
  if (!previewSource) {
    return null
  }
  const safeWidth = Number(width || renderedOverview && renderedOverview.raw && renderedOverview.raw.width || renderedOverview && renderedOverview.width || 1)
  const safeHeight = Number(height || renderedOverview && renderedOverview.raw && renderedOverview.raw.height || renderedOverview && renderedOverview.height || 1)
  const boxes = detections.map((item, index) => {
    const box = normalizeDetectionBbox(item && item.bbox, safeWidth, safeHeight)
    if (!box) {
      return null
    }
    return {
      style: [
        `left:${box.x1 / safeWidth * 100}%`,
        `top:${box.y1 / safeHeight * 100}%`,
        `width:${box.width / safeWidth * 100}%`,
        `height:${box.height / safeHeight * 100}%`
      ].join(';') + ';',
      label: normalizeText(item && item.label) || `目标${index + 1}`
    }
  }).filter(Boolean)
  return {
    key: 'mole_overview',
    title: '痣识别图',
    refs: [],
    summary: boxes.length ? `已在客户端根据 ${boxes.length} 个检测框实时描绘` : '本轮未识别到明确痣目标',
    source: previewSource,
    previewMode: 'mole',
    width: safeWidth,
    height: safeHeight,
    frameStyle: `padding-top:${safeHeight / safeWidth * 100}%;`,
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points: [],
    boxes
  }
}

function buildImageEchoList(meta, originalImage) {
  const face = meta && meta.face ? meta.face : {}
  const sourceImage = originalImage || getOriginalFaceImage(meta)
  const sourceLabel = getImagePathLabel(meta, face.sourceImagePath, '图像1')
  const keypointCount = Number(face.keypointCount || 0)
  const keypointText = keypointCount ? `${keypointCount} 个关键点` : '68 个关键点'
  const faceOverview = buildFaceOverviewPreviewCard(
    sourceImage,
    Number(face && face.imageSize && face.imageSize.width || 0),
    Number(face && face.imageSize && face.imageSize.height || 0),
    Array.isArray(face && face.keypoints) ? face.keypoints : [],
    face.aggregateLandmarkRefs
  )
  const imageEchoList = []
  if (sourceImage) {
    imageEchoList.push({
      title: '原图',
      meta: formatImagePathMeta(meta, face.sourceImagePath, '当前会话使用的原图'),
      image: sourceImage,
      desc: `${sourceLabel} 是当前会话使用的原始主图，系统会以它作为人脸关键点和痣识别的主分析底图。`,
      action: 'modal'
    })
  }
  if (faceOverview) {
    imageEchoList.push({
      title: '点击查看面部问题',
      meta: `基于${sourceLabel}在客户端实时描绘`,
      image: sourceImage,
      previewCard: faceOverview,
      desc: `分析图基于${sourceLabel}生成，已展示全部 ${keypointText}，用来观察眉眼、鼻口和轮廓比例。`,
      action: 'toggle-drilldown'
    })
  }
  return imageEchoList
}

function buildVisualDetailSections(meta, originalImage) {
  const primarySrc = originalImage || getOriginalFaceImage(meta)
  const mole = meta && meta.mole ? meta.mole : {}
  const face = meta && meta.face ? meta.face : {}
  const modelFaceFocusCards = normalizeModelFocusCards(
    Array.isArray(meta && meta.focusCards)
      ? meta.focusCards
      : (face && Array.isArray(face.focusCards) ? face.focusCards : [])
  )
  const renderedImages = getRenderedImages(meta)
  const modelMoleFocusCards = normalizeModelFocusCards(
    Array.isArray(renderedImages && renderedImages.moleFocusCards) && renderedImages.moleFocusCards.length
      ? renderedImages.moleFocusCards
      : (mole && Array.isArray(mole.focusCards) ? mole.focusCards : [])
  )
  const renderedMoleOverview = getRenderedImageAsset(meta, 'moleOverview', '痣识别图')
  const hasMoleDetections = Array.isArray(mole && mole.detections) && mole.detections.length > 0
  const preferredMoleOverviewSrc = hasMoleDetections
    ? (primarySrc || renderedMoleOverview && renderedMoleOverview.image || '')
    : (renderedMoleOverview && renderedMoleOverview.image || primarySrc || '')
  console.log('[mianzhenjieguo] buildVisualDetailSections mole source', {
    hasMoleDetections,
    usesRenderedOverview: !!(!hasMoleDetections && renderedMoleOverview && renderedMoleOverview.image),
    preferredMoleOverviewSrcPrefix: normalizeText(preferredMoleOverviewSrc).slice(0, 40)
  })
  const localMoleFocusCards = buildMoleFocusCards(meta, primarySrc)
  const renderedMoleFocusCards = buildRenderedFocusCards(meta, 'moleFocusCards', '痣局部命中图')
  const overlayMoleFocusCards = buildMoleOverlayFocusCards(meta)
  const moleOverview = buildMoleOverviewPreviewCard(meta, primarySrc)
  const previewFallbackMoleFocusCards = buildMoleFocusCardsFromPreviewCard(moleOverview)
  const moleFocusCards = localMoleFocusCards.length
    ? localMoleFocusCards
    : renderedMoleFocusCards.length
      ? renderedMoleFocusCards
      : previewFallbackMoleFocusCards.length
        ? previewFallbackMoleFocusCards
        : overlayMoleFocusCards
  const moleFocusCardsWithCopy = applyModelFocusCardCopy(moleFocusCards, modelMoleFocusCards)
    .map(ensureMoleFocusCardSummary)
  const faceOverview = buildFaceOverviewPreviewCard(
    primarySrc,
    Number(face && face.imageSize && face.imageSize.width || 0),
    Number(face && face.imageSize && face.imageSize.height || 0),
    Array.isArray(face && face.keypoints) ? face.keypoints : [],
    collectAggregateLandmarkRefs(meta)
  )
  const aestheticFocusCards = applyModelFocusCardCopy(createFaceFocusCards(
    primarySrc,
    Number(face && face.imageSize && face.imageSize.width || 0),
    Number(face && face.imageSize && face.imageSize.height || 0),
    Array.isArray(face && face.keypoints) ? face.keypoints : [],
    collectAggregateLandmarkRefs(meta)
  ).filter(item => !hasSingleKeypointRef(item)), modelFaceFocusCards)
  const skinGroup = dedupeVisualImages([
    primarySrc
      ? {
        title: '原图',
        src: primarySrc,
        note: '当前会话用于分析的原始图片。',
        refs: []
      }
      : null
  ])
  const sections = [
    {
      key: 'skin',
      eyebrow: 'SKIN',
      title: normalizeText(skinGroup[0] && skinGroup[0].title) || '皮肤图',
      src: skinGroup[0] && skinGroup[0].src || '',
      note: '这张图主要用于观察整体肤色、明暗分布、基础纹理和日常皮肤管理方向，适合先从整体状态与护理重点做初步判断。',
      galleryImages: skinGroup,
      focusImages: []
    },
    {
      key: 'mole',
      eyebrow: 'MOLE',
      title: '痣识别图',
      src: (
        preferredMoleOverviewSrc ||
        moleOverview && moleOverview.source ||
        renderedMoleOverview && renderedMoleOverview.image ||
        overlayMoleFocusCards[0] && overlayMoleFocusCards[0].source ||
        ''
      ),
      previewCard: moleOverview,
      note: moleFocusCards.length
        ? `这张图用于查看痣目标命中位置；下方 ${moleFocusCardsWithCopy.length} 张局部图已准备好，可继续查看局部命中区域。`
        : '这张图用于查看当前是否有痣目标被命中，以及命中区域的大致位置；如果没有结果，通常说明本轮未形成明确痣识别输出。',
      galleryImages: [],
      focusCards: moleFocusCardsWithCopy
    },
    {
      key: 'aesthetic',
      eyebrow: 'AESTHETIC',
      title: '美容局部图',
      src: primarySrc || '',
      previewCard: faceOverview,
      note: aestheticFocusCards.length
        ? `这张图用于聚焦医美建议关联区域；下方 ${aestheticFocusCards.length} 张局部图已由前端按 68 点结构实时生成。`
        : '这张图用于聚焦整形或医美建议关联的重点区域，让你更直观看到建议对应的是哪一部分面部结构。',
      galleryImages: [],
      focusCards: aestheticFocusCards
    }
  ]
  return sections.filter(item => item.src)
}

function buildDetailImageList(meta, originalImage) {
  const concerns = ((meta && meta.appearance && meta.appearance.concerns) || [])
  const recommendations = ((meta && meta.appearance && meta.appearance.recommendations) || [])
  const detailImageList = []
  const sourceImage = originalImage || getOriginalFaceImage(meta)
  const focusSource = sourceImage
  const skinConcern = concerns[0] || null
  const mole = meta && meta.mole ? meta.mole : {}
  const face = meta && meta.face ? meta.face : {}
  const modelFaceFocusCards = normalizeModelFocusCards(
    Array.isArray(meta && meta.focusCards)
      ? meta.focusCards
      : (face && Array.isArray(face.focusCards) ? face.focusCards : [])
  )
  const renderedImages = getRenderedImages(meta)
  const modelMoleFocusCards = normalizeModelFocusCards(
    Array.isArray(renderedImages && renderedImages.moleFocusCards) && renderedImages.moleFocusCards.length
      ? renderedImages.moleFocusCards
      : (mole && Array.isArray(mole.focusCards) ? mole.focusCards : [])
  )
  const hasMoleDetections = Array.isArray(mole && mole.detections) && mole.detections.length > 0
  const faceOverview = buildFaceOverviewPreviewCard(
    focusSource,
    Number(meta && meta.face && meta.face.imageSize && meta.face.imageSize.width || 0),
    Number(meta && meta.face && meta.face.imageSize && meta.face.imageSize.height || 0),
    meta && meta.face && Array.isArray(meta.face.keypoints) ? meta.face.keypoints : [],
    collectAggregateLandmarkRefs(meta)
  )
  const moleOverview = buildMoleOverviewPreviewCard(meta, focusSource)
  const renderedMoleOverview = getRenderedImageAsset(meta, 'moleOverview', '痣识别图')
  const preferredMoleOverviewImage = hasMoleDetections
    ? (focusSource || renderedMoleOverview && renderedMoleOverview.image || '')
    : (renderedMoleOverview && renderedMoleOverview.image || focusSource || '')
  const localMoleFocusCards = buildMoleFocusCards(meta, focusSource)
  const renderedMoleFocusCards = buildRenderedFocusCards(meta, 'moleFocusCards', '痣局部命中图')
  const overlayMoleFocusCards = buildMoleOverlayFocusCards(meta)
  const previewFallbackMoleFocusCards = buildMoleFocusCardsFromPreviewCard(moleOverview)
  const moleFocusCards = localMoleFocusCards.length
    ? localMoleFocusCards
    : renderedMoleFocusCards.length
      ? renderedMoleFocusCards
      : previewFallbackMoleFocusCards.length
        ? previewFallbackMoleFocusCards
        : overlayMoleFocusCards
  const moleFocusCardsWithCopy = applyModelFocusCardCopy(moleFocusCards, modelMoleFocusCards)
    .map(ensureMoleFocusCardSummary)
  const allFocusCards = applyModelFocusCardCopy(createFaceFocusCards(
    focusSource,
    Number(meta && meta.face && meta.face.imageSize && meta.face.imageSize.width || 0),
    Number(meta && meta.face && meta.face.imageSize && meta.face.imageSize.height || 0),
    meta && meta.face && Array.isArray(meta.face.keypoints) ? meta.face.keypoints : [],
    collectAggregateLandmarkRefs(meta)
  ), modelFaceFocusCards)

  if (sourceImage || skinConcern) {
    detailImageList.push({
      title: '皮肤管理图',
      desc: '基于原图做皮肤方向观察与护理建议入口。',
      image: sourceImage,
      modalTitle: '皮肤管理建议',
      modalIntro: '这里聚焦日常护理、当前处理方向和后续观察建议，帮助先从皮肤管理层面看整体状态。',
      highlights: '',
      blocks: [
        {
          level: '',
          label: '',
          title: skinConcern && skinConcern.title || '皮肤管理建议',
          desc: skinConcern && (skinConcern.summary || skinConcern.desc) || '',
          refs: skinConcern && (skinConcern.landmarkRefs || []).length ? `${skinConcern.landmarkRefs.join('、')}号点` : '',
          consult: skinConcern && skinConcern.suggestion || '',
          tip: skinConcern && (skinConcern.evidence || []).join('；') || '',
          images: []
        }
      ]
    })
  }

  if (focusSource && (mole.summary || mole.readingSummary || moleFocusCardsWithCopy.length || (moleOverview && moleOverview.boxes && moleOverview.boxes.length))) {
    detailImageList.push({
      title: '痣识别总图',
      desc: '点击后查看痣相关介绍和局部命中图。',
      image: (
        preferredMoleOverviewImage ||
        moleOverview && moleOverview.source ||
        renderedMoleOverview && renderedMoleOverview.image ||
        overlayMoleFocusCards[0] && overlayMoleFocusCards[0].source
      ),
      previewCard: moleOverview,
      modalTitle: '痣识别说明与局部命中图',
      modalIntro: '这里展示痣识别摘要与局部命中图，便于继续观察边界、颜色和周边皮肤状态。',
      highlights: '',
      blocks: [
        {
          level: '',
          label: '',
          title: '识别判断',
          desc: mole.summary || mole.readingSummary || '',
          refs: '',
          consult: '',
          tip: '',
          images: []
        },
        {
          level: '',
          label: '',
          title: moleFocusCardsWithCopy.length ? '局部命中图' : '暂无局部命中图',
          desc: moleFocusCardsWithCopy.length ? '局部图会优先使用服务端返回的说明文案；如果服务端没有返回，再按当前图像结果自动补齐说明，方便继续观察边界、颜色和周边皮肤状态。' : '',
          refs: '',
          consult: '',
          tip: '',
          images: []
        }
      ].filter(item => item.desc || item.images.length || (item.focusCards && item.focusCards.length))
      ,
      focusCards: moleFocusCardsWithCopy
    })
  }

  if (recommendations.length || allFocusCards.length) {
    const blocks = recommendations.map(item => {
      const focusCards = buildRecommendationFocusCards(meta, focusSource, item)
      return {
        level: item.priority || '',
        label: item.code || '医美建议',
        title: item.title || '',
        desc: item.summary || '',
        refs: (item.landmarkRefs || []).length ? `${item.landmarkRefs.join('、')}号点` : '',
        consult: (item.suggestedProjects || []).length ? item.suggestedProjects.join('、') : '',
        tip: item.caution || '',
        images: [],
        focusCards
      }
    })
    if (!blocks.length && allFocusCards.length) {
      allFocusCards.forEach(item => {
        blocks.push({
          level: '',
          label: '医美局部图',
          title: item.title,
          desc: item.summary,
          refs: item.refs.length ? `${item.refs.join('、')}号点` : '',
          consult: '',
          tip: '',
          images: [],
          focusCards: [item]
        })
      })
    }
    detailImageList.push({
      title: '面部问题图',
      desc: blocks[0] && blocks[0].desc ? blocks[0].desc : '点击后查看下面的说明图和对应局部放大图。',
      image: focusSource,
      previewCard: faceOverview,
      previewFocus: allFocusCards[0] || null,
      modalTitle: '面部问题图与医美建议联动',
      modalIntro: '这里聚焦本轮医美建议。每条建议下方都会带对应的局部放大图，便于对照数字点位和面部区域。',
      highlights: blocks[0] ? `当前高亮：${blocks[0].title}` : '',
      blocks
    })
  }

  return detailImageList.filter(item => item.image)
}

function buildReportFromApiPayload(payload) {
  const meta = payload && (payload.meta || payload.messageResponse && payload.messageResponse.meta || payload)
  if (meta && payload && Array.isArray(payload.followupQuestions) && !Array.isArray(meta.followupQuestions)) {
    meta.followupQuestions = payload.followupQuestions
  }
  const replyText = normalizeText(
    payload && payload.messageResponse && payload.messageResponse.reply ||
    payload && payload.reply ||
    payload && payload.content ||
    ''
  )
  const summaryText = pickOverallIntro(meta, payload, replyText) || DEFAULT_REPORT.summaryText
  const overallIntro = pickOverallIntro(meta, payload, replyText) || summaryText
  const overallSections = normalizeAnalysisSections(meta, replyText)
  const basicFeatures = []
  if (meta && meta.face) {
    if (meta.face.age !== undefined && meta.face.age !== null && meta.face.age !== '') {
      basicFeatures.push(`年龄：${meta.face.age}`)
    }
    if (meta.face.ageGroup) {
      basicFeatures.push(`年龄阶段：${meta.face.ageGroup}`)
    }
    if (meta.face.faceShape) {
      basicFeatures.push(`脸型：${meta.face.faceShape}`)
    }
    if (meta.face.dominantEmotion) {
      basicFeatures.push(`主导情绪：${meta.face.dominantEmotion}`)
    }
  }
  const emotionList = buildEmotionList(meta && meta.emotions)
  const finalReport = {
    title: '医美智能体',
    subtitle: '整体分析、局部说明和后续追问都会沿用当前图片结果展示。',
    basicFeatures: basicFeatures.filter(Boolean),
    emotionList,
    overallIntro,
    overallSections,
    summaryText
  }
  const originalImage = getOriginalFaceImage(meta)
  const overlayImage = getFaceOverlayImage(meta)
  const moleDetections = meta && meta.mole && Array.isArray(meta.mole.detections) ? meta.mole.detections.length : 0
  console.log('[mianzhenjieguo] buildReportFromApiPayload meta snapshot', {
    hasOriginalImage: !!originalImage,
    hasOverlayImage: !!overlayImage,
    moleDetections,
    faceKeypoints: meta && meta.face && Array.isArray(meta.face.keypoints) ? meta.face.keypoints.length : 0
  })
  return {
    report: finalReport,
    imageEchoList: buildImageEchoList(meta, originalImage),
    detailImageList: buildDetailImageList(meta, originalImage),
    visualDetailSections: buildVisualDetailSections(meta, originalImage),
    quickQuestions: buildQuickQuestions(meta),
    timingBreakdownText: buildTimingBreakdownText(payload),
    workflowSummaryText: buildWorkflowSummaryText(payload),
    overallSpeechText: buildOverallSpeechText(finalReport),
    displayImage: originalImage || overlayImage,
    hasImage: !!(originalImage || overlayImage)
  }
}

function wrapBase64Image(value) {
  if (!value || typeof value !== 'string') {
    return ''
  }
  const text = value.trim()
  if (/^https?:\/\//i.test(text) || /^wxfile:\/\//i.test(text)) {
    return text
  }
  if (/^data:image\/\w+;base64,/i.test(text)) {
    return text
  }
  if (/^[A-Za-z0-9+/=\s]+$/.test(text) && text.length > 120) {
    return `data:image/jpeg;base64,${text.replace(/\s+/g, '')}`
  }
  return ''
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizePreviewCardShape(card) {
  if (!card || typeof card !== 'object') {
    return null
  }
  return Object.assign({}, card, {
    refs: normalizeArray(card.refs),
    points: normalizeArray(card.points),
    boxes: normalizeArray(card.boxes)
  })
}

function normalizeFocusCardShape(card) {
  if (!card || typeof card !== 'object') {
    return null
  }
  return Object.assign({}, card, {
    refs: normalizeArray(card.refs),
    points: normalizeArray(card.points),
    boxes: normalizeArray(card.boxes)
  })
}

function normalizeDetailModalShape(detail) {
  const source = detail && typeof detail === 'object' ? detail : {}
  const blocks = normalizeArray(source.blocks).map(item => {
    const block = item && typeof item === 'object' ? item : {}
    return Object.assign({}, block, {
      images: normalizeArray(block.images).filter(Boolean),
      focusCards: normalizeArray(block.focusCards).map(normalizeFocusCardShape).filter(Boolean)
    })
  })
  return Object.assign({}, source, {
    previewCard: normalizePreviewCardShape(source.previewCard),
    previewFocus: normalizeFocusCardShape(source.previewFocus),
    focusCards: normalizeArray(source.focusCards).map(normalizeFocusCardShape).filter(Boolean),
    galleryImages: normalizeArray(source.galleryImages).filter(Boolean),
    focusImages: normalizeArray(source.focusImages).filter(Boolean),
    blocks
  })
}

function findImageValue(source, depth = 0) {
  if (!source || depth > 3) {
    return ''
  }
  if (typeof source === 'string') {
    return wrapBase64Image(source)
  }
  if (Array.isArray(source)) {
    for (let i = 0; i < source.length; i += 1) {
      const item = source[i]
      const found = findImageValue(item, depth + 1)
      if (found) {
        return found
      }
    }
    return ''
  }
  if (typeof source === 'object') {
    for (let i = 0; i < IMAGE_KEYS.length; i += 1) {
      const key = IMAGE_KEYS[i]
      const found = wrapBase64Image(source[key])
      if (found) {
        return found
      }
    }
    const sourceKeys = Object.keys(source)
    for (let i = 0; i < sourceKeys.length; i += 1) {
      const key = sourceKeys[i]
      const found = findImageValue(source[key], depth + 1)
      if (found) {
        return found
      }
    }
  }
  return ''
}

function unwrapPayload(rawResp) {
  let resData = safeParse(rawResp)
  if (!resData) {
    return null
  }
  let payload = resData.data || resData
  payload = safeParse(payload)
  if (payload && payload.Response) {
    payload = safeParse(payload.Response)
  }
  if (payload && payload.result) {
    payload = safeParse(payload.result)
  }
  if (payload && payload.data && typeof payload.data === 'object') {
    payload = payload.data
  }
  if (payload && payload.report && typeof payload.report === 'object') {
    payload = payload.report
  }
  return payload
}

function extractConversationId(payload) {
  const source = unwrapPayload(payload)
  return normalizeText(
    source && source.conversationId ||
    source && source.conversation && source.conversation.conversationId ||
    source && source.messageResponse && source.messageResponse.conversationId ||
    source && source.conversationSnapshot && source.conversationSnapshot.conversationId ||
    ''
  )
}

function extractAssistantReply(payload) {
  const source = unwrapPayload(payload)
  return normalizeText(
    source && source.reply ||
    source && source.messageResponse && source.messageResponse.reply ||
    source && source.content ||
    source && source.message ||
    source && source.meta && (source.meta.summary || source.meta.faceSummary) ||
    ''
  )
}

function formatDurationShort(ms) {
  const value = Number(ms || 0)
  if (!Number.isFinite(value) || value < 0) return ''
  if (value < 1000) return `${Math.round(value)}ms`
  if (value < 10000) return `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}s`
  return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}s`
}

function extractWorkflowPayload(source) {
  const payload = unwrapPayload(source)
  const workflow = payload && (
    payload.workflow ||
    payload.conversationSnapshot && payload.conversationSnapshot.workflow ||
    payload.conversation && payload.conversation.workflow
  )
  return workflow && workflow.payload && typeof workflow.payload === 'object'
    ? workflow.payload
    : workflow && typeof workflow === 'object' && workflow.timing
      ? workflow
      : null
}

function getStageDuration(payload, stageKey, timingKey) {
  const timingValue = Number(payload && payload.timing && payload.timing[timingKey])
  if (Number.isFinite(timingValue)) return Math.max(0, timingValue)
  const stages = payload && Array.isArray(payload.stages) ? payload.stages : []
  const stage = stages.find(item => String(item && item.key || '') === stageKey)
  const stageValue = Number(stage && stage.durationMs)
  return Number.isFinite(stageValue) ? Math.max(0, stageValue) : null
}

function buildTimingBreakdownText(source) {
  const payload = extractWorkflowPayload(source) || {}
  const timingItems = [
    ['缓存检查', getStageDuration(payload, 'cache_lookup', 'cacheLookupMs')],
    ['人脸分析', getStageDuration(payload, 'face_analysis', 'faceMs')],
    ['痣检测', getStageDuration(payload, 'mole_detection', 'moleMs')],
    ['Prompt 匹配', getStageDuration(payload, 'prompt_routing', 'promptRoutingMs')],
    ['知识检索', getStageDuration(payload, 'knowledge_retrieval', 'retrievalMs')],
    ['LLM 回复', getStageDuration(payload, 'llm_reply', 'replyMs')]
  ].filter(([, value]) => value !== null)
  const elapsed = Number(
    payload && payload.timing && payload.timing.totalMs ||
    payload && payload.totalMs ||
    payload && payload.elapsedMs ||
    payload && payload.elapsed ||
    0
  )
  if (!timingItems.length) {
    return elapsed > 0
      ? `耗时拆解：等待服务端阶段数据｜总耗时 ${formatDurationShort(elapsed)}`
      : DEFAULT_TIMING_TEXT
  }
  const parts = timingItems.map(([label, value]) => `${label} ${formatDurationShort(value)}`)
  if (elapsed > 0) {
    parts.push(`总耗时 ${formatDurationShort(elapsed)}`)
  }
  return `耗时拆解：${parts.join('｜')}`
}

function buildWorkflowSummaryText(source) {
  const payload = extractWorkflowPayload(source) || {}
  const stageLabel = normalizeText(payload.stageLabel || payload.stage || '')
  const stageMessage = normalizeText(payload.stageMessage || payload.summary || payload.thinkingSummary || payload.errorMessage || '')
  const pieces = []
  if (stageLabel) {
    pieces.push(`处理阶段：${stageLabel}`)
  }
  if (stageMessage) {
    pieces.push(stageMessage)
  }
  return pieces.length ? pieces.join('｜') : DEFAULT_WORKFLOW_TEXT
}

function createChatMessage(role, content, image) {
  chatMessageSeed += 1
  return {
    id: `chat_${Date.now()}_${chatMessageSeed}`,
    role,
    content: content || '',
    image: image || ''
  }
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, Math.max(0, Number(ms || 0)))
  })
}

function buildAssistantPayloadFromConversationSnapshot(snapshot, conversationId) {
  const messages = Array.isArray(snapshot && snapshot.messages) ? snapshot.messages : []
  let latestAssistant = null
  let latestStructuredAssistant = null
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const item = messages[index]
    if (item && item.role === 'assistant') {
      if (!latestAssistant) {
        latestAssistant = item
      }
      if (hasStructuredMeta(item.meta)) {
        latestStructuredAssistant = item
        break
      }
    }
  }
  latestAssistant = latestStructuredAssistant || latestAssistant
  if (!latestAssistant) {
    return {
      conversationId,
      reply: '本轮结果已生成，但暂未拉到最终详情，请稍后重试。',
      meta: {},
      followupQuestions: []
    }
  }
  const meta = latestAssistant.meta || {}
  return {
    conversation: {
      conversationId: snapshot && snapshot.conversationId || conversationId,
      title: snapshot && snapshot.title || ''
    },
    conversationSnapshot: snapshot,
    messageResponse: {
      conversationId: snapshot && snapshot.conversationId || conversationId,
      reply: latestAssistant.reply || latestAssistant.content || '',
      model: latestAssistant.model || latestAssistant.modelDisplayName || '',
      mode: latestAssistant.mode || '',
      message: latestAssistant.message || '',
      meta
    },
    meta,
    followupQuestions: Array.isArray(meta.followupQuestions) ? meta.followupQuestions : []
  }
}

function hasStructuredMeta(meta) {
  if (!meta || typeof meta !== 'object') {
    return false
  }
  return Boolean(
    meta.renderedImages ||
    meta.face ||
    meta.mole ||
    meta.appearance ||
    Array.isArray(meta.analysisSections) && meta.analysisSections.length
  )
}

Page({
  data: {
    report: DEFAULT_REPORT,
    conversationId: '',
    displayImage: '',
    hasImage: false,
    imageLabel: '面诊照片',
    imageHint: '可点击查看大图',
    chatMessages: [],
    draftText: '',
    pendingImage: '',
    canSendChat: false,
    imageEchoList: [],
    imageEchoScrollLeft: 0,
    detailImageList: [],
    visualDetailSections: [],
    showVisualDrilldown: false,
    activeDetailImageIndex: 0,
    showDetailModal: false,
    currentDetail: null,
    showFocusPreview: false,
    focusPreviewCard: null,
    overallSpeechText: buildOverallSpeechText(DEFAULT_REPORT),
    timingBreakdownText: DEFAULT_TIMING_TEXT,
    workflowSummaryText: DEFAULT_WORKFLOW_TEXT,
    speakingOverall: false,
    sendingChat: false,
    quickQuestions: [
      '如果只考虑整形方向，我应该优先面诊哪几个部位？',
      '结合这次痣的结果，我现在更适合继续观察，还是尽快去医院检查？',
      '你可以继续帮我细讲这次最值得优先关注的一个问题吗？'
    ],
    pageScrollTop: 0,
    scrollIntoView: ''
  },

  onLoad() {
    this._imagePriority = 0
    this.setData({
      conversationId: normalizeText(wx.getStorageSync('miniappConversationId') || '')
    })
    this.loadFaceImage()
    this.loadReport()
  },

  onUnload() {
    this.stopSpeech()
  },

  applyDisplayImage(imageSource, priority, label, hint) {
    if (!imageSource || priority < this._imagePriority) {
      return
    }

    this._imagePriority = priority
    const nextData = {
      imageLabel: label,
      imageHint: hint
    }

    if (/^data:image\/\w+;base64,/i.test(imageSource)) {
      util.base64src(imageSource, filePath => {
        if (priority < this._imagePriority) {
          return
        }
        this.setData(Object.assign({}, nextData, {
          displayImage: filePath,
          hasImage: true
        }))
      })
      return
    }

    this.setData(Object.assign({}, nextData, {
      displayImage: imageSource,
      hasImage: true
    }))
  },

  applyApiResult(result, callback) {
    if (!result || !result.report) {
      this.initChat(this.data.report)
      if (typeof callback === 'function') {
        callback()
      }
      return
    }
    this.setData({
      report: result.report,
      imageEchoList: result.imageEchoList,
      detailImageList: result.detailImageList,
      visualDetailSections: result.visualDetailSections || [],
      quickQuestions: result.quickQuestions || this.data.quickQuestions,
      timingBreakdownText: result.timingBreakdownText || DEFAULT_TIMING_TEXT,
      workflowSummaryText: result.workflowSummaryText || DEFAULT_WORKFLOW_TEXT,
      overallSpeechText: result.overallSpeechText,
      activeDetailImageIndex: 0,
      currentDetail: null,
      showDetailModal: false,
      showVisualDrilldown: false,
      showFocusPreview: false,
      focusPreviewCard: null
    }, () => {
      if (result.displayImage) {
        this.applyDisplayImage(result.displayImage, 2, '接口结果图', '接口返回的总览图')
      }
      this.hydrateImageLists()
      this.ensureMoleFocusCardsReady()
      this.initChat(result.report)
      if (typeof callback === 'function') {
        callback()
      }
    })
  },

  getLastMetaPayload() {
    const payload = this._lastPayload
    if (!payload || typeof payload !== 'object') {
      return null
    }
    return payload.meta || payload.messageResponse && payload.messageResponse.meta || payload
  },

  getImageInfoSafe(src) {
    const source = normalizeText(src)
    if (!source) {
      return Promise.resolve(null)
    }
    return new Promise(resolve => {
      wx.getImageInfo({
        src: source,
        success(res) {
          resolve(res || null)
        },
        fail() {
          resolve(null)
        }
      })
    })
  },

  ensureMoleFocusCardsReady() {
    const sections = Array.isArray(this.data.visualDetailSections) ? this.data.visualDetailSections : []
    const moleSectionIndex = sections.findIndex(item => item && item.key === 'mole')
    if (moleSectionIndex < 0) {
      return Promise.resolve(false)
    }
    const moleSection = sections[moleSectionIndex]
    if (moleSection && Array.isArray(moleSection.focusCards) && moleSection.focusCards.length) {
      return Promise.resolve(true)
    }

    const meta = this.getLastMetaPayload()
    const source = normalizeText(
      moleSection && moleSection.previewCard && moleSection.previewCard.source ||
      moleSection && moleSection.src ||
      getOriginalFaceImage(meta) ||
      ''
    )
    const detections = collectMoleDetectionCandidates(meta)
    const previewCard = moleSection && moleSection.previewCard ? Object.assign({}, moleSection.previewCard) : null
    const previewFallbackCards = buildMoleFocusCardsFromPreviewCard(previewCard)
    if (!source && !previewFallbackCards.length) {
      return Promise.resolve(false)
    }

    const previewWidth = Number(previewCard && previewCard.width || 0)
    const previewHeight = Number(previewCard && previewCard.height || 0)
    const faceSize = meta && meta.face && meta.face.imageSize && typeof meta.face.imageSize === 'object'
      ? meta.face.imageSize
      : {}
    const moleSize = meta && meta.mole && meta.mole.imageSize && typeof meta.mole.imageSize === 'object'
      ? meta.mole.imageSize
      : {}

    return this.getImageInfoSafe(source).then(info => {
      const width = Number(
        previewWidth ||
        info && info.width ||
        moleSize.width ||
        faceSize.width ||
        0
      )
      const height = Number(
        previewHeight ||
        info && info.height ||
        moleSize.height ||
        faceSize.height ||
        0
      )
      const localCards = buildMoleFocusCardsFromDetections(source, width, height, detections)
      const fallbackCards = !localCards.length && previewFallbackCards.length
        ? buildMoleFocusCardsFromPreviewCard(Object.assign({}, previewCard || {}, {
            source: source || previewCard && previewCard.source || '',
            width: width || previewWidth,
            height: height || previewHeight
          }))
        : []
      const finalCards = localCards.length ? localCards : fallbackCards
      console.log('[mianzhenjieguo] ensureMoleFocusCardsReady', {
        hasSource: !!source,
        detectionCount: detections.length,
        previewFallbackCount: previewFallbackCards.length,
        width,
        height,
        finalFocusCardCount: finalCards.length
      })
      if (!finalCards.length) {
        return false
      }

      const nextSections = JSON.parse(JSON.stringify(sections))
      const nextMoleSection = nextSections[moleSectionIndex] || {}
      nextMoleSection.focusCards = finalCards
      if (Array.isArray(nextMoleSection.focusCards) && nextMoleSection.focusCards.length) {
        nextMoleSection.note = `这张图用于查看痣目标命中位置；下方 ${nextMoleSection.focusCards.length} 张局部图已准备好，可继续查看局部命中区域。`
      }
      nextSections[moleSectionIndex] = nextMoleSection

      this.setData({
        visualDetailSections: nextSections,
        detailImageList: this.data.detailImageList
      })
      return true
    })
  },

  hydrateImageLists() {
    const hydrateBase64Field = (target, field, pending) => {
      if (!target || !/^data:image\/\w+;base64,/i.test(target[field] || '')) {
        return
      }
      pending.push(new Promise(resolve => {
        util.base64src(target[field], filePath => {
          target[field] = filePath
          resolve()
        })
      }))
    }
    ;['imageEchoList', 'detailImageList', 'visualDetailSections'].forEach(key => {
      const list = this.data[key] || []
      const nextList = JSON.parse(JSON.stringify(list))
      const pending = []
      nextList.forEach((item, index) => {
        hydrateBase64Field(item, 'image', pending)
        hydrateBase64Field(item, 'src', pending)
        hydrateBase64Field(item && item.previewCard, 'source', pending)
        hydrateBase64Field(item && item.previewFocus, 'source', pending)
        ;(item && item.galleryImages || []).forEach(card => {
          hydrateBase64Field(card, 'src', pending)
        })
        ;(item && item.focusImages || []).forEach(card => {
          hydrateBase64Field(card, 'src', pending)
        })
        ;(item && item.focusCards || []).forEach(card => {
          hydrateBase64Field(card, 'source', pending)
        })
        ;(item && item.blocks || []).forEach(block => {
          if (Array.isArray(block.images) && block.images.length) {
            block.images = block.images.map(image => {
              if (!/^data:image\/\w+;base64,/i.test(image || '')) {
                return image
              }
              const marker = { value: image }
              pending.push(new Promise(resolve => {
                util.base64src(marker.value, filePath => {
                  marker.value = filePath
                  resolve()
                })
              }))
              return marker
            })
          }
          ;(block.focusCards || []).forEach(card => {
            hydrateBase64Field(card, 'source', pending)
          })
        })
      })
      if (!pending.length) {
        return
      }
      Promise.all(pending).then(() => {
        nextList.forEach(item => {
          ;(item && item.blocks || []).forEach(block => {
            if (Array.isArray(block.images)) {
              block.images = block.images.map(image => image && typeof image === 'object' ? image.value : image)
            }
          })
        })
        this.setData({
          [key]: nextList
        }, () => {
          if (key === 'visualDetailSections' || key === 'detailImageList') {
            this.ensureMoleFocusCardsReady()
          }
        })
      })
    })
  },

  loadFaceImage() {
    const faceBase64 = wx.getStorageSync('faceBase64')
    const imageSource = wrapBase64Image(faceBase64)
    if (!imageSource) {
      return
    }
    this.applyDisplayImage(imageSource, 1, '原始照片', '未识别到后台标注图时显示')
  },

  loadReport() {
    const rawResp = util.loadJsonCache('rawApiResponse')
    const payload = unwrapPayload(rawResp)
    if (!payload) {
      if (this.data.conversationId) {
        this.loadReportFromConversation(this.data.conversationId)
        return
      }
      this.initChat(this.data.report)
      return
    }

    const conversationId = extractConversationId(payload)
    if (conversationId && conversationId !== this.data.conversationId) {
      this.setData({
        conversationId
      })
      wx.setStorageSync('miniappConversationId', conversationId)
    }

    if ((!payload.meta && !payload.messageResponse && !payload.face && !payload.mole && !payload.appearance) && conversationId) {
      this.loadReportFromConversation(conversationId)
      return
    }

    if (payload.meta || payload.messageResponse || payload.face || payload.mole || payload.appearance) {
      this._lastPayload = payload
      this.applyApiResult(buildReportFromApiPayload(payload))
      return
    }

    const payloadImage = findImageValue(payload)
    if (payloadImage) {
      this.applyDisplayImage(payloadImage, 2, '标注照片', '标注结果图')
    }

    const fallbackReply = extractAssistantReply(payload)
    const nextReport = {
      title: DEFAULT_REPORT.title,
      subtitle: DEFAULT_REPORT.subtitle,
      basicFeatures: [],
      emotionList: buildEmotionList(payload.emotions),
      overallIntro: fallbackReply || '本轮已拿到回复，但暂时没有解析到可结构化展示的分析结果。',
      overallSections: [],
      summaryText: fallbackReply
    }
    this.setData({
      report: nextReport,
      overallSpeechText: buildOverallSpeechText(nextReport)
    })
    this.initChat(nextReport)
  },

  loadReportFromConversation(conversationId) {
    if (!conversationId) {
      this.initChat(this.data.report)
      return
    }
    miniappOpenApi.getConversation(conversationId).then(snapshot => {
      const payload = buildAssistantPayloadFromConversationSnapshot(snapshot, conversationId)
      if (!payload || !(payload.messageResponse && payload.messageResponse.reply) && !hasStructuredMeta(payload.meta)) {
        this.initChat(this.data.report)
        return
      }
      this._lastPayload = payload
      this.applyApiResult(buildReportFromApiPayload(payload))
    }).catch(() => {
      this.initChat(this.data.report)
    })
  },

  toggleOverallSpeech() {
    if (this.data.speakingOverall) {
      this.stopSpeech()
      return
    }
    this.startSpeech(this.data.overallSpeechText || buildOverallSpeechText(this.data.report))
  },

  startSpeech(text) {
    const plugin = getTtsPlugin()
    const chunks = splitSpeechText(text)
    if (!plugin || !plugin.textToSpeech) {
      wx.showToast({
        title: '暂不支持朗读',
        icon: 'none'
      })
      return
    }
    if (!chunks.length) {
      wx.showToast({
        title: '暂无可朗读内容',
        icon: 'none'
      })
      return
    }

    this.stopSpeech()
    const speechToken = `${Date.now()}_${Math.random()}`
    this._speechToken = speechToken
    this._speechChunks = chunks
    this._speechIndex = 0
    this.setData({
      speakingOverall: true
    })
    this.playSpeechChunk(speechToken)
  },

  playSpeechChunk(speechToken) {
    const plugin = getTtsPlugin()
    const content = this._speechChunks[this._speechIndex]
    if (!plugin || !content || this._speechToken !== speechToken) {
      this.finishSpeech(speechToken)
      return
    }

    plugin.textToSpeech({
      lang: 'zh_CN',
      tts: true,
      content,
      success: res => {
        const filename = res && (res.filename || res.filePath || res.voiceUrl)
        if (!filename || this._speechToken !== speechToken) {
          this.finishSpeech(speechToken)
          return
        }
        this.playSpeechAudio(filename, speechToken)
      },
      fail: () => {
        if (this._speechToken === speechToken) {
          wx.showToast({
            title: '朗读生成失败',
            icon: 'none'
          })
        }
        this.finishSpeech(speechToken)
      }
    })
  },

  playSpeechAudio(filename, speechToken) {
    if (this._speechAudio) {
      this._speechAudio.destroy()
      this._speechAudio = null
    }
    const audio = wx.createInnerAudioContext()
    this._speechAudio = audio
    let finished = false
    audio.src = filename
    audio.onEnded(() => {
      finished = true
      audio.destroy()
      if (this._speechAudio === audio) {
        this._speechAudio = null
      }
      if (this._speechToken !== speechToken) {
        return
      }
      this._speechIndex += 1
      if (this._speechIndex < this._speechChunks.length) {
        this.playSpeechChunk(speechToken)
        return
      }
      this.finishSpeech(speechToken)
    })
    audio.onError(() => {
      if (finished || this._speechAudio !== audio) {
        return
      }
      audio.destroy()
      this._speechAudio = null
      if (this._speechToken === speechToken) {
        wx.showToast({
          title: '朗读播放失败',
          icon: 'none'
        })
      }
      this.finishSpeech(speechToken)
    })
    audio.play()
  },

  finishSpeech(speechToken) {
    if (this._speechToken && this._speechToken !== speechToken) {
      return
    }
    this._speechToken = ''
    this._speechChunks = []
    this._speechIndex = 0
    this._speechAudio = null
    this.setData({
      speakingOverall: false
    })
  },

  stopSpeech() {
    if (this._speechAudio) {
      this._speechAudio.stop()
      this._speechAudio.destroy()
      this._speechAudio = null
    }
    this._speechToken = ''
    this._speechChunks = []
    this._speechIndex = 0
    this.setData({
      speakingOverall: false
    })
  },

  previewImage() {
    if (!this.data.displayImage) {
      return
    }
    wx.previewImage({
      current: this.data.displayImage,
      urls: [this.data.displayImage]
    })
  },

  handleMainScroll(e) {
    this._mainScrollTop = Number(e && e.detail && e.detail.scrollTop || 0)
  },

  handleImageEchoTap(e) {
    const index = Number(e.currentTarget.dataset.index || 0)
    const item = (this.data.imageEchoList || [])[index]
    if (!item || !item.image) {
      return
    }
    const isClosingDrilldown = item.action === 'toggle-drilldown' && this.data.showVisualDrilldown
    const scrollTargetIndex = isClosingDrilldown ? 0 : index
    this.scrollImageEchoTo(scrollTargetIndex)
    if (item.action === 'toggle-drilldown') {
      const nextShow = !this.data.showVisualDrilldown
      this.setData({
        showVisualDrilldown: nextShow,
        scrollIntoView: nextShow ? '' : this.data.scrollIntoView
      }, () => {
        if (nextShow) {
          setTimeout(() => {
            this.scrollMainToImageEchoCard(index)
          }, 120)
        }
      })
      return
    }
    const urls = (this.data.imageEchoList || [])
      .filter(card => card && card.image && card.action !== 'toggle-drilldown')
      .map(card => card.image)
    wx.previewImage({
      current: item.image,
      urls: urls.length ? urls : [item.image]
    })
  },

  scrollImageEchoTo(index) {
    const sys = wx.getSystemInfoSync ? wx.getSystemInfoSync() : { windowWidth: 375 }
    const rpxToPx = Number(sys.windowWidth || 375) / 750
    const cardWidth = 520 * rpxToPx
    const gap = 18 * rpxToPx
    const sideInset = 16 * rpxToPx
    const targetLeft = Math.max(0, Math.round(index * (cardWidth + gap) - sideInset))
    this.setData({ imageEchoScrollLeft: targetLeft })
  },

  scrollMainToImageEchoCard(index) {
    const sys = wx.getSystemInfoSync ? wx.getSystemInfoSync() : { windowWidth: 375 }
    const targetTop = 200 * Number(sys.windowWidth || 375) / 750
    const query = wx.createSelectorQuery().in(this)
    query.select('#main-scroll').boundingClientRect()
    query.select(`#image-echo-card-${index}`).boundingClientRect()
    query.exec(res => {
      const scrollRect = res && res[0]
      const cardRect = res && res[1]
      if (!scrollRect || !cardRect) {
        return
      }
      const currentTop = Number(this._mainScrollTop || 0)
      const nextTop = Math.max(0, Math.round(currentTop + cardRect.top - scrollRect.top - targetTop))
      this.setData({
        scrollIntoView: '',
        pageScrollTop: nextTop
      })
    })
  },

  resolveMaybeBase64Image(value) {
    const source = normalizeText(value)
    if (!source || !/^data:image\/\w+;base64,/i.test(source)) {
      return Promise.resolve(source)
    }
    return new Promise(resolve => {
      util.base64src(source, filePath => {
        resolve(filePath || source)
      })
    })
  },

  prepareDetailModal(detail) {
    const nextDetail = normalizeDetailModalShape(JSON.parse(JSON.stringify(detail || {})))
    const tasks = []

    const queueField = (target, field) => {
      if (!target || !target[field]) {
        return
      }
      tasks.push(
        this.resolveMaybeBase64Image(target[field]).then(result => {
          target[field] = result || target[field]
        })
      )
    }

    queueField(nextDetail, 'image')
    queueField(nextDetail.previewCard, 'source')
    ;(Array.isArray(nextDetail.focusCards) ? nextDetail.focusCards : []).forEach(card => {
      queueField(card, 'source')
    })
    ;(Array.isArray(nextDetail.blocks) ? nextDetail.blocks : []).forEach(block => {
      ;(Array.isArray(block.focusCards) ? block.focusCards : []).forEach(card => {
        queueField(card, 'source')
      })
      ;(Array.isArray(block.images) ? block.images : []).forEach((image, index) => {
        if (!image) return
        tasks.push(
          this.resolveMaybeBase64Image(image).then(result => {
            block.images[index] = result || image
          })
        )
      })
    })

    return Promise.all(tasks).then(() => normalizeDetailModalShape(nextDetail))
  },

  previewVisualSectionImage(e) {
    const sectionIndex = Number(e.currentTarget.dataset.sectionIndex || 0)
    const imageIndex = Number(e.currentTarget.dataset.imageIndex || 0)
    const section = (this.data.visualDetailSections || [])[sectionIndex]
    console.log('[mianzhenjieguo] previewVisualSectionImage', {
      sectionIndex,
      imageIndex,
      sectionKey: section && section.key,
      hasSectionSrc: !!(section && section.src),
      hasPreviewCard: !!(section && section.previewCard)
    })
    if (!section || !section.src) {
      return
    }
    if (section.key === 'mole') {
      const detailImage = (this.data.detailImageList || []).find(item => item && item.title === '痣识别总图')
      const fallbackFocusCards = detailImage && Array.isArray(detailImage.blocks)
        ? detailImage.blocks.reduce((list, block) => list.concat(Array.isArray(block && block.focusCards) ? block.focusCards : []), [])
        : []
      const previewFallbackFocusCards = buildMoleFocusCardsFromPreviewCard(section.previewCard)
      const finalFocusCards = (section.focusCards && section.focusCards.length
        ? section.focusCards
        : fallbackFocusCards && fallbackFocusCards.length
          ? fallbackFocusCards
          : previewFallbackFocusCards) || []
      console.log('[mianzhenjieguo] preview mole section focus cards', {
        sectionFocusCards: section.focusCards && section.focusCards.length || 0,
        fallbackFocusCards: fallbackFocusCards && fallbackFocusCards.length || 0,
        previewFallbackFocusCards: previewFallbackFocusCards.length,
        finalFocusCards: finalFocusCards.length
      })
      if (!finalFocusCards.length) {
        const fallbackDetail = normalizeDetailModalShape({
          title: section.title,
          modalTitle: '痣识别图',
          modalIntro: '当前先展示痣识别总图的大图预览；如果后续检测框可用，这里会继续展示对应的痣局部放大图。',
          highlights: '',
          previewCard: section.previewCard || null,
          image: section.src,
          focusTitle: '痣识别局部放大图',
          focusCards: [],
          blocks: []
        })
        console.log('[mianzhenjieguo] open mole detail modal without focus cards', {
          hasImage: !!fallbackDetail.image,
          hasPreviewCard: !!fallbackDetail.previewCard
        })
        this.setData({
          currentDetail: fallbackDetail,
          showDetailModal: true,
          showFocusPreview: false,
          focusPreviewCard: null
        })
        return
      }
      this.prepareDetailModal({
        title: section.title,
        modalTitle: '痣识别图',
        modalIntro: '上方展示痣识别全图，下方展示痣局部放大图，便于继续观察边界、颜色和周边状态。',
        highlights: '',
        previewCard: section.previewCard || null,
        image: section.src,
        focusTitle: '痣识别局部放大图',
        focusCards: finalFocusCards,
        blocks: []
      }).then(detail => {
        const safeDetail = normalizeDetailModalShape(detail)
        console.log('[mianzhenjieguo] open mole detail modal', {
          hasImage: !!(safeDetail && safeDetail.image),
          hasPreviewCard: !!(safeDetail && safeDetail.previewCard),
          focusCards: safeDetail && safeDetail.focusCards && safeDetail.focusCards.length || 0
        })
        this.setData({
          currentDetail: safeDetail,
          showDetailModal: true,
          showFocusPreview: false,
          focusPreviewCard: null
        })
      }).catch(error => {
        console.warn('[mianzhenjieguo] prepareDetailModal failed for mole section', error)
        const fallbackDetail = normalizeDetailModalShape({
          title: section.title,
          modalTitle: '痣识别图',
          modalIntro: '上方展示痣识别全图，下方展示痣局部放大图，便于继续观察边界、颜色和周边状态。',
          previewCard: section.previewCard || null,
          image: section.src,
          focusTitle: '痣识别局部放大图',
          focusCards: finalFocusCards,
          blocks: []
        })
        this.setData({
          currentDetail: fallbackDetail,
          showDetailModal: true,
          showFocusPreview: false,
          focusPreviewCard: null
        })
      })
      return
    }
    if (section.key === 'aesthetic' && Array.isArray(section.focusCards) && section.focusCards.length) {
      this.prepareDetailModal({
        title: section.title,
        modalTitle: '美容局部图',
        modalIntro: '点击下面任意局部图，可继续放大查看对应数字点位和结构区域。',
        highlights: '',
        previewCard: section.previewCard || null,
        image: section.src,
        focusTitle: '医美建议联动局部图',
        focusCards: section.focusCards || [],
        blocks: []
      }).then(detail => {
        const safeDetail = normalizeDetailModalShape(detail)
        this.setData({
          currentDetail: safeDetail,
          showDetailModal: true,
          showFocusPreview: false,
          focusPreviewCard: null
        })
      })
      return
    }
    const gallery = Array.isArray(section.galleryImages) && section.galleryImages.length
      ? section.galleryImages
      : [{ title: section.title, src: section.src, note: section.note }]
    const urls = gallery.map(item => item && item.src).filter(Boolean)
    const current = urls[Math.max(0, Math.min(imageIndex, urls.length - 1))] || section.src
    wx.previewImage({
      current,
      urls: urls.length ? urls : [section.src]
    })
  },

  selectDetailImage(e) {
    const index = Number(e.currentTarget.dataset.index || 0)
    const detail = Object.assign({}, DETAIL_MODAL_MAP[index] || {}, this.data.detailImageList[index])
    this.prepareDetailModal(detail).then(nextDetail => {
      const safeDetail = normalizeDetailModalShape(nextDetail)
      this.setData({
        activeDetailImageIndex: index,
        currentDetail: safeDetail,
        showDetailModal: true
      })
    })
  },

  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      showFocusPreview: false,
      focusPreviewCard: null
    })
  },

  previewVisualFocusCard(e) {
    const sectionIndex = Number(e.currentTarget.dataset.sectionIndex || 0)
    const focusIndex = Number(e.currentTarget.dataset.focusIndex || 0)
    const section = (this.data.visualDetailSections || [])[sectionIndex]
    const card = section && Array.isArray(section.focusCards) ? section.focusCards[focusIndex] : null
    if (!card || !card.source) {
      return
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: card
    })
  },

  previewDetailBlockFocusCard(e) {
    const blockIndex = Number(e.currentTarget.dataset.blockIndex || 0)
    const focusIndex = Number(e.currentTarget.dataset.focusIndex || 0)
    if (blockIndex < 0) {
      const card = this.data.currentDetail && Array.isArray(this.data.currentDetail.focusCards)
        ? this.data.currentDetail.focusCards[focusIndex]
        : null
      if (!card || !card.source) {
        return
      }
      this.setData({
        showFocusPreview: true,
        focusPreviewCard: card
      })
      return
    }
    const blocks = this.data.currentDetail && Array.isArray(this.data.currentDetail.blocks)
      ? this.data.currentDetail.blocks
      : []
    const block = blocks[blockIndex]
    const card = block && Array.isArray(block.focusCards) ? block.focusCards[focusIndex] : null
    if (!card || !card.source) {
      return
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: card
    })
  },

  closeFocusPreview() {
    this.setData({
      showFocusPreview: false,
      focusPreviewCard: null
    })
  },

  preventBubble() {},

  initChat(report) {
    if (this.data.chatMessages.length) {
      return
    }
    this.setData({
      chatMessages: [],
      scrollIntoView: ''
    })
  },

  onDraftInput(e) {
    const draftText = (e.detail.value || '').slice(0, 300)
    this.setData({
      draftText,
      canSendChat: !!(draftText.trim() || this.data.pendingImage)
    })
  },

  chooseChatImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: res => {
        const imagePath = (res.tempFilePaths && res.tempFilePaths[0]) || ''
        if (!imagePath) {
          return
        }
        this.setData({
          pendingImage: imagePath,
          canSendChat: true
        })
      }
    })
  },

  removePendingImage() {
    this.setData({
      pendingImage: '',
      canSendChat: !!this.data.draftText.trim()
    })
  },

  previewChatImage(e) {
    const url = e.currentTarget.dataset.url
    if (!url) {
      return
    }
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  sendChatMessage() {
    const text = (this.data.draftText || '').trim()
    const image = this.data.pendingImage || ''
    if (!text && !image) {
      wx.showToast({
        title: '请输入内容或上传图片',
        icon: 'none'
      })
      return
    }
    this.submitChatMessage(text, image)
  },

  askQuickQuestion(e) {
    const text = e.currentTarget.dataset.text || ''
    if (!text) {
      return
    }
    this.submitChatMessage(text, '')
  },

  readChatImagePayload(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: imagePath,
        encoding: 'base64',
        success: res => {
          const base64 = normalizeText(res && res.data)
          if (!base64) {
            reject(new Error('图片读取失败'))
            return
          }
          const fileName = /\.png$/i.test(imagePath)
            ? 'chat.png'
            : /\.webp$/i.test(imagePath)
              ? 'chat.webp'
              : 'chat.jpg'
          const mimeType = /\.png$/i.test(fileName)
            ? 'image/png'
            : /\.webp$/i.test(fileName)
              ? 'image/webp'
              : 'image/jpeg'
          resolve({
            filePath: imagePath,
            fileName,
            mimeType,
            dataUrl: miniappOpenApi.normalizeImageDataUrl(base64, mimeType)
          })
        },
        fail(err) {
          reject(err)
        }
      })
    })
  },

  commitServerPayload(rawResponse, done) {
    const payload = unwrapPayload(rawResponse)
    if (!payload) {
      if (typeof done === 'function') {
        done({
          payload: null,
          reply: ''
        })
      }
      return
    }
    try {
      util.saveJsonCache('rawApiResponse', rawResponse)
    } catch (e) {
      console.warn('[mianzhenjieguo] persist rawApiResponse file cache failed:', e)
    }
    const conversationId = extractConversationId(payload)
    if (conversationId) {
      this.setData({
        conversationId
      })
      wx.setStorageSync('miniappConversationId', conversationId)
    }
    const finish = () => {
      if (typeof done === 'function') {
        done({
          payload,
          reply: extractAssistantReply(payload)
        })
      }
    }
    const hasStructuredAnalysis = Boolean(
      payload && (
        payload.face ||
        payload.mole ||
        payload.appearance ||
        payload.meta && (
          Array.isArray(payload.meta.analysisSections) && payload.meta.analysisSections.length ||
          payload.meta.renderedImages ||
          payload.meta.face ||
          payload.meta.mole ||
          payload.meta.appearance
        )
      )
    )
    if (hasStructuredAnalysis) {
      this._lastPayload = payload
      this.applyApiResult(buildReportFromApiPayload(payload), finish)
      return
    }
    finish()
  },

  fetchLatestAssistantPayload(conversationId, options) {
    if (!conversationId) {
      return Promise.resolve(null)
    }
    const maxAttempts = Math.max(1, Number(options && options.maxAttempts || 4))
    const intervalMs = Math.max(200, Number(options && options.intervalMs || 900))
    let lastPayload = null
    const attempt = (count) => {
      return miniappOpenApi.getConversation(conversationId).then(snapshot => {
        const payload = buildAssistantPayloadFromConversationSnapshot(snapshot, conversationId)
        lastPayload = payload
        const reply = normalizeText(payload && payload.messageResponse && payload.messageResponse.reply || payload && payload.reply || '')
        const hasStructured = hasStructuredMeta(payload && payload.meta)
        if (reply || hasStructured || count >= maxAttempts) {
          return payload
        }
        return delay(intervalMs).then(() => attempt(count + 1))
      }).catch(error => {
        if (count >= maxAttempts) {
          if (lastPayload) {
            return lastPayload
          }
          throw error
        }
        return delay(intervalMs).then(() => attempt(count + 1))
      })
    }
    return attempt(1)
  },

  submitChatMessage(text, image) {
    if (this.data.sendingChat) {
      return
    }
    const nextMessages = this.data.chatMessages.concat([
      createChatMessage('user', text, image)
    ])
    this.setData({
      chatMessages: nextMessages,
      draftText: '',
      pendingImage: '',
      canSendChat: false,
      sendingChat: true
    }, () => {
      this.scrollChatToBottom()
      // wx.showLoading({
      //   title: 'AI思考中...',
      //   mask: true
      // })

      const requestTask = image
        ? this.readChatImagePayload(image).then(imagePayload => {
          wx.setStorageSync('faceImagePath', imagePayload.filePath)
          const base64Body = String(imagePayload.dataUrl || '').replace(/^data:image\/\w+;base64,/i, '')
          if (base64Body) {
            wx.setStorageSync('faceBase64', base64Body)
          } else {
            wx.removeStorageSync('faceBase64')
          }
          return getLocalFileSize(imagePayload.filePath).then(() => {
            const nextConversationTask = this.data.conversationId
              ? Promise.resolve(this.data.conversationId)
              : miniappOpenApi.createConversation({
                title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE
              }).then(result => {
                const nextConversationId = normalizeText(result && result.conversationId)
                if (nextConversationId) {
                  this.setData({
                    conversationId: nextConversationId
                  })
                  wx.setStorageSync('miniappConversationId', nextConversationId)
                }
                return nextConversationId
              })
            return nextConversationTask.then(conversationId => {
              if (!conversationId) {
                throw new Error('会话创建失败，请稍后重试')
              }
              return miniappOpenApi.uploadAnalyzeFile({
                filePath: imagePayload.filePath,
                fileName: imagePayload.fileName,
                formData: {
                  conversationId,
                  title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE,
                  message: text || '请结合新图片继续分析',
                  workflow: 'chat'
                }
              })
            })
          })
        })
        : (this.data.conversationId
          ? Promise.resolve(this.data.conversationId)
          : miniappOpenApi.createConversation({
            title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE
          }).then(result => {
            const nextConversationId = normalizeText(result && result.conversationId)
            if (nextConversationId) {
              this.setData({
                conversationId: nextConversationId
              })
              wx.setStorageSync('miniappConversationId', nextConversationId)
            }
            return nextConversationId
          }))
          .then(conversationId => {
            if (!conversationId) {
              throw new Error('会话创建失败，请稍后重试')
            }
            return miniappOpenApi.sendMessage(conversationId, {
              message: text,
              clientMessageId: `mp_${Date.now()}`,
              autoFillImageContext: true
            })
          })

      requestTask.then(response => {
        if (image) {
          util.clearJsonCache('rawApiResponse')
        }
        const initialConversationId = normalizeText(
          extractConversationId(unwrapPayload(response)) ||
          this.data.conversationId
        )
        const payloadTask = image
          ? Promise.resolve(response)
          : this.fetchLatestAssistantPayload(initialConversationId).then(latestPayload => latestPayload || response)

        return payloadTask.then(finalPayload => {
          this.commitServerPayload(finalPayload, ({ reply }) => {
            const assistantReply = reply || '本轮已成功返回，但暂未拿到可展示的文本回复。'
            this.setData({
              chatMessages: this.data.chatMessages.concat([
                createChatMessage('assistant', assistantReply)
              ])
            }, () => this.scrollChatToBottom())
          })
        })
      }).catch(error => {
        const failText = `本轮请求失败：${error.message || '请稍后重试'}`
        this.setData({
          chatMessages: this.data.chatMessages.concat([
            createChatMessage('assistant', failText)
          ])
        }, () => this.scrollChatToBottom())
      }).finally(() => {
        wx.hideLoading()
        this.setData({
          sendingChat: false,
          canSendChat: !!(this.data.draftText.trim() || this.data.pendingImage)
        })
      })
    })
  },

  scrollChatToBottom() {
    const list = this.data.chatMessages || []
    const last = list[list.length - 1]
    if (!last) {
      return
    }
    this.setData({
      scrollIntoView: `msg-${last.id}`
    })
  }
})
