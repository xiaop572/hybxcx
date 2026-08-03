// subpageC/diagnosis/diagnosis.js
const util = require('../../utils/util')
const miniappOpenApi = require('../../utils/miniapp-open-api')
const {
  req
} = require('../../utils/request')

const DIAGNOSIS_CONVERSATION_KEY = 'miniappDiagnosisConversationId'
const ANALYZE_POLL_INTERVAL_MS = 1600
const ANALYZE_POLL_LIMIT = 160
const CONVERSATION_CHECK_TIMEOUT_MS = 6000
const HISTORY_RESTORE_TIMEOUT_MS = 300000
const HISTORY_RESTORE_MESSAGE_LIMIT = 12
const REPORT_SECTION_TITLES = ['识别判断', '治疗方案', '生活建议', '预测建议']
const H5_SECTION_TITLES = ['1.识别判断', '2.治疗方案(详情请看下面的说明图)', '3.生活建议', '4.预测建议']
const DEFAULT_MOLE_FOCUS_NOTE = '问题：这处疑似色素痣需要继续关注边界、颜色和后续变化情况。解决：建议先做专业皮肤检测和面诊评估，再根据实际边界、深浅和位置选择更合适的处理方式。'
const IMAGE_KEYS = [
  'annotated_image', 'annotatedImage', 'processed_image', 'processedImage',
  'result_image', 'resultImage', 'analysis_image', 'analysisImage',
  'face_image', 'faceImage', 'image_url', 'imageUrl', 'image', 'img', 'photo',
  'picurl', 'picUrl', 'dataUrl', 'imageBase64', 'overlayImageBase64', 'base64',
  'url', 'src', 'source', 'sourceImageBase64', 'originalImageBase64'
]

function coalesce() {
  for (let i = 0; i < arguments.length; i += 1) {
    const text = String(arguments[i] === undefined || arguments[i] === null ? '' : arguments[i]).trim()
    if (text) return text
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isConversationMissingError(error) {
  return /会话不存在|conversation\s+not\s+found|not\s+found/i.test(String((error && error.message) || error || ''))
}

function normalizeAnalyzeResponse(result, fallbackConversationId) {
  const messageResponse = result && result.messageResponse ? result.messageResponse : {}
  const meta = (result && result.meta) || messageResponse.meta || {}
  return {
    conversationId: coalesce(
      result && result.conversation && result.conversation.conversationId,
      result && result.conversationId,
      fallbackConversationId
    ),
    reply: coalesce(messageResponse.reply, messageResponse.message, result && result.reply, result && result.message),
    message: coalesce(messageResponse.message, result && result.message),
    meta,
    raw: result,
    followups: Array.isArray(result && result.followupQuestions)
      ? result.followupQuestions
      : Array.isArray(messageResponse.followupQuestions)
        ? messageResponse.followupQuestions
        : Array.isArray(meta && meta.followupQuestions)
          ? meta.followupQuestions
          : []
  }
}

function normalizeMessageResponse(result, fallbackConversationId) {
  const meta = result && result.meta ? result.meta : {}
  return {
    conversationId: coalesce(result && result.conversationId, fallbackConversationId),
    reply: coalesce(result && result.reply, result && result.message),
    message: coalesce(result && result.message),
    meta,
    raw: result,
    followups: Array.isArray(result && result.followupQuestions)
      ? result.followupQuestions
      : Array.isArray(meta && meta.followupQuestions)
        ? meta.followupQuestions
        : []
  }
}

function buildReplyText(normalized) {
  const reply = coalesce(normalized && normalized.reply, normalized && normalized.message)
  const followups = normalized && Array.isArray(normalized.followups) ? normalized.followups : []
  if (reply && followups.length) {
    return `${reply}\n\n你还可以继续问：\n${followups.slice(0, 3).map(item => `- ${item}`).join('\n')}`
  }
  return reply || '本轮分析已完成，但暂未拿到正式回复文本，请稍后再试。'
}

function wrapImage(value) {
  const text = String(value || '').trim()
  if (!text) {
    return ''
  }
  if (/^(https?:|wxfile:|cloud:\/\/|file:\/\/)/i.test(text) || /^data:image\/\w+;base64,/i.test(text)) {
    return text
  }
  if (text.indexOf('/') === 0) {
    return `${util.baseUrl}${text}`
  }
  if (/^[A-Za-z0-9+/=\s]+$/.test(text) && text.length > 120) {
    return `data:image/jpeg;base64,${text.replace(/\s+/g, '')}`
  }
  return ''
}

function isBase64Image(value) {
  return /^data:image\/\w+;base64,/i.test(String(value || ''))
}

function resolveBase64Image(value) {
  if (!isBase64Image(value)) {
    return Promise.resolve(value)
  }
  return new Promise(resolve => {
    let settled = false
    const finish = filePath => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(filePath || value)
    }
    const timer = setTimeout(() => finish(value), 1600)
    try {
      util.base64src(value, finish)
    } catch (err) {
      finish(value)
    }
  })
}

function hydrateBase64Images(target) {
  if (!target) {
    return Promise.resolve(target)
  }
  const nextTarget = JSON.parse(JSON.stringify(target))
  const tasks = []
  const walk = source => {
    if (!source || typeof source !== 'object') {
      return
    }
    Object.keys(source).forEach(key => {
      const value = source[key]
      if (isBase64Image(value)) {
        tasks.push(resolveBase64Image(value).then(filePath => {
          source[key] = filePath
        }))
        return
      }
      if (value && typeof value === 'object') {
        walk(value)
      }
    })
  }
  walk(nextTarget)
  if (!tasks.length) {
    return Promise.resolve(nextTarget)
  }
  return Promise.all(tasks).then(() => nextTarget)
}

function findImageValue(source, depth) {
  if (!source || depth > 4) {
    return ''
  }
  if (typeof source === 'string') {
    return wrapImage(source)
  }
  if (Array.isArray(source)) {
    for (let i = 0; i < source.length; i += 1) {
      const found = findImageValue(source[i], depth + 1)
      if (found) return found
    }
    return ''
  }
  if (typeof source === 'object') {
    for (let i = 0; i < IMAGE_KEYS.length; i += 1) {
      const found = wrapImage(source[IMAGE_KEYS[i]])
      if (found) return found
    }
    const keys = Object.keys(source)
    for (let i = 0; i < keys.length; i += 1) {
      const found = findImageValue(source[keys[i]], depth + 1)
      if (found) return found
    }
  }
  return ''
}

function getRenderedImages(meta) {
  return meta && meta.renderedImages && typeof meta.renderedImages === 'object' ? meta.renderedImages : {}
}

function getRenderedAsset(meta, key, fallbackTitle) {
  const asset = getRenderedImages(meta)[key]
  if (!asset || typeof asset !== 'object') {
    return null
  }
  const image = findImageValue(asset, 0)
  if (!image) {
    return null
  }
  return {
    title: normalizeText(asset.title) || fallbackTitle || '',
    desc: normalizeText(asset.summary || asset.note || asset.desc || ''),
    image,
    raw: asset
  }
}

function readStorageText(key) {
  try {
    return normalizeText(wx.getStorageSync(key) || '')
  } catch (e) {
    return ''
  }
}

function getOriginalFaceImage(meta, localImage) {
  const local = wrapImage(localImage)
  if (local) {
    return local
  }
  const storagePath = readStorageText('faceImagePath')
  if (storagePath) {
    return storagePath
  }
  const storageImage = wrapImage(readStorageText('faceBase64'))
  if (storageImage) {
    return storageImage
  }
  const face = meta && meta.face ? meta.face : {}
  return findImageValue({
    sourceImageBase64: face.sourceImageBase64 || face.originalImageBase64 || meta && meta.sourceImageBase64 || meta && meta.originalImageBase64,
    sourceImagePath: face.sourceImagePath || meta && meta.sourceImagePath,
    originalImagePath: face.originalImagePath || meta && meta.originalImagePath
  }, 0)
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
  const appearance = meta && meta.appearance ? meta.appearance : {}
  const recommendations = Array.isArray(appearance.recommendations) ? appearance.recommendations : []
  const concerns = Array.isArray(appearance.concerns) ? appearance.concerns : []
  const recommendationRefs = recommendations.reduce((list, item) => {
    return list.concat(Array.isArray(item && item.landmarkRefs) ? item.landmarkRefs : [])
  }, [])
  const concernRefs = concerns.reduce((list, item) => {
    return list.concat(Array.isArray(item && item.landmarkRefs) ? item.landmarkRefs : [])
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

function buildFaceOverviewPreviewCard(source, meta) {
  const face = meta && meta.face ? meta.face : {}
  const imageSize = face.imageSize && typeof face.imageSize === 'object' ? face.imageSize : {}
  const width = Number(imageSize.width || 0)
  const height = Number(imageSize.height || 0)
  const keypoints = Array.isArray(face.keypoints) ? face.keypoints : []
  if (!source || width <= 0 || height <= 0 || !keypoints.length) {
    return null
  }
  const refs = collectAggregateLandmarkRefs(meta)
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
    source,
    frameStyle: `padding-top:${height / width * 100}%;`,
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    width,
    height,
    points,
    boxes: []
  }
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

function clampViewBox(box, width, height) {
  const safeWidth = Math.max(1, Number(width || 0))
  const safeHeight = Math.max(1, Number(height || 0))
  const nextWidth = Math.max(80, Math.min(safeWidth, Number(box.width || 0)))
  const nextHeight = Math.max(80, Math.min(safeHeight, Number(box.height || 0)))
  return {
    x: Math.max(0, Math.min(Math.max(0, safeWidth - nextWidth), Number(box.x || 0))),
    y: Math.max(0, Math.min(Math.max(0, safeHeight - nextHeight), Number(box.y || 0))),
    width: nextWidth,
    height: nextHeight
  }
}

function getArrayMin(list) {
  return Math.min.apply(null, list)
}

function getArrayMax(list) {
  return Math.max.apply(null, list)
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

function getAestheticFocusSummary(title, refs) {
  const joinedRefs = Array.isArray(refs) && refs.length ? `${refs.join('、')}号点` : '对应点位'
  const normalizedTitle = normalizeText(title)
  if (normalizedTitle.indexOf('鼻') !== -1) {
    return `问题主要集中在鼻部支撑和鼻尖鼻翼比例上，${joinedRefs} 附近还值得再细看。建议先按自然微调的思路评估鼻尖立体度、鼻翼收束和中轴线协调。`
  }
  if (normalizedTitle.indexOf('轮廓') !== -1) {
    return `问题主要在外轮廓和下颌缘的衔接还可以更利落，${joinedRefs} 一带适合继续细看。建议围绕下颌缘紧致提升和下庭比例评估。`
  }
  if (normalizedTitle.indexOf('下庭') !== -1) {
    return `问题主要是下庭长度和口周衔接还可以再顺一些，${joinedRefs} 一带值得继续观察。建议把下巴比例、下颌缘线条和侧面衔接一起评估。`
  }
  if (normalizedTitle.indexOf('中轴') !== -1) {
    return `问题主要在面部中轴与五官协调度还可以再对齐，${joinedRefs} 附近适合继续确认。建议把鼻唇下巴的连贯性拆开看。`
  }
  return `问题主要是这组局部点位的比例和平衡度还有进一步确认空间，${joinedRefs} 一带可以继续观察。`
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

function createFaceFocusCards(source, meta, highlighted) {
  const face = meta && meta.face ? meta.face : {}
  const imageSize = face.imageSize && typeof face.imageSize === 'object' ? face.imageSize : {}
  const width = Number(imageSize.width || 0)
  const height = Number(imageSize.height || 0)
  const keypoints = Array.isArray(face.keypoints) ? face.keypoints : []
  const refs = normalizeLandmarkRefs(Array.isArray(highlighted) ? highlighted : [])
  if (!source || width <= 0 || height <= 0 || !keypoints.length || !refs.length) {
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
  const refs = normalizeLandmarkRefs(recommendation && recommendation.landmarkRefs)
  if (refs.length <= 1) {
    return []
  }
  return createFaceFocusCards(source, meta, refs)
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

function collectMoleDetectionCandidates(meta) {
  const mole = meta && meta.mole ? meta.mole : {}
  const directDetections = Array.isArray(mole.detections) ? mole.detections : []
  const overlayDetections = Array.isArray(mole.focusOverlays)
    ? mole.focusOverlays.map((item, index) => ({
      id: normalizeText(item && item.id) || `overlay_${index + 1}`,
      label: normalizeText(item && item.title) || `目标${index + 1}`,
      bbox: Array.isArray(item && item.bbox) ? item.bbox : [],
      cropBbox: Array.isArray(item && item.cropBbox) ? item.cropBbox : []
    })).filter(item => Array.isArray(item.bbox) && item.bbox.length === 4)
    : []
  return directDetections.length ? directDetections : overlayDetections
}

function getMoleImageSize(meta, renderedAsset) {
  const mole = meta && meta.mole ? meta.mole : {}
  const face = meta && meta.face ? meta.face : {}
  const moleSize = mole.imageSize && typeof mole.imageSize === 'object' ? mole.imageSize : {}
  const faceSize = face.imageSize && typeof face.imageSize === 'object' ? face.imageSize : {}
  const raw = renderedAsset && renderedAsset.raw ? renderedAsset.raw : {}
  return {
    width: Number(moleSize.width || faceSize.width || raw.width || raw.imageWidth || 0),
    height: Number(moleSize.height || faceSize.height || raw.height || raw.imageHeight || 0)
  }
}

function buildMoleOverviewPreviewCard(meta, source, renderedAsset) {
  const detections = collectMoleDetectionCandidates(meta)
  const previewSource = source || renderedAsset && renderedAsset.image || ''
  const size = getMoleImageSize(meta, renderedAsset)
  const width = Number(size.width || 1)
  const height = Number(size.height || 1)
  if (!previewSource) {
    return null
  }
  const boxes = detections.map((item, index) => {
    const box = normalizeDetectionBbox(item && item.bbox, width, height)
    if (!box) {
      return null
    }
    return {
      style: [
        `left:${box.x1 / width * 100}%`,
        `top:${box.y1 / height * 100}%`,
        `width:${box.width / width * 100}%`,
        `height:${box.height / height * 100}%`
      ].join(';') + ';',
      label: normalizeText(item && item.label) || `目标${index + 1}`
    }
  }).filter(Boolean)
  return {
    source: previewSource,
    frameStyle: `padding-top:${height / width * 100}%;`,
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    width,
    height,
    points: [],
    boxes
  }
}

function buildMoleFocusCardsFromDetections(meta, source, renderedAsset) {
  const detections = collectMoleDetectionCandidates(meta)
  const size = getMoleImageSize(meta, renderedAsset)
  const width = Number(size.width || 0)
  const height = Number(size.height || 0)
  if (!source || width <= 0 || height <= 0 || !detections.length) {
    return []
  }
  return detections.map((item, index) => {
    const box = normalizeDetectionBbox(item && item.bbox, width, height)
    const cropSource = normalizeDetectionBbox(item && item.cropBbox, width, height) || box
    if (!box || !cropSource) {
      return null
    }
    const crop = expandDetectionCrop(cropSource, width, height, 0.22)
    const label = normalizeText(item && item.label) || `目标${index + 1}`
    return {
      key: `mole_focus_${index + 1}`,
      title: `痣局部命中图${index + 1}`,
      refs: [],
      summary: normalizeText(item && (item.summary || item.note || item.desc)) || DEFAULT_MOLE_FOCUS_NOTE,
      source,
      frameStyle: `padding-top:${crop.height / crop.width * 100}%;`,
      imageStyle: [
        `width:${width / crop.width * 100}%`,
        `height:${height / crop.height * 100}%`,
        `left:${-crop.x / crop.width * 100}%`,
        `top:${-crop.y / crop.height * 100}%`
      ].join(';') + ';',
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
}

function buildPreviewCard(source, raw) {
  if (!source) {
    return null
  }
  const width = Number(raw && (raw.width || raw.imageWidth) || 0)
  const height = Number(raw && (raw.height || raw.imageHeight) || 0)
  return {
    source,
    frameStyle: `padding-top:${width > 0 && height > 0 ? height / width * 100 : 100}%;`,
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points: [],
    boxes: []
  }
}

function buildFocusCardsFromRenderedList(meta, key, fallbackTitle) {
  const cards = getRenderedImages(meta)[key]
  if (!Array.isArray(cards)) {
    return []
  }
  return cards.map((item, index) => {
    const source = findImageValue(item, 0)
    if (!source) {
      return null
    }
    return {
      key: `${key}_${index}`,
      title: normalizeText(item && item.title) || `${fallbackTitle}${index + 1}`,
      summary: normalizeText(item && (item.summary || item.note || item.desc)) || '点击图片可查看局部细节。',
      source,
      frameStyle: buildPreviewCard(source, item).frameStyle,
      imageStyle: 'width:100%;height:100%;left:0;top:0;',
      points: [],
      boxes: []
    }
  }).filter(Boolean)
}

function buildFocusCardsFromMetaList(list, fallbackTitle) {
  if (!Array.isArray(list)) {
    return []
  }
  return list.map((item, index) => {
    const source = findImageValue(item, 0)
    if (!source) {
      return null
    }
    return {
      key: `meta_focus_${index + 1}`,
      title: normalizeText(item && item.title) || `${fallbackTitle || '局部图'}${index + 1}`,
      summary: normalizeText(item && (item.summary || item.note || item.desc || item.content)) || '点击图片可查看局部细节。',
      source,
      frameStyle: buildPreviewCard(source, item).frameStyle,
      imageStyle: 'width:100%;height:100%;left:0;top:0;',
      points: [],
      boxes: []
    }
  }).filter(Boolean)
}

function buildMoleFocusCards(meta, source, renderedAsset) {
  const renderedCards = buildFocusCardsFromRenderedList(meta, 'moleFocusCards', '痣局部命中图')
  if (renderedCards.length) {
    return renderedCards
  }
  const mole = meta && meta.mole ? meta.mole : {}
  const metaCards = buildFocusCardsFromMetaList(mole.focusCards, '痣局部命中图')
  if (metaCards.length) {
    return metaCards
  }
  return buildMoleFocusCardsFromDetections(meta, source, renderedAsset)
}

function hasMoleDetection(meta) {
  const mole = meta && meta.mole ? meta.mole : {}
  const renderedImages = getRenderedImages(meta)
  const renderedFocusCards = Array.isArray(renderedImages.moleFocusCards) ? renderedImages.moleFocusCards : []
  if (Number(mole.detectionCount || 0) > 0) {
    return true
  }
  if (Array.isArray(mole.detections) && mole.detections.length) {
    return true
  }
  if (Array.isArray(mole.focusOverlays) && mole.focusOverlays.length) {
    return true
  }
  if (Array.isArray(mole.focusCards) && mole.focusCards.length) {
    return true
  }
  return renderedFocusCards.length > 0
}

function isTechnicalMetaText(text) {
  const value = normalizeText(text)
  if (!value) {
    return false
  }
  if (/^(low|medium|high|critical)$/i.test(value)) {
    return true
  }
  if (/^[a-z][a-z0-9_-]*$/i.test(value) && /[_-]/.test(value)) {
    return true
  }
  return /^[a-z]+$/i.test(value)
}

function getDisplayMetaText(text) {
  const value = normalizeText(text)
  return isTechnicalMetaText(value) ? '' : value
}

function normalizeBlock(source, fallbackTitle) {
  const item = source && typeof source === 'object' ? source : {}
  const refs = Array.isArray(item.landmarkRefs) && item.landmarkRefs.length
    ? `${item.landmarkRefs.join('、')}号点`
    : normalizeText(item.refs || '')
  const consult = Array.isArray(item.suggestedProjects) && item.suggestedProjects.length
    ? item.suggestedProjects.join('、')
    : normalizeText(item.consult || item.suggestion || '')
  const evidence = Array.isArray(item.evidence) ? item.evidence.join('；') : normalizeText(item.evidence || '')
  return {
    level: getDisplayMetaText(item.priority || item.level || ''),
    label: getDisplayMetaText(item.code || item.label || ''),
    title: normalizeText(item.title || item.name || fallbackTitle || '说明'),
    desc: normalizeText(item.summary || item.desc || item.content || item.reading || item.note || ''),
    refs,
    consult,
    tip: normalizeText(item.caution || item.tip || evidence || '')
  }
}

function buildBlocksFromList(list, fallbackTitle) {
  return (Array.isArray(list) ? list : [])
    .map(item => normalizeBlock(item, fallbackTitle))
    .filter(item => item.title || item.desc || item.refs || item.consult || item.tip)
}

function getAnalysisSectionContent(meta, key) {
  const sections = Array.isArray(meta && meta.analysisSections) ? meta.analysisSections : []
  const target = sections.find(item => normalizeText(item && item.key) === key)
  return normalizeText(target && (target.content || target.summary || target.desc))
}

function buildMoleBlocks(meta, recognized, focusCount, fallbackText) {
  const mole = meta && meta.mole ? meta.mole : {}
  const blocks = []
  const summary = normalizeText(
    mole.summary ||
    mole.readingSummary ||
    getAnalysisSectionContent(meta, 'recognitionJudgment') ||
    fallbackText
  )
  blocks.push({
    title: '识别判断',
    desc: summary || (recognized ? '已识别到痣目标，请结合局部图继续查看边界、颜色和周边皮肤状态。' : '未识别到痣目标。'),
    refs: '',
    consult: '',
    tip: ''
  })
  buildBlocksFromList(mole.readings, '痣相说明').forEach(item => blocks.push(item))
  if (focusCount) {
    blocks.push({
      title: '局部命中图',
      desc: `下方 ${focusCount} 张局部图来自本轮痣识别结果，可继续观察边界、颜色和周边皮肤状态。`,
      refs: '',
      consult: '',
      tip: ''
    })
  }
  return blocks.filter(item => item.desc || item.refs || item.consult || item.tip)
}

function attachFocusCardsToLastBlock(blocks, focusCards) {
  const nextBlocks = Array.isArray(blocks) ? blocks.map(item => Object.assign({}, item)) : []
  if (!nextBlocks.length || !Array.isArray(focusCards) || !focusCards.length) {
    return nextBlocks
  }
  nextBlocks[nextBlocks.length - 1] = Object.assign({}, nextBlocks[nextBlocks.length - 1], {
    focusCards,
    images: []
  })
  return nextBlocks
}

function buildSkinBlocks(meta) {
  const appearance = meta && meta.appearance ? meta.appearance : {}
  const concerns = buildBlocksFromList(appearance.concerns, '皮肤管理建议')
  if (concerns.length) {
    return concerns
  }
  const skinText = getAnalysisSectionContent(meta, 'skin') || normalizeText(appearance.summary || appearance.skinSummary)
  return skinText ? [{
    title: '皮肤管理建议',
    desc: skinText,
    refs: '',
    consult: '',
    tip: ''
  }] : []
}

function buildAppearanceBlocks(meta, overallSections) {
  const appearance = meta && meta.appearance ? meta.appearance : {}
  const recommendationBlocks = buildBlocksFromList(appearance.recommendations, '医美建议')
  if (recommendationBlocks.length) {
    return recommendationBlocks
  }
  const concernBlocks = buildBlocksFromList(appearance.concerns, '面部关注点')
  if (concernBlocks.length) {
    return concernBlocks
  }
  return (overallSections || []).map(item => ({
    title: item.title,
    desc: item.content,
    refs: '',
    consult: '',
    tip: '',
    focusCards: []
  })).filter(item => item.desc)
}

function buildAppearanceBlocksWithFocus(meta, source, overallSections) {
  const appearance = meta && meta.appearance ? meta.appearance : {}
  const recommendations = Array.isArray(appearance.recommendations) ? appearance.recommendations : []
  const blocks = recommendations.map(item => {
    const block = normalizeBlock(item, '医美建议')
    return Object.assign({}, block, {
      label: block.label || '医美建议',
      focusCards: buildRecommendationFocusCards(meta, source, item),
      images: []
    })
  }).filter(item => item.title || item.desc || item.focusCards.length)
  if (blocks.length) {
    return blocks
  }
  const fallbackBlocks = buildAppearanceBlocks(meta, overallSections)
  return fallbackBlocks.map(item => Object.assign({}, item, {
    focusCards: [],
    images: []
  }))
}

function createDetailFromSection(section) {
  const source = section || {}
  const image = source.src || source.image || ''
  const previewCard = source.previewCard &&
    source.previewCard.source &&
    (
      Array.isArray(source.previewCard.points) && source.previewCard.points.length ||
      Array.isArray(source.previewCard.boxes) && source.previewCard.boxes.length
    )
    ? source.previewCard
    : null
  return {
    key: source.key || '',
    title: source.title || '',
    modalTitle: source.modalTitle || source.title || '',
    modalIntro: source.modalIntro || source.note || '',
    image,
    previewCard,
    focusTitle: source.focusTitle || (source.key === 'mole' ? '痣局部放大图' : '美容局部放大图'),
    focusCards: Array.isArray(source.focusCards) ? source.focusCards : [],
    blocks: Array.isArray(source.blocks) && source.blocks.length
      ? source.blocks
      : [
        {
          title: source.title || '说明',
          desc: source.note || '',
          refs: '',
          consult: '',
          tip: ''
        }
      ]
  }
}

function normalizeDetailShape(detail) {
  const next = detail && typeof detail === 'object' ? detail : {}
  const previewCard = next.previewCard &&
    next.previewCard.source &&
    (
      Array.isArray(next.previewCard.points) && next.previewCard.points.length ||
      Array.isArray(next.previewCard.boxes) && next.previewCard.boxes.length
    )
    ? next.previewCard
    : null
  return Object.assign({}, next, {
    previewCard,
    focusCards: Array.isArray(next.focusCards)
      ? next.focusCards.filter(item => item && item.source)
      : [],
    blocks: Array.isArray(next.blocks) ? next.blocks : []
  })
}

function prepareDetailModalData(detail) {
  const nextDetail = normalizeDetailShape(JSON.parse(JSON.stringify(detail || {})))
  const tasks = []
  const queueField = (target, field) => {
    if (!target || !target[field]) {
      return
    }
    tasks.push(resolveBase64Image(target[field]).then(result => {
      target[field] = result || target[field]
    }))
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
    if (Array.isArray(block.images)) {
      block.images.forEach((image, index) => {
        if (!image) {
          return
        }
        tasks.push(resolveBase64Image(image).then(result => {
          block.images[index] = result || image
        }))
      })
    }
  })

  return Promise.all(tasks).then(() => normalizeDetailShape(nextDetail))
}

function splitReplySections(replyText) {
  const text = normalizeText(replyText)
  if (!text) {
    return []
  }
  const positions = REPORT_SECTION_TITLES.map((title, index) => {
    const reg = new RegExp(`(?:^|\\n)\\s*${index + 1}[\\.、．]?\\s*${title}\\s*[：:]?\\s*`)
    const match = text.match(reg)
    return match ? {
      title,
      start: match.index,
      contentStart: match.index + match[0].length
    } : null
  }).filter(Boolean).sort((a, b) => a.start - b.start)

  if (!positions.length) {
    return text.split(/\n+/).map(item => item.trim()).filter(Boolean).slice(0, 4)
  }

  return positions.map((item, index) => {
    const end = index + 1 < positions.length ? positions[index + 1].start : text.length
    return text.slice(item.contentStart, end).trim()
  }).filter(Boolean)
}

function buildOverallSections(meta, replyText) {
  const sections = Array.isArray(meta && meta.analysisSections) ? meta.analysisSections : []
  const normalized = sections.map((item, index) => {
    const key = normalizeText(item && item.key)
    const rawTitle = normalizeText(item && (item.title || item.name || item.label))
    let title = rawTitle || H5_SECTION_TITLES[index] || `第${index + 1}段`
    if (key === 'recognitionJudgment') title = H5_SECTION_TITLES[0]
    if (key === 'treatmentPlan') title = H5_SECTION_TITLES[1]
    if (key === 'lifeAdvice') title = H5_SECTION_TITLES[2]
    if (key === 'predictionAdvice') title = H5_SECTION_TITLES[3]
    const content = normalizeText(item && (item.content || item.summary || item.desc))
    return {
      index: index + 1,
      key,
      title,
      content
    }
  }).filter(item => item.content && item.title !== '治疗处方' && item.key !== 'treatmentPrescription')

  if (normalized.length) {
    return normalized.map((item, index) => ({
      index: index + 1,
      title: item.title,
      content: item.content
    }))
  }

  return splitReplySections(replyText).map((content, index) => ({
    index: index + 1,
    title: H5_SECTION_TITLES[index] || REPORT_SECTION_TITLES[index] || `分析${index + 1}`,
    content
  }))
}

function buildQuickQuestionsFromMeta(meta, normalized) {
  const list = Array.isArray(normalized && normalized.followups)
    ? normalized.followups
    : Array.isArray(meta && meta.followupQuestions)
      ? meta.followupQuestions
      : []
  const backendQuestions = list.map(item => normalizeText(item)).filter(Boolean)
  if (backendQuestions.length) {
    return backendQuestions.slice(0, 3)
  }
  const questions = []
  const hasMole = hasMoleDetection(meta)
  const hasAppearance = !!(meta && (meta.face || meta.appearance))
  if (hasMole) {
    questions.push('这颗痣需要重点关注什么？')
  } else {
    questions.push('没有识别到痣说明什么？')
  }
  if (hasAppearance) {
    questions.push('我的面部重点改善方向是什么？')
  }
  questions.push('日常护理应该先做哪几件事？')
  return questions.slice(0, 3)
}

function buildDiagnosisReport(normalized, localImage) {
  const meta = normalized && normalized.meta ? normalized.meta : {}
  const reply = coalesce(normalized && normalized.reply, normalized && normalized.message) || buildReplyText(normalized)
  const sourceImage = getOriginalFaceImage(meta, localImage)
  const faceOverview = getRenderedAsset(meta, 'faceOverview', '面部问题图')
  const moleOverview = getRenderedAsset(meta, 'moleOverview', '痣识别图')
  const renderedImages = getRenderedImages(meta)
  const hasMolePayload = !!(
    moleOverview ||
    (meta && meta.mole && typeof meta.mole === 'object') ||
    (Array.isArray(renderedImages.moleFocusCards) && renderedImages.moleFocusCards.length)
  )
  const moleSummary = normalizeText(meta && meta.mole && (meta.mole.summary || meta.mole.readingSummary))
  const moleRecognized = hasMoleDetection(meta)
  const molePreviewImage = (hasMolePayload || sourceImage)
    ? (moleRecognized
      ? (sourceImage || moleOverview && moleOverview.image)
      : (sourceImage || moleOverview && moleOverview.image))
    : ''
  const overallSections = buildOverallSections(meta, reply)
  const localFacePreviewCard = buildFaceOverviewPreviewCard(sourceImage, meta)
  const facePreviewCard = localFacePreviewCard || (faceOverview ? buildPreviewCard(faceOverview.image, faceOverview.raw) : null)
  const faceFocusCards = buildFocusCardsFromRenderedList(meta, 'faceFocusCards', '面部局部图')
    .concat(buildFocusCardsFromRenderedList(meta, 'aestheticFocusCards', '面部局部图'))
    .concat(buildFocusCardsFromMetaList(meta && meta.focusCards, '面部局部图'))
    .concat(buildFocusCardsFromMetaList(meta && meta.face && meta.face.focusCards, '面部局部图'))
    .concat(createFaceFocusCards(sourceImage, meta, collectAggregateLandmarkRefs(meta)))
  const imageEchoList = []

  if (sourceImage) {
    imageEchoList.push({
      title: '原图',
      image: sourceImage,
      desc: '当前会话用于分析的原始图片。',
      action: 'modal'
    })
  }
  if (faceOverview) {
    imageEchoList.push({
      title: '点击查看面部问题',
      sectionKey: 'aesthetic',
      image: sourceImage || faceOverview.image,
      previewCard: facePreviewCard,
      desc: faceOverview.desc || '下面是详细的分析图，可继续查看皮肤管理、痣识别和面部问题说明。',
      action: 'toggle-drilldown'
    })
  } else if (facePreviewCard) {
    imageEchoList.push({
      title: '点击查看面部问题',
      sectionKey: 'aesthetic',
      image: sourceImage,
      previewCard: facePreviewCard,
      desc: '下面是详细的分析图，已根据本次接口返回的人脸点位生成面部问题说明。',
      action: 'toggle-drilldown'
    })
  }

  const visualDetailSections = []
  if (sourceImage) {
    const skinBlocks = buildSkinBlocks(meta)
    visualDetailSections.push({
      key: 'skin',
      eyebrow: 'ORIGINAL',
      title: '皮肤管理图',
      modalTitle: '皮肤管理建议',
      modalIntro: '这里聚焦日常护理、当前处理方向和后续观察建议，帮助先从皮肤管理层面看整体状态。',
      src: sourceImage,
      note: skinBlocks[0] && skinBlocks[0].desc || '这张图主要用于观察整体面部轮廓、五官比例和皮肤基础状态。',
      blocks: skinBlocks.length ? skinBlocks : [
        {
          title: '皮肤管理建议',
          desc: '当前接口未返回独立皮肤管理建议，先展示原图用于对照整体状态。',
          refs: '',
          consult: '',
          tip: ''
        }
      ]
    })
  }
  if (molePreviewImage) {
    const molePreviewCard = moleRecognized ? buildMoleOverviewPreviewCard(meta, molePreviewImage, moleOverview) : null
    const moleFocusCards = buildMoleFocusCards(meta, molePreviewImage, moleOverview)
    const moleBlocks = attachFocusCardsToLastBlock(
      buildMoleBlocks(meta, moleRecognized, moleFocusCards.length, moleSummary || (moleOverview && moleOverview.desc)),
      moleFocusCards
    )
    visualDetailSections.push({
      key: 'mole',
      eyebrow: 'MOLE',
      title: '痣识别图',
      modalTitle: '痣识别说明与局部命中图',
      modalIntro: '这里展示痣识别摘要与局部命中图，便于继续观察边界、颜色和周边皮肤状态。',
      src: molePreviewImage,
      previewCard: molePreviewCard,
      note: moleRecognized
        ? ((moleOverview && moleOverview.desc) || moleSummary || '已识别到痣目标，可继续查看局部命中区域。')
        : (moleSummary || (moleOverview && moleOverview.desc) || '未识别到痣目标，当前显示原图，方便继续观察整体皮肤状态。'),
      focusCards: moleFocusCards,
      blocks: moleBlocks
    })
  }
  if (faceOverview || sourceImage) {
    const appearanceBlocks = buildAppearanceBlocksWithFocus(meta, sourceImage, overallSections)
    visualDetailSections.push({
      key: 'aesthetic',
      eyebrow: 'AESTHETIC',
      title: '面部问题图',
      modalTitle: '面部问题图与医美建议联动',
      modalIntro: '这里聚焦本轮医美建议，便于对照图像查看重点区域。',
      src: sourceImage || faceOverview && faceOverview.image,
      previewCard: facePreviewCard,
      note: faceOverview && faceOverview.desc || appearanceBlocks[0] && appearanceBlocks[0].desc || '这里用于对照面部比例、轮廓和医美建议关联区域。',
      focusCards: faceFocusCards,
      blocks: appearanceBlocks
    })
  }

  const overallIntro = normalizeText(
    meta.overallSummary ||
    meta.overallIntro ||
    meta.summary ||
    meta.faceSummary
  ) || reply

  return {
    title: '医美智能体',
    subtitle: '整体分析、局部说明和后续追问都会沿用当前图片结果展示。',
    overallIntro,
    overallSections,
    imageEchoList,
    imageEchoScrollLeft: 0,
    visualDetailSections,
    showVisualDrilldown: false,
    activeDetailImageIndex: 0,
    activeEchoCardIndex: imageEchoList.length ? 0 : -1,
    quickQuestions: buildQuickQuestionsFromMeta(meta, normalized)
  }
}

function getUploadFileName(filePath) {
  const lower = String(filePath || '').toLowerCase()
  if (lower.indexOf('.png') !== -1) return 'face.png'
  if (lower.indexOf('.webp') !== -1) return 'face.webp'
  return 'face.jpg'
}

function getRestoredMessageTime(item, index) {
  const rawTime = item && (item.createdAt || item.updatedAt || item.time)
  const numericTime = Number(rawTime)
  if (!Number.isNaN(numericTime) && numericTime > 1000000000) {
    return numericTime + index
  }
  const parsed = rawTime ? Date.parse(rawTime) : NaN
  return Number.isNaN(parsed) ? Date.now() + index : parsed + index
}

function getServerMessageText(item) {
  return coalesce(
    item && item.reply,
    item && item.content,
    item && item.message,
    item && item.text
  )
}

function stripUploadedImageBlock(text) {
  const value = String(text || '')
  const marker = '[上传图片]'
  const markerIndex = value.indexOf(marker)
  return (markerIndex >= 0 ? value.slice(0, markerIndex) : value).trim()
}

function parseUploadedImageNotes(text) {
  const value = String(text || '')
  const marker = '[上传图片]'
  const markerIndex = value.indexOf(marker)
  if (markerIndex < 0) {
    return []
  }
  return value
    .slice(markerIndex + marker.length)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.indexOf('- ') === 0)
    .map(line => line.slice(2).trim())
    .filter(Boolean)
    .slice(0, 8)
}

function buildRestoredUserImages(item, text) {
  const uploadedImages = Array.isArray(item && item.uploadedImages)
    ? item.uploadedImages
    : []
  const fromServer = uploadedImages
    .map((image, index) => {
      const src = findImageValue(image, 0)
      return {
        title: normalizeText(image && (image.title || image.name)) || `历史上传图片${index + 1}`,
        src,
        note: normalizeText(image && (image.relativePath || image.fileName || image.note))
      }
    })
    .filter(image => image.src)

  if (fromServer.length) {
    return fromServer
  }

  return parseUploadedImageNotes(text).map((note, index) => ({
    title: `历史上传图片${index + 1}`,
    src: '',
    note
  }))
}

function shouldBuildRestoredReport(meta) {
  if (!meta || typeof meta !== 'object') {
    return false
  }
  return !!(
    meta.analysisSections ||
    meta.renderedImages ||
    meta.face ||
    meta.appearance ||
    meta.mole ||
    meta.focusCards ||
    meta.overallSummary ||
    meta.overallIntro ||
    meta.faceSummary ||
    meta.summary
  )
}

function getRecentRestorableMessages(messages) {
  const list = Array.isArray(messages) ? messages : []
  if (list.length <= HISTORY_RESTORE_MESSAGE_LIMIT) {
    return list
  }
  const startIndex = list.length - HISTORY_RESTORE_MESSAGE_LIMIT
  const latestReportIndex = findLatestReportMessageIndex(list)
  if (latestReportIndex < 0 || latestReportIndex >= startIndex) {
    return list.slice(startIndex)
  }
  return [list[latestReportIndex]].concat(
    list.slice(list.length - (HISTORY_RESTORE_MESSAGE_LIMIT - 1))
  )
}

function findLatestRestoredImageValue(messages) {
  const list = Array.isArray(messages) ? messages : []
  for (let index = list.length - 1; index >= 0; index -= 1) {
    const item = list[index] || {}
    if (item.role === 'assistant') {
      continue
    }
    const images = buildRestoredUserImages(item, getServerMessageText(item))
    const image = images.find(source => source && source.src)
    if (image && image.src) {
      return image.src
    }
  }
  return ''
}

function findLatestReportMessageIndex(messages) {
  const list = Array.isArray(messages) ? messages : []
  for (let index = list.length - 1; index >= 0; index -= 1) {
    const item = list[index] || {}
    const meta = item.meta && typeof item.meta === 'object' ? item.meta : {}
    if (item.role === 'assistant' && shouldBuildRestoredReport(meta)) {
      return index
    }
  }
  return -1
}

Page({
  data: {
    imageUrl: '', // 上传的图片地址
    imageBase64: '', // 图片的base64编码
    message: '', // 用户输入的消息
    messageList: [], // 消息列表
    showWelcome: true, // 是否显示欢迎页
    isAiTyping: false, // AI是否正在输入
    isFirstImageUpload: true, // 是否是第一次上传图片
    showGiftModal: false, // 是否显示见面礼弹窗
    showRealNameModal: false, // 是否显示实名弹窗
    realName: '', // 实名姓名
    realPhone: '', // 实名手机号
    privacyAgreed: false, // 隐私协议是否同意
    conversationId: '', // H5 AI 会话 ID
    isRestoringHistory: false,
    historyStatusText: '',
    cachedFaceImagePath: '',
    showDetailModal: false,
    currentDetail: null,
    showFocusPreview: false,
    focusPreviewCard: null,
  },

  onLoad(options) {
    // 检查是否实名
    this.checkRealName();
    this.initializeDiagnosisConversation();
  },

  async initializeDiagnosisConversation() {
    try {
      await miniappOpenApi.waitForMiniappOpenid();
      const savedConversationId = miniappOpenApi.getStoredConversationId(DIAGNOSIS_CONVERSATION_KEY);
      this.setData({
        conversationId: savedConversationId
      });
      if (savedConversationId) {
        this.restoreDiagnosisHistory(savedConversationId, {
          silent: true
        });
      }
    } catch (err) {
      console.warn('[diagnosis] initialize user conversation failed:', err);
    }
  },

  getOpenConversationId() {
    return this.data.conversationId || miniappOpenApi.getStoredConversationId(DIAGNOSIS_CONVERSATION_KEY) || '';
  },
  buildPersistentImagePath(sourcePath) {
    const lower = String(sourcePath || '').toLowerCase()
    let ext = '.jpg'
    if (lower.endsWith('.png')) {
      ext = '.png'
    } else if (lower.endsWith('.webp')) {
      ext = '.webp'
    } else if (lower.endsWith('.gif')) {
      ext = '.gif'
    }
    return `${wx.env.USER_DATA_PATH}/diagnosis_face_${Date.now()}${ext}`
  },
  cacheSelectedFaceImage(filePath) {
    if (!filePath) {
      return Promise.resolve('')
    }
    try {
      util.clearJsonCache('rawApiResponse')
    } catch (e) {}
    try {
      wx.removeStorageSync('miniappAnalyzeResponse')
    } catch (e) {}
    const fs = wx.getFileSystemManager()
    const saveFromPath = finalPath => new Promise(resolve => {
      const safePath = finalPath || filePath
      fs.readFile({
        filePath: safePath,
        encoding: 'base64',
        success: fileRes => {
          wx.setStorageSync('faceImagePath', safePath)
          wx.setStorageSync('faceBase64', fileRes.data)
          this.setData({
            cachedFaceImagePath: safePath
          })
          console.log('[diagnosis] cached face image:', safePath, 'base64 length:', String(fileRes.data || '').length)
          resolve(safePath)
        },
        fail: err => {
          console.warn('[diagnosis] cache face image read failed:', err)
          wx.setStorageSync('faceImagePath', safePath)
          this.setData({
            cachedFaceImagePath: safePath
          })
          resolve(safePath)
        }
      })
    })
    const persistentPath = this.buildPersistentImagePath(filePath)
    return new Promise(resolve => {
      fs.copyFile({
        srcPath: filePath,
        destPath: persistentPath,
        success: () => {
          saveFromPath(persistentPath).then(resolve)
        },
        fail: () => {
          saveFromPath(filePath).then(resolve)
        }
      })
    })
  },
  rmzxj(){
    wx.navigateTo({
      url: '/subpackagesC/cefuzhifengmian/cefuzhifengmian',
    })
  },
  // 检查实名状态
  checkRealName() {
    const realInfo = wx.getStorageSync('realInfo');
    if (!realInfo || !realInfo.realname || !realInfo.mobile) {
      // 未实名，显示实名弹窗
      this.setData({
        showRealNameModal: true,
        realName: realInfo?.realname || '',
        realPhone: realInfo?.mobile || '',
        privacyAgreed: !!(realInfo?.realname || realInfo?.mobile)
      });
    }
  },

  // 选择图片上传
  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];

        that.setData({
          imageUrl: tempFilePath,
          imageBase64: ''
        });
        that.cacheSelectedFaceImage(tempFilePath).then(cachedPath => {
          if (cachedPath) {
            that.setData({
              imageUrl: cachedPath
            });
          }

          // H5 接口使用 multipart 文件直传，不再传 base64
          that.sendImageMessage(tempFilePath);
        });
      }
    });
  },

  // 发送图片消息
  sendImageMessage(filePath) {
    if (!filePath) {
      wx.showToast({
        title: '图片选择失败',
        icon: 'none'
      });
      return;
    }

    // 添加用户图片消息到列表
    this.addUserMessage('[图片]', 'image', this.data.imageUrl);

    // 显示AI加载状态
    this.showAiLoading();

    // 调用 H5 图文分析聚合接口
    this.uploadAndAnalyzeImage(filePath);
  },

  async uploadAndAnalyzeImage(filePath) {
    try {
      this.setData({
        isAiTyping: true
      });
      const conversationId = this.getOpenConversationId();
      const response = await this.submitOpenAnalyzeImage(filePath, conversationId);
      const nextConversationId = coalesce(
        response && response.conversation && response.conversation.conversationId,
        response && response.conversationId,
        conversationId
      );
      const clientMessageId = coalesce(
        response && response.messageRequest && response.messageRequest.clientMessageId,
        response && response.clientMessageId
      );

      this.saveOpenConversationId(nextConversationId);

      let finalResult = response;
      if ((response && response.accepted && response.async) || (nextConversationId && clientMessageId)) {
        finalResult = await this.waitAnalyzeResult(nextConversationId, clientMessageId);
      }

      try {
        util.saveJsonCache('rawApiResponse', finalResult);
      } catch (e) {
        console.warn('[diagnosis] persist rawApiResponse file cache failed:', e);
      }
      await this.finishOpenAiReply(normalizeAnalyzeResponse(finalResult, nextConversationId), true);
    } catch (err) {
      this.handleOpenAiFail('分析失败，请重试', err);
    }
  },

  submitOpenAnalyzeImage(filePath, conversationId) {
    const messageText = (this.data.message || '').trim() || miniappOpenApi.DEFAULT_ANALYZE_MESSAGE;
    console.log('[diagnosis] POST analyze:', miniappOpenApi.ANALYZE_API_URL, {
      hasConversationId: !!conversationId,
      filePath
    });
    return miniappOpenApi.uploadAnalyzeFile({
      filePath,
      fileName: getUploadFileName(filePath),
      formData: {
        conversationId: conversationId || '',
        title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE,
        message: messageText,
        workflow: 'chat',
        async: 'true'
      }
    });
  },

  async ensureReusableOpenConversationForAnalyze() {
    const conversationId = this.getOpenConversationId();
    if (!conversationId) {
      return '';
    }

    try {
      console.log('[diagnosis] GET conversation before analyze:', conversationId);
      await miniappOpenApi.getConversation(conversationId, {
        timeout: CONVERSATION_CHECK_TIMEOUT_MS,
        compact: true,
        limit: 1
      });
      return conversationId;
    } catch (err) {
      console.warn('[diagnosis] conversation check skipped:', err);
      this.saveOpenConversationId('');
      return '';
    }
  },

  async ensureReusableOpenConversation() {
    const conversationId = this.getOpenConversationId();
    if (!conversationId) {
      return '';
    }

    try {
      await miniappOpenApi.getConversation(conversationId, {
        compact: true,
        limit: 1
      });
      return conversationId;
    } catch (err) {
      if (!isConversationMissingError(err)) {
        throw err;
      }
      this.saveOpenConversationId('');
      return '';
    }
  },

  async ensureOpenConversation() {
    const reusable = await this.ensureReusableOpenConversation();
    if (reusable) {
      return reusable;
    }

    const response = await miniappOpenApi.createConversation({
      title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE
    });
    const conversationId = coalesce(
      response && response.conversationId,
      response && response.conversation && response.conversation.conversationId
    );
    this.saveOpenConversationId(conversationId);
    return conversationId;
  },

  async ensureOpenConversationForMessage() {
    const conversationId = this.getOpenConversationId();
    if (conversationId) {
      return conversationId;
    }

    const response = await miniappOpenApi.createConversation({
      title: miniappOpenApi.DEFAULT_CONVERSATION_TITLE
    });
    const nextConversationId = coalesce(
      response && response.conversationId,
      response && response.conversation && response.conversation.conversationId
    );
    this.saveOpenConversationId(nextConversationId);
    return nextConversationId;
  },

  saveOpenConversationId(conversationId) {
    this.setData({
      conversationId: conversationId || ''
    });

    if (conversationId) {
      miniappOpenApi.setStoredConversationId(conversationId, DIAGNOSIS_CONVERSATION_KEY);
      miniappOpenApi.setStoredConversationId(conversationId);
    } else {
      miniappOpenApi.clearStoredConversationId(DIAGNOSIS_CONVERSATION_KEY);
      miniappOpenApi.clearStoredConversationId();
    }
  },

  restoreDiagnosisHistoryTap() {
    if (this.data.isRestoringHistory || this.data.isAiTyping) {
      return;
    }
    this.restoreDiagnosisHistory('', {
      manual: true
    });
  },

  async restoreDiagnosisHistory(conversationId, options) {
    const opts = options || {};
    const targetConversationId = conversationId || this.getOpenConversationId();
    if (!targetConversationId) {
      if (!opts.silent) {
        wx.showToast({
          title: '暂无历史记录',
          icon: 'none'
        });
      }
      return false;
    }
    if (this.data.isRestoringHistory) {
      return false;
    }

    this.setData({
      isRestoringHistory: true,
      historyStatusText: '正在恢复历史记录...',
      isAiTyping: false,
      showWelcome: false
    });

    try {
      const snapshot = await miniappOpenApi.getConversation(targetConversationId, {
        timeout: HISTORY_RESTORE_TIMEOUT_MS,
        compact: true,
        limit: HISTORY_RESTORE_MESSAGE_LIMIT
      });
      const serverMessages = Array.isArray(snapshot && snapshot.messages) ? snapshot.messages : [];
      if (!serverMessages.length) {
        this.setData({
          isRestoringHistory: false,
          historyStatusText: '',
          showWelcome: !(this.data.messageList && this.data.messageList.length)
        });
        if (!opts.silent) {
          wx.showToast({
            title: '暂无历史记录',
            icon: 'none'
          });
        }
        return false;
      }

      const nextConversationId = coalesce(snapshot && snapshot.conversationId, targetConversationId);
      const latestHistoryImage = findLatestRestoredImageValue(serverMessages);
      const restorableMessages = getRecentRestorableMessages(serverMessages);
      this.setData({
        historyStatusText: serverMessages.length > restorableMessages.length
          ? `正在整理最近${restorableMessages.length}条历史记录...`
          : '正在整理历史记录...'
      });
      const restored = await this.buildRestoredMessageList(restorableMessages, nextConversationId, latestHistoryImage);
      const latestImage = restored.latestImage || this.data.cachedFaceImagePath || this.data.imageUrl || '';
      this.saveOpenConversationId(nextConversationId);
      if (latestImage) {
        wx.setStorageSync('faceImagePath', latestImage);
      }
      this.setData({
        messageList: restored.messageList,
        showWelcome: restored.messageList.length === 0,
        isRestoringHistory: false,
        historyStatusText: '',
        isAiTyping: false,
        isFirstImageUpload: !restored.hasImageHistory,
        cachedFaceImagePath: latestImage,
        imageUrl: latestImage || this.data.imageUrl
      });
      if (!opts.silent) {
        wx.showToast({
          title: '已恢复历史记录',
          icon: 'success'
        });
      }
      this.scrollToBottom();
      return true;
    } catch (err) {
      console.warn('[diagnosis] restore history failed:', err);
      if (isConversationMissingError(err)) {
        this.saveOpenConversationId('');
      }
      this.setData({
        isRestoringHistory: false,
        historyStatusText: '',
        isAiTyping: false,
        showWelcome: !(this.data.messageList && this.data.messageList.length)
      });
      if (!opts.silent) {
        wx.showToast({
          title: err && err.message ? err.message.slice(0, 18) : '历史记录恢复失败',
          icon: 'none'
        });
      }
      return false;
    }
  },

  async buildRestoredMessageList(serverMessages, conversationId, historyImage) {
    const messageList = [];
    let latestImage = historyImage || this.data.cachedFaceImagePath || this.data.imageUrl || wx.getStorageSync('faceImagePath') || '';
    latestImage = await resolveBase64Image(latestImage);
    let hasImageHistory = false;
    const latestReportIndex = findLatestReportMessageIndex(serverMessages);

    for (let index = 0; index < serverMessages.length; index += 1) {
      const item = serverMessages[index] || {};
      const role = item.role === 'assistant' ? 'assistant' : 'user';
      const rawText = getServerMessageText(item);
      const baseTime = getRestoredMessageTime(item, index);

      if (role === 'user') {
        const images = buildRestoredUserImages(item, rawText);
        const firstImage = images.find(image => image && image.src);
        const displayText = stripUploadedImageBlock(rawText);
        const isDefaultAnalyzeText = normalizeText(displayText) === normalizeText(miniappOpenApi.DEFAULT_ANALYZE_MESSAGE);

        if (firstImage) {
          latestImage = await resolveBase64Image(firstImage.src);
          hasImageHistory = true;
          messageList.push({
            type: 'user',
            msgType: 'image',
            content: '[图片]',
            imageUrl: latestImage,
            time: baseTime + messageList.length
          });
          if (displayText && !isDefaultAnalyzeText) {
            messageList.push({
              type: 'user',
              msgType: 'text',
              content: displayText,
              imageUrl: '',
              time: baseTime + messageList.length
            });
          }
        } else if (displayText) {
          messageList.push({
            type: 'user',
            msgType: 'text',
            content: displayText,
            imageUrl: '',
            time: baseTime + messageList.length
          });
        } else if (images.length) {
          messageList.push({
            type: 'user',
            msgType: 'text',
            content: images.map(image => image.note || image.title).filter(Boolean).join('\n') || '[历史图片]',
            imageUrl: '',
            time: baseTime + messageList.length
          });
        }
        continue;
      }

      const meta = item.meta && typeof item.meta === 'object' ? item.meta : {};
      const normalized = {
        conversationId,
        reply: rawText,
        message: rawText,
        meta,
        raw: item,
        followups: Array.isArray(item.followupQuestions)
          ? item.followupQuestions
          : Array.isArray(meta.followupQuestions)
            ? meta.followupQuestions
            : []
      };
      const content = rawText || buildReplyText(normalized);
      let report = index === latestReportIndex && shouldBuildRestoredReport(meta)
        ? buildDiagnosisReport(normalized, latestImage)
        : null;

      if (report) {
        report = await hydrateBase64Images(report);
        hasImageHistory = true;
      }

      messageList.push({
        type: 'ai',
        content,
        hasGiftLink: false,
        messageParts: [{
          type: 'text',
          content: this.formatMessageContent(content)
        }],
        report,
        time: baseTime + messageList.length
      });
    }

    return {
      messageList,
      latestImage,
      hasImageHistory
    };
  },

  startNewDiagnosisConversation() {
    if (this.data.isRestoringHistory || this.data.isAiTyping) {
      return;
    }

    wx.showModal({
      title: '开启新对话',
      content: '会清空当前历史上下文，并回到上传照片页。',
      confirmText: '新对话',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          this.resetOpenDiagnosisConversation();
        }
      }
    });
  },

  async resetOpenDiagnosisConversation() {
    const conversationId = this.getOpenConversationId();
    if (conversationId) {
      wx.showLoading({
        title: '处理中...',
        mask: true
      });
    }

    try {
      if (conversationId) {
        await miniappOpenApi.clearConversationContext(conversationId);
      }
    } catch (err) {
      console.warn('[diagnosis] clear conversation context failed:', err);
    } finally {
      if (conversationId) {
        wx.hideLoading();
      }
      this.saveOpenConversationId('');
      miniappOpenApi.clearStoredConversationId();
      wx.removeStorageSync('faceImagePath');
      wx.removeStorageSync('faceBase64');
      wx.removeStorageSync('miniappAnalyzeResponse');
      try {
        util.clearJsonCache('rawApiResponse');
      } catch (e) {}
      this.setData({
        imageUrl: '',
        imageBase64: '',
        message: '',
        messageList: [],
        showWelcome: true,
        isAiTyping: false,
        isFirstImageUpload: true,
        isRestoringHistory: false,
        historyStatusText: '',
        cachedFaceImagePath: '',
        showDetailModal: false,
        currentDetail: null,
        showFocusPreview: false,
        focusPreviewCard: null
      });
      wx.showToast({
        title: '已开启新对话',
        icon: 'success'
      });
    }
  },

  async waitAnalyzeResult(conversationId, clientMessageId) {
    if (!conversationId || !clientMessageId) {
      throw new Error('缺少异步分析标识');
    }

    for (let i = 0; i < ANALYZE_POLL_LIMIT; i += 1) {
      const compact = await miniappOpenApi.getAnalyzeResult(conversationId, clientMessageId, true);

      if (compact && compact.ready && compact.result) {
        return compact.result;
      }

      if (compact && compact.ready && compact.compact) {
        const detail = await miniappOpenApi.getAnalyzeResult(conversationId, clientMessageId, false);
        if (detail && detail.ready && detail.result) {
          return detail.result;
        }
      }

      if (String((compact && compact.status) || '').toLowerCase() === 'failed') {
        throw new Error((compact && compact.error) || '分析任务失败');
      }

      await sleep(ANALYZE_POLL_INTERVAL_MS);
    }

    throw new Error('分析任务超时');
  },

  async finishOpenAiReply(normalized, appendGift) {
    let reply = buildReplyText(normalized);
    const reportImage = this.data.cachedFaceImagePath || this.data.imageUrl;
    let report = appendGift ? buildDiagnosisReport(normalized, reportImage) : null;
    if (appendGift && this.data.isFirstImageUpload) {
      reply += '\n#点击领取【光子嫩肤】邂逅光感美肌';
    }
    if (normalized && normalized.conversationId) {
      this.saveOpenConversationId(normalized.conversationId);
    }
    if (report) {
      report = await hydrateBase64Images(report);
    }
    this.addAiMessage(reply, report);
    if (appendGift) {
      this.setData({
        isFirstImageUpload: false
      });
    }
  },

  handleOpenAiFail(title, err) {
    console.error(title, err);
    this.setData({
      isAiTyping: false
    });
    wx.showToast({
      title: err && err.message ? err.message.slice(0, 18) : title,
      icon: 'none'
    });
  },

  // 按钮1 - 关于小慧
  handleButton1() {
    const userMsg = '关于小慧|你的AI变美搭子';
    const aiReply = '嗨！我是你的AI变美搭子小慧。我的使命，就是做你一面"科学的镜子"，帮你更温柔、客观地看清自己独特的美~\n我们可以先随便聊聊你的小困扰，或者马上进行一个AI面诊，生成一份专属于你的初阶美学评估报告。\n这份报告会像一位懂你的朋友，帮你分析：\n△ 轮廓线条是否流畅和谐？\n△ 五官（眼、鼻…）有哪些亮点和可以更精致的地方？\n△ 基于你的特点，有哪些清晰的优化思路？\n\n想试试吗？你只需要发我一张清晰的正面素颜照，我就能为你生成这份专属报告。这会是帮你理清思路、与专家高效沟通的绝佳起点哦~\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮2 - 点亮「心灵之窗」
  handleButton2() {
    const userMsg = '点亮「心灵之窗」';
    const aiReply = '都说眼睛是心灵的窗户。如果觉得眼睛不够有神、显疲态，可能是双眼皮形态、眼皮松弛或者内眼角的一点影响。发我一张你的眼部正面照片吧，我可以先帮你看看可能的原因，然后我们聊聊双眼皮、开眼角等不同方式能带来怎样的改变。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮3 - 重塑「面中之王」
  handleButton3() {
    const userMsg = '重塑「面中之王」';
    const aiReply = '鼻子是面部的核心，调整的关键是让它和你的整体脸型搭配和谐，而不是单纯变高。你更喜欢自然直鼻还是微翘水滴鼻的风格？发我一张你的正面和侧面脸部照片，我可以帮你分析鼻梁高度、鼻尖形状等，然后聊聊注射、假体或复合隆鼻这些选择分别适合什么情况。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮4 - 雕琢「身体曲线」
  handleButton4() {
    const userMsg = '雕琢「身体曲线」';
    const aiReply = '胸部之美，在于形态、大小和身体曲线的和谐。无论是想改善大小、形态，还是应对产后变化，我们都可以先聊聊。你更追求饱满挺拔的曲线，还是自然圆润的感觉？发我一张你的上半身照片（穿紧身衣即可），我可以先帮你做个初步的体型与比例分析，然后我们再一起了解假体、自体脂肪等不同方式的区别。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 按钮5 - 打造「上镜轮廓」
  handleButton5() {
    const userMsg = '打造「上镜轮廓」';
    const aiReply = '流畅的脸部线条会让整体感觉更上镜。这通常和下颌线、颧骨的线条以及面部软组织的比例有关。你更希望让轮廓更柔和、更紧致，还是增加饱满度？发我一张你的正面脸部照片，我可以帮你标记关键位置，然后我们聊聊瘦脸针、吸脂或填充等不同的改善思路。\n#变美的事，找小慧就对了';
    this.quickSendMessage(userMsg, aiReply);
  },

  // 快速发送消息（固定回复，不请求接口）
  quickSendMessage(userMsg, aiReply) {
    // 添加用户消息
    this.addUserMessage(userMsg);

    // 显示AI加载状态
    this.showAiLoading();

    // 延迟显示AI回复（模拟思考时间）
    setTimeout(() => {
      this.addAiMessage(aiReply);
    }, 1000);
  },

  // 输入消息
  handleMessageInput(e) {
    this.setData({
      message: e.detail.value
    });
  },

  previewReportImage(e) {
    const url = e.currentTarget.dataset.url || '';
    if (!url) {
      return;
    }
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },

  getReportImageEchoScrollLeft(index) {
    const sys = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {
      windowWidth: 375
    };
    const rpxToPx = Number(sys.windowWidth || 375) / 750;
    const cardWidth = 430 * rpxToPx;
    const gap = 18 * rpxToPx;
    const sideInset = 2 * rpxToPx;
    return Math.max(0, Math.round(index * (cardWidth + gap) - sideInset));
  },

  scrollToDiagnosisImageEchoCard(msgIndex, imageIndex) {
    wx.nextTick(() => {
      wx.pageScrollTo({
        selector: `#msg-${msgIndex}-image-echo-card-${imageIndex}`,
        duration: 120
      });
    });
  },

  handleImageEchoTap(e) {
    const msgIndex = Number(e.currentTarget.dataset.msgIndex || 0);
    const imageIndex = Number(e.currentTarget.dataset.index || 0);
    const messages = this.data.messageList || [];
    const message = messages[msgIndex] || {};
    const report = message.report || {};
    const imageEchoList = Array.isArray(report.imageEchoList) ? report.imageEchoList : [];
    const item = imageEchoList[imageIndex];

    if (!item || !item.image) {
      return;
    }

    if (item.action === 'toggle-drilldown') {
      const nextShow = !report.showVisualDrilldown;
      const nextActiveIndex = nextShow ? imageIndex : 0;
      const nextActiveEchoCardIndex = nextShow ? imageIndex : -1;
      const patch = {};
      patch[`messageList[${msgIndex}].report.showVisualDrilldown`] = nextShow;
      patch[`messageList[${msgIndex}].report.activeEchoCardIndex`] = nextActiveEchoCardIndex;
      patch[`messageList[${msgIndex}].report.activeDetailImageIndex`] = nextShow ? 1 : 0;
      patch[`messageList[${msgIndex}].report.imageEchoScrollLeft`] = this.getReportImageEchoScrollLeft(nextActiveIndex);
      this.setData(patch, () => {
        this.scrollToDiagnosisImageEchoCard(msgIndex, nextActiveIndex);
        if (nextShow) {
          setTimeout(() => {
            this.scrollToDiagnosisImageEchoCard(msgIndex, imageIndex);
          }, 120);
        }
      });
      return;
    }

    const patch = {};
    patch[`messageList[${msgIndex}].report.activeEchoCardIndex`] = imageIndex;
    patch[`messageList[${msgIndex}].report.imageEchoScrollLeft`] = this.getReportImageEchoScrollLeft(imageIndex);
    this.setData(patch, () => {
      this.scrollToDiagnosisImageEchoCard(msgIndex, imageIndex);
    });
    this.previewReportImage(e);
  },

  openReportDetail(e) {
    const msgIndex = Number(e.currentTarget.dataset.msgIndex || 0);
    const sectionIndex = Number(e.currentTarget.dataset.sectionIndex || 0);
    const message = (this.data.messageList || [])[msgIndex] || {};
    const sections = message.report && Array.isArray(message.report.visualDetailSections)
      ? message.report.visualDetailSections
      : [];
    const section = sections[sectionIndex];

    if (!section) {
      return;
    }

    this.showReportDetail(section);
  },

  openReportDetailByKey(e) {
    const msgIndex = Number(e.currentTarget.dataset.msgIndex || 0);
    const sectionKey = e.currentTarget.dataset.sectionKey || '';
    const message = (this.data.messageList || [])[msgIndex] || {};
    const sections = message.report && Array.isArray(message.report.visualDetailSections)
      ? message.report.visualDetailSections
      : [];
    const section = sections.find(item => item && item.key === sectionKey);

    if (!section) {
      this.previewReportImage(e);
      return;
    }

    this.showReportDetail(section);
  },

  showReportDetail(section) {
    const rawDetail = createDetailFromSection(section);
    prepareDetailModalData(rawDetail).then(detail => {
      this.setData({
        currentDetail: detail,
        showDetailModal: true,
        showFocusPreview: false,
        focusPreviewCard: null
      });
    }).catch(err => {
      console.warn('[diagnosis] prepare detail modal failed:', err);
      this.setData({
        currentDetail: normalizeDetailShape(rawDetail),
        showDetailModal: true,
        showFocusPreview: false,
        focusPreviewCard: null
      });
    });
  },

  handleDetailPreviewImageError() {
    const detail = this.data.currentDetail || {};
    if (!detail.previewCard || !detail.image) {
      return;
    }
    this.setData({
      currentDetail: Object.assign({}, detail, {
        previewCard: null
      })
    });
  },

  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      showFocusPreview: false,
      focusPreviewCard: null
    });
  },

  previewModalImage(e) {
    const url = e.currentTarget.dataset.url || '';
    if (!url) {
      return;
    }
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },

  previewDetailPreviewCard() {
    const detail = this.data.currentDetail || {};
    const card = detail.previewCard;
    if (!card || !card.source) {
      return;
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: Object.assign({}, card, {
        title: card.title || detail.modalTitle || detail.title || '',
        summary: card.summary || detail.note || detail.modalIntro || ''
      })
    });
  },

  previewDetailFocusCard(e) {
    const detail = this.data.currentDetail || {};
    const index = Number(e.currentTarget.dataset.focusIndex || 0);
    const card = Array.isArray(detail.focusCards) ? detail.focusCards[index] : null;
    if (!card) {
      return;
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: card
    });
  },

  previewDetailBlockFocusCard(e) {
    const detail = this.data.currentDetail || {};
    const blockIndex = Number(e.currentTarget.dataset.blockIndex || 0);
    const focusIndex = Number(e.currentTarget.dataset.focusIndex || 0);
    const blocks = Array.isArray(detail.blocks) ? detail.blocks : [];
    const block = blocks[blockIndex] || {};
    const card = Array.isArray(block.focusCards) ? block.focusCards[focusIndex] : null;
    if (!card) {
      return;
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: card
    });
  },

  closeFocusPreview() {
    this.setData({
      showFocusPreview: false,
      focusPreviewCard: null
    });
  },

  preventBubble() {},

  askReportQuestion(e) {
    const text = e.currentTarget.dataset.text || '';
    if (!text || this.data.isAiTyping) {
      return;
    }
    this.sendTextMessage(text);
  },

  // 发送消息
  sendMessage() {
    if (!this.data.message.trim()) {
      wx.showToast({
        title: '请输入消息',
        icon: 'none'
      });
      return;
    }

    const msg = this.data.message;

    // 清空输入框
    this.setData({
      message: ''
    });

    // 发送文本消息
    this.sendTextMessage(msg);
  },

  // 发送文本消息
  sendTextMessage(text) {
    const openid = wx.getStorageSync('openid');

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 添加用户消息到列表
    this.addUserMessage(text);

    // 显示AI加载状态
    this.showAiLoading();

    this.sendOpenTextMessage(text);
  },

  async sendOpenTextMessage(text) {
    try {
      let conversationId = await this.ensureOpenConversationForMessage();
      let response;
      try {
        response = await this.postOpenTextMessage(conversationId, text);
      } catch (err) {
        if (!isConversationMissingError(err)) {
          throw err;
        }
        this.saveOpenConversationId('');
        conversationId = await this.ensureOpenConversationForMessage();
        response = await this.postOpenTextMessage(conversationId, text);
      }
      const normalized = normalizeMessageResponse(response, conversationId);
      if (normalized.conversationId) {
        this.saveOpenConversationId(normalized.conversationId);
      }
      this.addAiMessage(buildReplyText(normalized));
    } catch (err) {
      this.handleOpenAiFail('发送失败，请重试', err);
    }
  },

  postOpenTextMessage(conversationId, text) {
    return miniappOpenApi.sendMessage(conversationId, {
      message: text,
      clientMessageId: `miniapp_${Date.now()}`,
      autoFillImageContext: true
    });
  },

  // 添加用户消息
  addUserMessage(content, msgType = 'text', imageUrl = '') {
    const newMessage = {
      type: 'user',
      msgType: msgType,
      content: content,
      imageUrl: imageUrl,
      time: new Date().getTime()
    };
    this.setData({
      messageList: [...this.data.messageList, newMessage],
      showWelcome: false
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  // 添加AI消息
  addAiMessage(content, report = null) {
    // 检查是否包含"点击领取"
    const hasGiftLink = /#点击领取/.test(content);

    // 如果包含见面礼链接，拆分消息
    let messageParts = [];
    if (hasGiftLink) {
      // 查找见面礼文字
      const giftRegex = /(#点击领取[^\n#]*)/;
      const match = content.match(giftRegex);

      if (match) {
        const giftText = match[1];
        const parts = content.split(giftText);

        // 前半部分
        if (parts[0]) {
          messageParts.push({
            type: 'text',
            content: this.formatMessageContent(parts[0])
          });
        }

        // 见面礼链接部分
        messageParts.push({
          type: 'gift-link',
          content: giftText
        });

        // 后半部分
        if (parts[1]) {
          messageParts.push({
            type: 'text',
            content: this.formatMessageContent(parts[1])
          });
        }
      }
    } else {
      // 没有见面礼链接，正常格式化
      messageParts.push({
        type: 'text',
        content: this.formatMessageContent(content)
      });
    }

    const newMessage = {
      type: 'ai',
      content: content,
      hasGiftLink: hasGiftLink,
      messageParts: messageParts,
      report,
      time: new Date().getTime()
    };

    const nextIndex = this.data.messageList.length;

    this.setData({
      messageList: [...this.data.messageList, newMessage],
      isAiTyping: false
    });

    // 滚动到底部
    this.scrollToBottom();
    if (report) {
      this.scrollToMessage(nextIndex);
    }
  },

  // 格式化消息内容（处理#标签和换行）
  formatMessageContent(text) {
    let formatted = text;

    // 处理 # 标签
    formatted = formatted.replace(
      /(#[^#\n]+)/g,
      '<span style="color: #4A90E2; font-weight: 500;">$1</span>'
    );

    // 将换行符转换为 <br/>
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
  },

  // 显示AI加载状态
  showAiLoading() {
    this.setData({
      isAiTyping: true
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  // 滚动到底部
  scrollToBottom() {
    // 使用 nextTick 确保数据渲染完成后再滚动
    wx.nextTick(() => {
      // 直接滚动到一个足够大的值，确保到达底部
      wx.pageScrollTo({
        scrollTop: 999999,
        duration: 100 // 缩短动画时间，使滚动更快速流畅
      });
    });
  },

  // 显示见面礼弹窗
  scrollToMessage(index) {
    wx.nextTick(() => {
      wx.pageScrollTo({
        selector: `#msg-${index}`,
        duration: 120
      });
    });
  },

  showGiftModal() {
    this.setData({
      showGiftModal: true
    });
  },

  // 隐藏见面礼弹窗
  hideGiftModal() {
    this.setData({
      showGiftModal: false
    });
  },

  // 点击见面礼链接
  handleGiftLinkTap() {
    // 检查是否已实名
    const realInfo = wx.getStorageSync('realInfo');
    if (!realInfo || !realInfo.realname || !realInfo.mobile) {
      wx.showToast({
        title: '请先完成实名验证',
        icon: 'none'
      });
      this.setData({
        showRealNameModal: true
      });
      return;
    }

    // 已实名，直接领取礼品
    this.claimGift(realInfo.mobile);
    // wx.navigateTo({
    //   url: '/huodongpage/lfk/lfk?cardid=7',
    // })
  },

  // 领取礼品
  claimGift(phone) {
    wx.showLoading({
      title: '领取中...',
      mask: true
    });

    // 直接调用赠送接口
    this.giveFreeZheBa(phone);
  },

  // 复制消息内容
  copyMessage(e) {
    const content = e.currentTarget.dataset.content;
    if (!content) {
      return;
    }

    // 去掉HTML标签，获取纯文本
    const plainText = content.replace(/<[^>]+>/g, '').replace(/<br\/>/g, '\n');

    wx.setClipboardData({
      data: plainText,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // 输入姓名
  handleNameInput(e) {
    this.setData({
      realName: e.detail.value
    });
  },

  // 输入手机号
  handlePhoneInput(e) {
    this.setData({
      realPhone: e.detail.value
    });
  },

  // 隐私协议勾选状态变化
  onPrivacyChange(e) {
    const values = e.detail.value;
    this.setData({
      privacyAgreed: values.includes('agree')
    });
  },

  // 实名弹窗 - 一键获取手机号
  getRealPhoneNumber(e) {
    console.log('实名获取手机号回调', e);

    if (e.detail.iv && e.detail.encryptedData) {
      const openid = wx.getStorageSync('openid');

      wx.showLoading({
        title: '获取中...',
        mask: true
      });

      req({
        url: util.baseUrl + '/newapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: openid,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: (res) => {
          wx.hideLoading();
          console.log('获取手机号成功', res);

          this.setData({
            realPhone: res.data
          });
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('获取手机号失败', err);
          wx.showToast({
            title: '获取失败，请重试',
            icon: 'none'
          });
        }
      });
    } else {
      console.log('用户取消授权');
    }
  },

  // 提交实名信息
  submitRealName() {
    const {
      realName,
      realPhone,
      privacyAgreed
    } = this.data;

    if (!realName) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    if (!realPhone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(realPhone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    const openid = wx.getStorageSync('openid');


    // 第一步：设置手机号
    req({
      url: util.baseUrl + '/newapi/api/WechatUser/setmobile',
      method: 'POST',
      data: {
        openid: openid,
        mobile: realPhone
      },
      success: () => {
        // 第二步：设置实名信息
        req({
          url: util.baseUrl + '/newapi/api/WechatUser/setrealnamecard',
          method: 'POST',
          data: {
            openid: openid,
            realname: realName,
            cardno: '' // 身份证号选填，这里为空
          },
          success: () => {
            // 第三步：获取用户信息并保存
            req({
              url: util.baseUrl + '/newapi/api/WechatUser/getuserinfo',
              data: {
                openid: openid
              },
              success: (res) => {

                if (res.data && res.data.data) {
                  // 保存实名信息到本地
                  wx.setStorageSync('realInfo', {
                    ...wx.getStorageSync('realInfo'),
                    ...res.data.data
                  });
                }

                // 关闭弹窗
                this.setData({
                  showRealNameModal: false
                });

                wx.showToast({
                  title: '实名成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                console.error('获取用户信息失败', err);
                wx.showToast({
                  title: '实名失败，请重试',
                  icon: 'none'
                });
              }
            });
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('设置实名信息失败', err);
            wx.showToast({
              title: '实名失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('设置手机号失败', err);
        wx.showToast({
          title: '实名失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 获取手机号（领取见面礼用）
  getPhoneNumber(e) {
    console.log('获取手机号回调', e);

    if (e.detail.iv && e.detail.encryptedData) {
      wx.showLoading({
        title: '处理中...',
        mask: true
      });

      // 第一步：解密手机号
      req({
        url: util.baseUrl + '/aiapi/api/WechatUser/getwxmobile',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid'),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: wx.getStorageSync('sessionKey')
        },
        success: (res) => {
          console.log('解密手机号成功', res.data);

          if (res.data && res.data.data) {
            // 第二步：调用赠送接口
            this.giveFreeZheBa(res.data.data);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '获取手机号失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('解密手机号失败', err);
          wx.hideLoading();
          wx.showToast({
            title: '获取手机号失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 用户拒绝授权
      console.log('用户拒绝授权手机号');
    }
  },

  // 调用赠送折扣接口
  giveFreeZheBa(phone) {
    const openid = wx.getStorageSync('openid');

    req({
      url: util.baseUrl + '/newapi/api/card/givefreezheba',
      method: 'POST',
      data: {
        openid: openid,
        phone: phone,
        money: 0,
        shareopenid: '',
        xinmin: ''
      },
      success: (res) => {
        console.log('赠送成功', res);
        wx.hideLoading();

        if (res.data && res.data.status) {
          // 成功
          wx.showModal({
            title: '领取成功',
            content: res.data.data || '恭喜您成功领取见面礼！',
            showCancel: false,
            complete: () => {
              // 跳转到我的卡券页面
              wx.navigateTo({
                url: '/subpackages/mycard/mycard'
              });
            }
          });
        } else {
          // 失败
          wx.showModal({
            title: '提示',
            content: res.data.msg || res.data.data || '领取失败，请稍后重试',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('赠送失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '领取失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI面诊 - 让小慧为你量身定制变美计划',
      path: 'subD/diagnosis/diagnosis'
    };
  }
});
