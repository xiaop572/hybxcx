const { req } = require('../../utils/request')
const util = require('../../utils/util')

const DEFAULT_REPORT = {
  title: 'AI面相分析结果',
  subtitle: '识别人脸特征后生成基础分析、情绪分布和趣味解读',
  basicFeatures: [],
  emotionList: [],
  focusPoints: [],
  moleParagraphs: [],
  moleFunParagraphs: [],
  medicalAdvice: [],
  fortuneList: [],
  followUpParagraphs: [],
  stageSections: [],
  entertainmentSections: [],
  entertainmentNotice: '仅供娱乐参考，不构成医疗、法律或投资建议。',
  funParagraphs: ['暂未解析到娱乐向解读内容'],
  funInterpretation: '暂未解析到娱乐向解读内容',
  analysisResultSections: [],
  previewRequestText: '原始诉求：帮我分析我的面相',
  previewHintText: '已收起详细结果，可展开查看五段分析结论、医学建议、娱乐知识和辅助图。',
  summaryParagraphs: ['暂未解析到总结性话语'],
  summaryText: '暂未解析到总结性话语'
}

const IMAGE_KEYS = [
  'annotated_image', 'annotatedImage', 'processed_image', 'processedImage',
  'result_image', 'resultImage', 'analysis_image', 'analysisImage',
  'face_image', 'faceImage', 'image_url', 'imageUrl', 'image', 'img', 'photo',
  'picurl', 'picUrl', 'markedImage', 'marked_image', 'overallMarkedImage',
  'overall_marked_image', 'moleImage', 'mole_image', 'moleLocalImage',
  'mole_local_image', 'hitImage', 'hit_image', 'cropImage', 'crop_image',
  'landmarkImage', 'landmark_image', 'landmarkOverlayImage', 'landmark_overlay_image'
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
    return value
      .replace(/`r`n/g, '\n')
      .replace(/`n/g, '\n')
      .replace(/\\r\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
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
  const partText = extractPartEntries(payload)
    .map(item => `${item.key}：${item.text}`)
    .filter(Boolean)
  const directText = [
    payload.report_text,
    payload.reportText,
    payload.content,
    payload.analysis,
    payload.result,
    payload.text,
    payload.msg
  ].map(item => normalizeText(item)).filter(Boolean).concat(partText)
  if (directText.length) {
    return directText.join('\n')
  }
  return normalizeText(payload)
}

function extractPartEntries(payload) {
  const partMap = extractPartMap(payload)
  const keys = Object.keys(partMap)
  keys.sort((a, b) => {
    const parseKey = key => key.toLowerCase().replace(/^part/, '').split(/[._]/).map(num => parseInt(num, 10) || 0)
    const an = parseKey(a)
    const bn = parseKey(b)
    const len = Math.max(an.length, bn.length)
    for (let i = 0; i < len; i++) {
      const av = an[i] || 0
      const bv = bn[i] || 0
      if (av !== bv) {
        return av - bv
      }
    }
    return 0
  })
  return keys.map(key => ({
    key,
    text: normalizeText(partMap[key])
  })).filter(item => item.text)
}

function extractPartMap(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }
  const partMap = {}
  const maybeSet = (key, value) => {
    if (!key || value === undefined || value === null) {
      return
    }
    if (!/^part\d+(?:[._]\d+)?$/i.test(key)) {
      return
    }
    const text = normalizeText(value)
    if (text) {
      partMap[key.toLowerCase()] = text
    }
  }

  Object.keys(payload).forEach(key => {
    const value = payload[key]
    maybeSet(key, value)

    // Support nested format like: part8: { part8.1: '...', part8_2: '...' }
    if (/^part\d+$/i.test(key) && value && typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach(subKey => {
        maybeSet(subKey, value[subKey])
      })
    }
  })
  return partMap
}

function getPartValue(partMap, index, subIndex) {
  if (!partMap) {
    return ''
  }
  const keyList = subIndex === undefined
    ? [`part${index}`]
    : [`part${index}_${subIndex}`, `part${index}.${subIndex}`]
  for (const key of keyList) {
    const value = normalizeText(partMap[key.toLowerCase()])
    if (value) {
      return value
    }
  }
  return ''
}

function hasAnalysisContent(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false
  }
  const keys = Object.keys(payload)
  if (!keys.length) {
    return false
  }
  if (keys.some(key => /^part\d+(?:[._]\d+)?$/i.test(key))) {
    return true
  }
  if (keys.some(key => /^part\d+$/i.test(key) && payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key]) && Object.keys(payload[key]).some(subKey => /^part\d+(?:[._]\d+)?$/i.test(subKey)))) {
    return true
  }
  return keys.some(key => [
      'report_text', 'reportText', 'content', 'analysis', 'result', 'text', 'msg',
      'basicFeatures', 'entertainment', 'summary', 'stageAnalysis', 'stage_analysis'
    ].includes(key))
}

function parseSectionTitleAndContent(text, fallbackTitle) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return null
  }
  const firstLine = normalized.split('\n')[0].trim()
  const match = firstLine.match(/^([^：:\n]{2,18})[：:]\s*(.*)$/)
  if (match) {
    const title = match[1].trim()
    const firstContent = match[2].trim()
    const restLines = normalized.split('\n').slice(1)
    const content = [firstContent].concat(restLines).filter(Boolean).join('\n')
    return {
      title: title || fallbackTitle,
      content: content || normalized
    }
  }
  return {
    title: fallbackTitle,
    content: normalized
  }
}

function buildPart8Title(key, fallbackTitle) {
  const titleMap = {
    '1': '总体结论',
    '2': '关键特征',
    '3': '娱乐解读',
    '4': '核心数据',
    '5': '性格标签',
    '6': '医美建议',
    '7': '运势建议',
    '8': '面部评估',
    '9': '辅助建议',
    '10': '参考图一',
    '11': '参考图二',
    '12': '后续优化'
  }
  const indexText = key.toLowerCase().replace(/^part8[._]?/, '')
  return titleMap[indexText] || fallbackTitle
}

function buildContentParagraphs(value) {
  return normalizeText(value)
    .split(/\n+|(?=\s*(?:\d+|[一二三四五六七八九十]+)[\.、])/)
    .map(item => item.replace(/^\s*(?:\d+|[一二三四五六七八九十]+)[\.、]\s*/, '').trim())
    .filter(Boolean)
}

function buildAnalysisResultSections(partMap) {
  if (!partMap) {
    return []
  }
  const keys = Object.keys(partMap)
    .filter(key => /^part8(?:[._]\d+)?$/i.test(key) && key.toLowerCase() !== 'part8')
    .sort((a, b) => {
      const parseKey = key => key.toLowerCase().replace(/^part8[._]?/, '').split(/[._]/).map(num => parseInt(num, 10) || 0)
      const an = parseKey(a)
      const bn = parseKey(b)
      const len = Math.max(an.length, bn.length)
      for (let i = 0; i < len; i++) {
        const av = an[i] || 0
        const bv = bn[i] || 0
        if (av !== bv) {
          return av - bv
        }
      }
      return 0
    })

  return keys.map((key, index) => {
    const text = normalizeText(partMap[key])
    if (!text) {
      return null
    }
    const fallbackTitle = buildPart8Title(key, `分析${index + 1}`)
    const imageUrl = wrapBase64Image(text)
    if (imageUrl) {
      return {
        title: fallbackTitle,
        content: '',
        paragraphs: [],
        imageUrl,
        isImage: true
      }
    }
    const parsed = parseSectionTitleAndContent(text, fallbackTitle)
    if (!parsed) {
      return null
    }
    return {
      title: parsed.title,
      content: parsed.content,
      paragraphs: buildContentParagraphs(parsed.content),
      imageUrl: '',
      isImage: false
    }
  }).filter(Boolean)
}

function toParagraphList(value) {
  return normalizeText(value)
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean)
}

function splitLines(value) {
  return normalizeText(value)
    .split(/\n+/)
    .map(item => item.replace(/^[\s\-*•·]+/, '').trim())
    .filter(Boolean)
}

function parseTitleMeta(line) {
  const text = (line || '').trim()
  const match = text.match(/^(.*?)(?:\s*[（(]([^()（）]+)[)）])?$/)
  return {
    title: (match && match[1] ? match[1] : text).trim(),
    meta: match && match[2] ? match[2].trim() : ''
  }
}

function getCanSendChat(text, imagePath) {
  return !!(normalizeText(text) && imagePath)
}

function looksLikeStructuredTitle(line) {
  return /[（(].+[)）]/.test(line) || /^[一二三四五六七八九十\d]+[\.、]/.test(line)
}

function extractSection(text, titles) {
  if (!text) {
    return ''
  }
  const titleList = Array.isArray(titles) ? titles : [titles]
  const allTitles = [
    '关键特征', '面部关注点', '痣识别', '医美建议', '运势建议', '五段分析结论',
    '识别判断', '治疗方案', '生活建议', '治疗处方', '预测建议',
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
  const rootPayload = resData
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
  if (!hasAnalysisContent(payload) && hasAnalysisContent(rootPayload)) {
    return rootPayload
  }
  if (payload && typeof payload === 'object' && rootPayload && typeof rootPayload === 'object') {
    return Object.assign({}, rootPayload, payload)
  }
  return payload
}

function buildEntertainmentSections(entertainment) {
  const labelMap = {
    personalityLabel: '人格标签',
    personality: '人格标签',
    personalityTag: '人格标签',
    relationshipAdvice: '关系建议',
    relationship: '关系建议',
    careerTendency: '事业倾向',
    careerAdvice: '事业倾向',
    healthTips: '健康提示',
    healthAdvice: '健康提示',
    fortuneAdvice: '运势建议',
    fortuneTips: '运势建议'
  }
  const sectionDefs = [
    { key: 'personalityLabel', title: '人格标签' },
    { key: 'personality', title: '人格标签' },
    { key: 'relationshipAdvice', title: '关系建议' },
    { key: 'relationship', title: '关系建议' },
    { key: 'careerTendency', title: '事业倾向' },
    { key: 'careerAdvice', title: '事业倾向' },
    { key: 'healthTips', title: '健康提示' },
    { key: 'healthAdvice', title: '健康提示' },
    { key: 'fortuneAdvice', title: '运势建议', isWide: true },
    { key: 'fortuneTips', title: '运势建议', isWide: true }
  ]

  if (!entertainment) {
    return []
  }
  if (typeof entertainment === 'object' && !Array.isArray(entertainment)) {
    return sectionDefs.map(def => {
      const content = normalizeText(entertainment[def.key])
      return content ? { title: def.title, content, isWide: !!def.isWide } : null
    }).filter(Boolean)
  }

  const text = normalizeText(entertainment)
  if (!text) {
    return []
  }
  return splitLines(text).map(line => {
    const match = line.match(/^(性格标签|人格标签|关系建议|事业倾向|健康提示|运势建议)[:：]\s*(.+)$/)
    if (!match) {
      return null
    }
    const title = match[1]
    return {
      title,
      content: match[2].trim(),
      isWide: title === '运势建议'
    }
  }).filter(Boolean)
}

function buildStageSections(value) {
  const titleMap = {
    judgement: '识别判断',
    judgment: '识别判断',
    recognition: '识别判断',
    recognitionResult: '识别判断',
    treatmentPlan: '治疗方案',
    plan: '治疗方案',
    lifeAdvice: '生活建议',
    lifestyleAdvice: '生活建议',
    prescription: '治疗处方',
    treatmentPrescription: '治疗处方',
    predictionAdvice: '预测建议',
    prediction: '预测建议'
  }
  const orderedTitles = ['识别判断', '治疗方案', '生活建议', '治疗处方', '预测建议']

  if (!value) {
    return []
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const objectSections = orderedTitles.map(title => {
      const matchedKey = Object.keys(value).find(key => titleMap[key] === title || key === title)
      if (!matchedKey) {
        return null
      }
      const content = normalizeText(value[matchedKey])
      return content ? { title, content } : null
    }).filter(Boolean)
    if (objectSections.length) {
      return objectSections
    }
  }

  const titleSet = {
    '识别判断': true,
    '治疗方案': true,
    '生活建议': true,
    '治疗处方': true,
    '预测建议': true
  }
  const lines = splitLines(value)
  const sections = []
  let current = null

  lines.forEach(line => {
    if (titleSet[line]) {
      if (current && current.content) {
        sections.push(current)
      }
      current = { title: line, content: '' }
      return
    }
    if (!current) {
      return
    }
    current.content += `${current.content ? '\n' : ''}${line}`
  })

  if (current && current.content) {
    sections.push(current)
  }

  return sections
}

function buildFocusPoints(value) {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        return { title: normalizeText(item), level: '', description: '', advice: '' }
      }
      return {
        title: normalizeText(item.title || item.name || item.label),
        level: normalizeText(item.level || item.priority),
        description: normalizeText(item.description || item.content || item.analysis),
        advice: normalizeText(item.advice || item.suggestion || item.tip)
      }
    }).filter(item => item.title)
  }

  const lines = splitLines(value)
  const items = []
  let current = null

  const pushCurrent = () => {
    if (!current || !current.title) {
      return
    }
    items.push(current)
  }

  lines.forEach(line => {
    if (/^建议[:：]/.test(line)) {
      if (current) {
        current.advice = line.replace(/^建议[:：]\s*/, '')
      }
      return
    }
    if (/^(提示|说明)[:：]/.test(line)) {
      if (current) {
        current.tip = line.replace(/^(提示|说明)[:：]\s*/, '')
      }
      return
    }
    if (!current || looksLikeStructuredTitle(line)) {
      pushCurrent()
      const parsed = parseTitleMeta(line)
      current = {
        title: parsed.title,
        level: parsed.meta,
        description: '',
        advice: '',
        tip: ''
      }
      return
    }
    if (!current.description) {
      current.description = line
    } else {
      current.description += `\n${line}`
    }
  })

  pushCurrent()
  return items.filter(item => item.title)
}

function buildMedicalAdvice(value) {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.map(item => ({
      title: normalizeText(item.title || item.name || item.label),
      priority: normalizeText(item.priority || item.level),
      description: normalizeText(item.description || item.content || item.analysis),
      consult: normalizeText(item.consult || item.direction || item.consultation),
      tip: normalizeText(item.tip || item.notice || item.suggestion)
    })).filter(item => item.title)
  }

  const lines = splitLines(value)
  const items = []
  let current = null

  const pushCurrent = () => {
    if (!current || !current.title) {
      return
    }
    items.push(current)
  }

  lines.forEach(line => {
    if (/^可咨询方向[:：]/.test(line)) {
      if (current) {
        current.consult = line.replace(/^可咨询方向[:：]\s*/, '')
      }
      return
    }
    if (/^提示[:：]/.test(line)) {
      if (current) {
        current.tip = line.replace(/^提示[:：]\s*/, '')
      }
      return
    }
    if (!current || looksLikeStructuredTitle(line)) {
      pushCurrent()
      const parsed = parseTitleMeta(line)
      current = {
        title: parsed.title,
        priority: parsed.meta,
        description: '',
        consult: '',
        tip: ''
      }
      return
    }
    if (!current.description) {
      current.description = line
    } else {
      current.description += `\n${line}`
    }
  })

  pushCurrent()
  return items.filter(item => item.title)
}

function buildFortuneList(value) {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.map(item => normalizeText(item)).filter(Boolean)
  }
  if (typeof value === 'object') {
    return Object.keys(value).sort().map(key => normalizeText(value[key])).filter(Boolean)
  }
  return splitLines(value)
    .map(line => line.replace(/^\d+[\.、]\s*/, '').trim())
    .filter(Boolean)
}

function buildReportFromPayload(payload) {
  if (!payload) {
    return DEFAULT_REPORT
  }

  const partMap = extractPartMap(payload)
  const textPool = buildTextPool(payload)
  const analysisResultSections = buildAnalysisResultSections(partMap)
  const keyFeatureSource = pickFirst(payload, [
    'key_features', 'keyFeatures', '关键特征',
    'basic_features', 'basicFeatures', 'features', 'feature_list',
    'facial_features', 'face_features', 'traits', '基础特征', '基础分析'
  ]) || extractSection(textPool, ['关键特征', '基础特征', '基础分析', '五官特征'])
  const basicFeatures = formatBasicFeatures(
    keyFeatureSource
  )
  const stageSections = buildStageSections(
    pickFirst(payload, [
      'stage_analysis', 'stageAnalysis', 'five_stage_analysis', 'fiveStageAnalysis',
      'five_part_analysis', 'fivePartAnalysis', 'section_analysis', '五段分析结论'
    ]) || extractSection(textPool, ['五段分析结论'])
  )
  const stageSectionsFromParts = [
    { title: '识别判断', content: getPartValue(partMap, 1) },
    { title: '分段解读', content: getPartValue(partMap, 2) }
  ].filter(item => item.content)
  const finalStageSections = stageSections.length ? stageSections : stageSectionsFromParts
  const focusPoints = buildFocusPoints(
    pickFirst(payload, [
      'focus_points', 'focusPoints', 'face_focus_points', 'faceFocusPoints',
      'concern_points', 'concernPoints', 'face_concerns', 'faceConcerns', '面部关注点'
    ]) || extractSection(textPool, ['面部关注点']) || getPartValue(partMap, 5)
  )
  const moleParagraphs = toParagraphList(
    pickFirst(payload, [
      'mole_analysis', 'moleAnalysis', 'mole_result', 'moleResult',
      'mole_detection', 'moleDetection', 'mole_reading', 'moleReading', '痣识别'
    ]) || extractSection(textPool, ['痣识别'])
  )
  const medicalAdvice = buildMedicalAdvice(
    pickFirst(payload, [
      'medical_advice', 'medicalAdvice', 'beauty_advice', 'beautyAdvice',
      'cosmetic_advice', 'cosmeticAdvice', '医美建议'
    ]) || extractSection(textPool, ['医美建议']) || getPartValue(partMap, 6)
  )
  const moleFunParagraphs = toParagraphList(
    pickFirst(payload, [
      'mole_fun', 'moleFun', 'mole_entertainment', 'moleEntertainment',
      'mole_reading_fun', 'moleReadingFun', '痣相娱乐解读'
    ]) || extractSection(textPool, ['痣相娱乐解读']) || getPartValue(partMap, 3)
  )
  const fortuneList = buildFortuneList(
    pickFirst(payload, [
      'fortune_advice', 'fortuneAdvice', 'fortune_list', 'fortuneList',
      'fortune_suggestions', 'fortuneSuggestions', '运势建议'
    ]) || extractSection(textPool, ['运势建议'])
  )
  const followUpParagraphs = toParagraphList(
    pickFirst(payload, [
      'follow_up', 'followUp', 'follow_up_advice', 'followUpAdvice',
      'next_steps', 'nextSteps', '后续建议'
    ]) || extractSection(textPool, ['后续建议']) || getPartValue(partMap, 7)
  )
  const entertainmentSource = pickFirst(payload, [
    'entertainment', 'fun_interpretation', 'funInterpretation',
    'entertainment_analysis', 'entertainmentInterpretation',
    'fun_reading', 'funReading', 'interesting_analysis', 'interestingAnalysis',
    '娱乐向解读', '娱乐解读'
  ]) || extractSection(textPool, ['娱乐向解读', '娱乐解读', '趣味解读'])
    || getPartValue(partMap, 4)

  const funInterpretation = normalizeText(
    (typeof entertainmentSource === 'object' && !Array.isArray(entertainmentSource)
      ? buildEntertainmentText(entertainmentSource)
      : entertainmentSource)
  ) || DEFAULT_REPORT.funInterpretation

  const summaryText = normalizeText(
    pickFirst(payload, [
      'summary', 'overall_summary', 'overallSummary', 'overall_analysis',
      'conclusion', 'final_summary', 'finalSummary', 'summary_text', 'summaryText',
      '总结性话语', '总结'
    ]) || (payload.entertainment && payload.entertainment.summary)
      || getPartValue(partMap, 8)
      || extractSection(textPool, ['总结性话语', '总结', '总体总结', '整体结论', '识别判断'])
      || (finalStageSections[0] && finalStageSections[0].content)
  ) || DEFAULT_REPORT.summaryText

  return {
    title: normalizeText(pickFirst(payload, ['title', 'report_title', 'reportTitle', '标题'])) || DEFAULT_REPORT.title,
    subtitle: normalizeText(pickFirst(payload, ['subtitle', 'report_subtitle', 'reportSubtitle', '副标题'])) || DEFAULT_REPORT.subtitle,
    basicFeatures,
    emotionList: buildEmotionList(payload.emotions),
    focusPoints,
    moleParagraphs,
    moleFunParagraphs,
    medicalAdvice,
    fortuneList,
    followUpParagraphs,
    stageSections: finalStageSections,
    entertainmentSections: buildEntertainmentSections(entertainmentSource),
    entertainmentNotice: normalizeText(payload.entertainment && payload.entertainment.notice) || DEFAULT_REPORT.entertainmentNotice,
    funInterpretation,
    funParagraphs: toParagraphList(funInterpretation),
    analysisResultSections,
    previewRequestText: normalizeText(pickFirst(payload, ['original_request', 'originalRequest', 'question', 'prompt', 'user_input', 'userInput', 'query', 'demand', '原始诉求'])) || DEFAULT_REPORT.previewRequestText,
    previewHintText: DEFAULT_REPORT.previewHintText,
    summaryText,
    summaryParagraphs: toParagraphList(summaryText)
  }
}

let chatMessageSeed = 0

function createChatMessage(role, content, image, extra) {
  chatMessageSeed += 1
  return Object.assign({
    id: `chat_${Date.now()}_${chatMessageSeed}`,
    role,
    content: content || '',
    image: image || ''
  }, extra || {})
}

Page({
  data: {
    report: DEFAULT_REPORT,
    hasReport: false,
    displayImage: '',
    hasImage: false,
    imageLabel: '分析照片',
    imageHint: '可点击查看大图',
    chatMessages: [],
    draftText: '',
    pendingImage: '',
    pendingBase64: '',
    lastSex: '',
    canSendChat: false,
    scrollIntoView: '',
    isSubmitting: false,
    analysisResultExpanded: false
  },

  onLoad() {
    this._imagePriority = 0
    this.initChat()
  },

  initChat() {
    if (this.data.chatMessages.length) {
      return
    }
    this.setData({
      chatMessages: [
        createChatMessage('assistant', '你好，我是小慧AI面相分析助手。请先上传一张清晰正脸照，并在输入框填写性别，例如“男”或“女”。')
      ],
      scrollIntoView: ''
    })
  },

  chooseChatImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: res => {
        const imagePath = (res.tempFilePaths && res.tempFilePaths[0]) || ''
        if (!imagePath) {
          return
        }
        wx.getFileSystemManager().readFile({
          filePath: imagePath,
          encoding: 'base64',
          success: fileRes => {
            this.setData({
              pendingImage: imagePath,
              pendingBase64: fileRes.data,
              canSendChat: getCanSendChat(this.data.draftText, imagePath)
            })
          },
          fail: () => {
            wx.showToast({
              title: '读取图片失败',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  removePendingImage() {
    this.setData({
      pendingImage: '',
      pendingBase64: '',
      canSendChat: false
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

  onDraftInput(e) {
    const draftText = (e.detail.value || '').slice(0, 20)
    this.setData({
      draftText,
      canSendChat: getCanSendChat(draftText, this.data.pendingImage)
    })
  },

  sendChatMessage() {
    const base64 = this.data.pendingBase64
    const imagePath = this.data.pendingImage
    const sex = (this.data.draftText || '').trim()

    if (!base64) {
      wx.showToast({
        title: '请先上传照片',
        icon: 'none'
      })
      return
    }
    if (!sex) {
      wx.showToast({
        title: '请输入性别',
        icon: 'none'
      })
      return
    }
    if (this.data.isSubmitting) {
      return
    }

    const userMessage = createChatMessage('user', `性别：${sex}`, imagePath)
    const loadingMessage = createChatMessage('assistant', `已收到照片和性别“${sex}”，正在分析中，请稍候...`, '', { loading: true })

    this.setData({
      isSubmitting: true,
      report: DEFAULT_REPORT,
      hasReport: false,
      chatMessages: this.data.chatMessages.concat([userMessage, loadingMessage]),
      draftText: '',
      pendingImage: '',
      pendingBase64: '',
      lastSex: sex,
      canSendChat: false,
      imageLabel: '分析照片',
      imageHint: '分析完成后可查看大图',
      analysisResultExpanded: false
    }, () => {
      this.scrollChatToBottom()
    })

    this._imagePriority = 0
    this.applyDisplayImage(imagePath, 1, '上传照片', '你从相册选择的原图')

    req({
      url: util.baseUrl + '/newapi/api/topic/faceanalysissimple',
      method: 'POST',
      timeout: 60000,
      data: {
        base64,
        sex
      },
      success: res => {
        this.handleAnalysisSuccess(res.data, loadingMessage.id, sex, imagePath)
      },
      fail: () => {
        this.updateChatMessage(loadingMessage.id, {
          content: '分析失败了，请重新上传照片再试一次。',
          loading: false
        })
        this.setData({
          isSubmitting: false
        }, () => this.scrollChatToBottom())
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  handleAnalysisSuccess(rawResp, loadingMessageId, sex, imagePath) {
    const payload = unwrapPayload(rawResp)
    const nextReport = buildReportFromPayload(payload)
    const payloadImage = findImageValue(payload)

    this._imagePriority = 0
    if (imagePath) {
      this.applyDisplayImage(imagePath, 1, '上传照片', '你从相册选择的原图')
    }
    if (payloadImage) {
      this.applyDisplayImage(payloadImage, 2, '标注照片', '后台系统返回的标注结果图')
    }

    this.updateChatMessage(loadingMessageId, {
      content: sex ? `已根据你输入的性别“${sex}”完成分析，下面是结果。` : '分析完成了，下面是本次面相分析结果。',
      loading: false
    })

    this.setData({
      report: nextReport,
      hasReport: true,
      analysisResultExpanded: false,
      isSubmitting: false
    }, () => this.scrollChatToBottom())
  },

  toggleAnalysisResultExpand() {
    this.setData({
      analysisResultExpanded: !this.data.analysisResultExpanded
    })
  },

  updateChatMessage(messageId, patch) {
    const nextMessages = (this.data.chatMessages || []).map(item => {
      if (item.id !== messageId) {
        return item
      }
      return Object.assign({}, item, patch)
    })
    this.setData({
      chatMessages: nextMessages
    })
  },

  resetFlow() {
    this._imagePriority = 0
    this.setData({
      report: DEFAULT_REPORT,
      hasReport: false,
      displayImage: '',
      hasImage: false,
      imageLabel: '分析照片',
      imageHint: '可点击查看大图',
      draftText: '',
      pendingImage: '',
      pendingBase64: '',
      lastSex: '',
      canSendChat: false,
      isSubmitting: false,
      analysisResultExpanded: false,
      chatMessages: [
        createChatMessage('assistant', '你好，我是小慧AI面相分析助手。请先上传一张清晰正脸照，并在输入框填写性别，例如“男”或“女”。')
      ],
      scrollIntoView: ''
    })
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

  previewImage() {
    if (!this.data.displayImage) {
      return
    }
    wx.previewImage({
      current: this.data.displayImage,
      urls: [this.data.displayImage]
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
