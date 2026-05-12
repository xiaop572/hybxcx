// subpackagesC/mianzhenjieguo/mianzhenjieguo.js
const util = require('../../utils/util')
let chatMessageSeed = 0

const DEFAULT_REPORT = {
  title: '小慧AI面相分析',
  subtitle: '提取人脸物理特征(年龄、情绪、关键点、脸型)，再按自定义规则生成娱乐向面相解读。',
  basicFeatures: [],
  emotionList: [],
  entertainmentSections: [],
  entertainmentNotice: '仅供娱乐参考，不构成医疗、法律或投资建议。',
  funParagraphs: ['暂未解析到娱乐向解读内容'],
  funInterpretation: '暂未解析到娱乐向解读内容',
  summaryParagraphs: ['暂未解析到总结性话语'],
  summaryText: '暂未解析到总结性话语'
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

function pickFirst(obj, keys) {
  if (!obj || typeof obj !== 'object') {
    return ''
  }
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }
  return ''
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

function toFeatureList(value) {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.map(item => normalizeText(item)).filter(Boolean)
  }
  if (typeof value === 'object') {
    return Object.keys(value).map(key => {
      const text = normalizeText(value[key])
      return text ? `${key}：${text}` : ''
    }).filter(Boolean)
  }
  return normalizeText(value)
    .split(/\n|[；;。]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function formatBasicFeatures(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return toFeatureList(value)
  }
  const labelMap = {
    age: '年龄',
    gender: '性别',
    dominantEmotion: '主导情绪',
    faceShape: '脸型'
  }
  return Object.keys(value).map(key => {
    const text = normalizeText(value[key])
    if (!text) {
      return ''
    }
    return `${labelMap[key] || key}：${text}`
  }).filter(Boolean)
}

function buildEntertainmentText(entertainment) {
  if (!entertainment || typeof entertainment !== 'object' || Array.isArray(entertainment)) {
    return normalizeText(entertainment)
  }
  const labelMap = {
    personalityLabel: '人格标签',
    fortuneAdvice: '运势建议',
    careerTendency: '事业倾向',
    healthTips: '健康提示',
    relationshipAdvice: '关系建议',
    notice: '说明'
  }
  const preferredOrder = [
    'personalityLabel',
    'fortuneAdvice',
    'careerTendency',
    'healthTips',
    'relationshipAdvice',
    'notice'
  ]
  return preferredOrder.map(key => {
    const text = normalizeText(entertainment[key])
    if (!text) {
      return ''
    }
    return `${labelMap[key] || key}：${text}`
  }).filter(Boolean).join('\n')
}

function buildEntertainmentSections(entertainment) {
  if (!entertainment || typeof entertainment !== 'object' || Array.isArray(entertainment)) {
    return []
  }
  const sectionDefs = [
    { key: 'personalityLabel', title: '人格标签' },
    { key: 'relationshipAdvice', title: '关系建议' },
    { key: 'careerTendency', title: '事业倾向' },
    { key: 'healthTips', title: '健康提示' },
    { key: 'fortuneAdvice', title: '运势建议', isWide: true }
  ]
  return sectionDefs.map(def => {
    const content = normalizeText(entertainment[def.key])
    return content ? { title: def.title, content, isWide: !!def.isWide } : null
  }).filter(Boolean)
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

function buildTextPool(payload) {
  if (!payload) {
    return ''
  }
  if (typeof payload === 'string') {
    return payload
  }
  const directText = [
    payload.report_text,
    payload.reportText,
    payload.content,
    payload.analysis,
    payload.result,
    payload.text,
    payload.msg
  ].map(item => normalizeText(item)).filter(Boolean)
  if (directText.length) {
    return directText.join('\n')
  }
  return normalizeText(payload)
}

function toParagraphList(value) {
  return normalizeText(value)
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean)
}

function extractSection(text, titles) {
  if (!text) {
    return ''
  }
  const titleList = Array.isArray(titles) ? titles : [titles]
  const allTitles = [
    '基础特征', '基础分析', '五官特征',
    '娱乐向解读', '娱乐解读', '趣味解读',
    '总结性话语', '总结', '总体总结', '整体结论'
  ]
  for (const title of titleList) {
    const otherTitles = allTitles.filter(item => item !== title).join('|')
    const pattern = new RegExp(`(?:^|\\n)[#*\\-\\s【\\[]*${title}[】\\]：:]*\\s*([\\s\\S]*?)(?=(?:\\n[#*\\-\\s【\\[]*(?:${otherTitles})[】\\]：:]?)|$)`, 'i')
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return ''
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

function findImageValue(source, depth = 0) {
  if (!source || depth > 3) {
    return ''
  }
  if (typeof source === 'string') {
    return wrapBase64Image(source)
  }
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findImageValue(item, depth + 1)
      if (found) {
        return found
      }
    }
    return ''
  }
  if (typeof source === 'object') {
    for (const key of IMAGE_KEYS) {
      const found = wrapBase64Image(source[key])
      if (found) {
        return found
      }
    }
    for (const key of Object.keys(source)) {
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

function createChatMessage(role, content, image) {
  chatMessageSeed += 1
  return {
    id: `chat_${Date.now()}_${chatMessageSeed}`,
    role,
    content: content || '',
    image: image || ''
  }
}

Page({
  data: {
    report: DEFAULT_REPORT,
    displayImage: '',
    hasImage: false,
    imageLabel: '面诊照片',
    imageHint: '可点击查看大图',
    chatMessages: [],
    draftText: '',
    pendingImage: '',
    canSendChat: false,
    scrollIntoView: ''
  },

  onLoad() {
    this._imagePriority = 0
    this.loadFaceImage()
    this.loadReport()
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

  loadFaceImage() {
    const faceBase64 = wx.getStorageSync('faceBase64')
    const imageSource = wrapBase64Image(faceBase64)
    if (!imageSource) {
      return
    }
    this.applyDisplayImage(imageSource, 1, '原始照片', '未识别到后台标注图时显示')
  },

  loadReport() {
    const rawResp = wx.getStorageSync('rawApiResponse')
    const payload = unwrapPayload(rawResp)
    if (!payload) {
      this.initChat(this.data.report)
      return
    }

    const textPool = buildTextPool(payload)
    const basicFeatures = formatBasicFeatures(
      pickFirst(payload, [
        'basic_features', 'basicFeatures', 'features', 'feature_list',
        'facial_features', 'face_features', 'traits', 'key_features',
        '基础特征', '基础分析'
      ]) || extractSection(textPool, ['基础特征', '基础分析', '五官特征'])
    )

    const funInterpretation = normalizeText(
      pickFirst(payload, [
        'fun_interpretation', 'funInterpretation', 'entertainment_analysis',
        'entertainmentInterpretation', 'fun_reading', 'funReading',
        'interesting_analysis', 'interestingAnalysis', '娱乐向解读', '娱乐解读'
      ]) || buildEntertainmentText(payload.entertainment) || extractSection(textPool, ['娱乐向解读', '娱乐解读', '趣味解读'])
    ) || DEFAULT_REPORT.funInterpretation

    const summaryText = normalizeText(
      pickFirst(payload, [
        'summary', 'overall_summary', 'overallSummary', 'overall_analysis',
        'conclusion', 'final_summary', 'finalSummary', 'summary_text', 'summaryText',
        '总结性话语', '总结'
      ]) || (payload.entertainment && payload.entertainment.summary) || extractSection(textPool, ['总结性话语', '总结', '总体总结', '整体结论'])
    ) || DEFAULT_REPORT.summaryText

    const payloadImage = findImageValue(payload)
    if (payloadImage) {
      this.applyDisplayImage(payloadImage, 2, '标注照片', '标注结果图')
    }

    const finalBasicFeatures = basicFeatures.length ? basicFeatures : ['暂未解析到基础特征内容']
    const finalFunInterpretation = funInterpretation || DEFAULT_REPORT.funInterpretation
    const finalSummaryText = summaryText || DEFAULT_REPORT.summaryText
    const emotionList = buildEmotionList(payload.emotions)
    const entertainmentSections = buildEntertainmentSections(payload.entertainment)
    const entertainmentNotice = normalizeText(payload.entertainment && payload.entertainment.notice) || DEFAULT_REPORT.entertainmentNotice

    const nextReport = {
        title: normalizeText(pickFirst(payload, ['title', 'report_title', 'reportTitle', '标题'])) || DEFAULT_REPORT.title,
        subtitle: normalizeText(pickFirst(payload, ['subtitle', 'report_subtitle', 'reportSubtitle', '副标题'])) || DEFAULT_REPORT.subtitle,
        basicFeatures: finalBasicFeatures,
        emotionList,
        entertainmentSections,
        entertainmentNotice,
        funInterpretation: finalFunInterpretation,
        funParagraphs: toParagraphList(finalFunInterpretation),
        summaryText: finalSummaryText,
        summaryParagraphs: toParagraphList(finalSummaryText)
      }
    this.setData({
      report: nextReport
    })
    this.initChat(nextReport)
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

  initChat(report) {
    if (this.data.chatMessages.length) {
      return
    }
    const summary = report.summaryText || DEFAULT_REPORT.summaryText
    const welcome = '你好，我是小慧AI。你可以继续问我面相、情绪、关系、事业、健康，也可以上传新图片继续聊。'
    const intro = `先给你一个简要结论：${summary}`
    const chatMessages = [
      createChatMessage('assistant', welcome),
      createChatMessage('assistant', intro)
    ]
    this.setData({
      chatMessages,
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
      sizeType: ['compressed'],
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

    const nextMessages = this.data.chatMessages.concat([
      createChatMessage('user', text, image)
    ])
    this.setData({
      chatMessages: nextMessages,
      draftText: '',
      pendingImage: '',
      canSendChat: false
    }, () => {
      this.scrollChatToBottom()
      setTimeout(() => {
        const reply = this.buildAssistantReply(text, !!image)
        this.setData({
          chatMessages: this.data.chatMessages.concat([
            createChatMessage('assistant', reply)
          ])
        }, () => this.scrollChatToBottom())
      }, 380)
    })
  },

  buildAssistantReply(text, hasImage) {
    const report = this.data.report || DEFAULT_REPORT
    const keyword = (text || '').toLowerCase()
    const findSection = title => {
      const item = (report.entertainmentSections || []).find(section => section.title === title)
      return item ? item.content : ''
    }
    const topEmotion = (report.emotionList && report.emotionList[0]) || null

    if (hasImage && !text) {
      return '已收到你上传的图片。你可以继续输入想了解的方向，比如情绪、人格标签、关系建议、事业倾向或健康提示。'
    }
    if (keyword.includes('情绪')) {
      return topEmotion
        ? `当前最明显的情绪倾向是${topEmotion.label}，占比${topEmotion.value}。如果你想，我还可以继续结合整体结论帮你解读这种状态。`
        : '当前结果里没有更多情绪数据，你可以继续问我人格标签、关系建议或总结性话语。'
    }
    if (keyword.includes('人格') || keyword.includes('性格')) {
      return findSection('人格标签') || '当前结果里暂未解析到人格标签内容。'
    }
    if (keyword.includes('关系') || keyword.includes('感情')) {
      return findSection('关系建议') || '当前结果里暂未解析到关系建议内容。'
    }
    if (keyword.includes('事业') || keyword.includes('工作')) {
      return findSection('事业倾向') || '当前结果里暂未解析到事业倾向内容。'
    }
    if (keyword.includes('健康')) {
      return findSection('健康提示') || '当前结果里暂未解析到健康提示内容。'
    }
    if (keyword.includes('运势')) {
      return findSection('运势建议') || '当前结果里暂未解析到运势建议内容。'
    }
    if (keyword.includes('总结') || keyword.includes('结论')) {
      return report.summaryText || DEFAULT_REPORT.summaryText
    }
    if (hasImage && text) {
      return `我已经收到你的图片和问题“${text}”。结合当前结果来看，${report.summaryText || DEFAULT_REPORT.summaryText}`
    }
    return `${report.summaryText || DEFAULT_REPORT.summaryText} 你也可以继续追问我情绪、人格标签、关系建议、事业倾向或健康提示。`
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
