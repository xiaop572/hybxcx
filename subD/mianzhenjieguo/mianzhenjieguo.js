const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAIAAAAxBA+LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFt0lEQVR4nO3VMQEAAAjDMMC/5yFjRxMFfXpnZgYA4G8JWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJeAItUdUC+qBgAAAABJRU5ErkJggg=='
const TTS_CHUNK_BYTES = 180
const TTS_RETRY_LIMIT = 1
const TTS_NEXT_CHUNK_DELAY = 250
let ttsPlugin

const ORIGINAL_IMAGE_URL = 'https://wx.pmc-wz.com/materials/mx1yt.jpg'
const MOLE_OVERVIEW_URL = 'https://wx.pmc-wz.com/materials/2痣识别参考示意图.png'
const MOUTH_MOLE_URL = 'https://wx.pmc-wz.com/materials/3口周色素痣放大图.png'
const JAW_MOLE_URL = 'https://wx.pmc-wz.com/materials/4下颌缘色素痣放大图.png'
const AESTHETIC_CARD_URL = 'https://wx.pmc-wz.com/materials/5美容整形参考示意图.png'
const AESTHETIC_IMAGE_URL = 'https://wx.pmc-wz.com/materials/6美容整形参考示意图.png'
const AESTHETIC_CHIN_URL = 'https://wx.pmc-wz.com/materials/7下庭局部放大.png'
const AESTHETIC_CONTOUR_URL = 'https://wx.pmc-wz.com/materials/8面部轮廓局部放大.png'
const AESTHETIC_NOSE_URL = 'https://wx.pmc-wz.com/materials/9鼻部局部放大细节.png'
const AESTHETIC_AXIS_URL = 'https://wx.pmc-wz.com/materials/10面部中轴局部放大.png'

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

function normalizeSpeechText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/[#*_`~>\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getUtf8Bytes(value) {
  return unescape(encodeURIComponent(value || '')).length
}

function splitByUtf8Bytes(value, maxBytes) {
  const chunks = []
  let current = ''
  String(value || '').split('').forEach(char => {
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
      splitByUtf8Bytes(sentence, TTS_CHUNK_BYTES).forEach(item => chunks.push(item))
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

const UI = {
  heroTitle: '面部分析结果',
  heroSubtitle: '智能识别面部、皮肤、美容整形等问题',
  overallTitle: '总结分析',
  stop: '停止',
  speak: '朗读',
  drilldownTitle: '68 点位延展解读',
  drilldownSubtitle: '已从当前结果中展开原图、痣识别参考示意图和美容整形参考示意图；局部图先用占位图展示，文字来自皮肤评估文档。',
  chatTitle: '接下来你可以继续这样问',
  chatTips: '下面这些问题来自皮肤评估文档，点击后会展示写死的静态回答。',
  quickQuestionTip: '点击任意一个问题，会自动展示对应的静态追问回答。',
  me: '我',
  assistant: '慧',
  remove: '移除',
  attachImage: '配图',
  inputPlaceholder: '继续问我，也可以配图一起发',
  sending: '发送中…',
  send: '发送',
  close: '×',
  focusTitle: '局部放大图',
  refsLabel: '参考点位：',
  consultLabel: '可咨询方向：',
  tipLabel: '提示：',
  scrollMore: '下滑更多'
}

const REPORT = {
  title: '面部分析结果',
  subtitle: '静态面诊报告',
  overallIntro: '从整体面部条件来看，您的面部骨相基础较好，五官端正大气，主要问题集中在面部轮廓线条、下庭比例、鼻部立体度、中轴线对称度及局部色素痣及色斑等几方面，整体属于轻中度精致度缺失问题，无严重骨性缺陷，通过针对性微创医美调整，即可实现面部线条流畅、五官比例协调的优化效果。',
  overallSections: [
    {
      index: '01',
      title: '识别判断',
      content: '经全面面诊识别，您下颌缘外轮廓线条模糊，存在软组织轻微松弛堆积，上镜线条不够利落；下庭下巴长度偏短，唇颏衔接平缓，下半张脸比例稍局促；鼻部鼻尖支撑不足、鼻头圆钝，鼻翼略宽，中庭立体度偏弱；面部中轴线存在轻微偏移，鼻唇颏垂直线条协调性不足；同时口周、下颌缘区域存在色斑与色素痣，处于易摩擦部位，存在健康隐患且影响皮肤整洁度。'
    },
    {
      index: '02',
      title: '治疗方案',
      content: '结合您的面部情况，定制综合微创改善方案：采用紧致提升项目收紧下颌缘软组织，强化外轮廓线条；通过玻尿酸注射微调延长下巴，优化唇颏衔接比例；行鼻尖塑形 + 轻微鼻翼调整，提升鼻部立体感；微调矫正面部中轴线偏斜问题；使用精准激光祛除口周及下颌缘色素痣，规避健康风险，整体以自然微调为主，不改变原生面部辨识度。'
    },
    {
      index: '03',
      title: '生活建议',
      content: '日常需严格做好全脸防晒，减少紫外线对皮肤及色素痣的刺激；避免频繁摩擦、触碰口周及下颌缘的痣，剃须时刻意避开对应部位；规律作息，减少熬夜，延缓面部软组织松弛；减少夸张的面部表情，维护面部紧致状态；做好基础面部清洁保湿，维持皮肤健康状态。'
    },
    {
      index: '04',
      title: '预测建议',
      content: '按此方案完成调整后，您的下颌缘线条会变得利落清晰，面部紧致感显著提升；下庭比例协调匀称，鼻型立体精致，面部中轴线规整对称，五官分布更均衡；同时色素瑕疵完全消除，下半张脸干净清爽，整体上镜效果大幅优化，面部干练精致感提升，整体效果自然贴合原生气质，无明显医美痕迹。'
    }
  ]
}

function createPoint(index, left, top, active) {
  return {
    index,
    active: !!active,
    style: `left:${left}%;top:${top}%;`,
    labelStyle: ''
  }
}

function buildPreviewCard(activePoints) {
  return {
    source: PLACEHOLDER_IMAGE,
    frameStyle: 'padding-top:100%;',
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points: [],
    boxes: []
  }
}

function buildFocusCard(item) {
  return Object.assign({}, item, {
    source: item.source || PLACEHOLDER_IMAGE,
    frameStyle: 'padding-top:100%;',
    imageStyle: 'width:100%;height:100%;left:0;top:0;',
    points: [],
    boxes: []
  })
}

const MOLE_FOCUS_SOURCE = [
  {
    key: 'mouth_mole',
    title: '口周色素痣',
    source: MOUTH_MOLE_URL,
    summary: '问题：您下唇旁口周位置的色素痣，处于面部日常活动频繁区域，说话、进食时易反复摩擦刺激，易出现色素加重、痣体增大的情况，同时口周有痣会让下半张脸皮肤显得杂乱，降低面部清爽精致感。 解决：可采用二氧化碳激光祛除，术后做好局部清洁与防晒，规避摩擦带来的刺激风险，让口周皮肤更干净，优化面部整体观感。',
    refs: [54]
  },
  {
    key: 'jaw_mole',
    title: '下颌缘色素痣',
    source: JAW_MOLE_URL,
    summary: '问题：您下颌缘处的这颗色素痣，处于下颌线条关键位置，日常剃须、面部动作易产生摩擦刺激，长期可能诱发痣细胞活跃，同时会打断下颌缘流畅线条，削弱下半张脸的轮廓利落感。 解决：建议通过激光方式安全祛除，术后做好创面养护，消除健康隐患的同时，让下颌缘线条更规整流畅，提升面部轮廓精致度。',
    refs: [5, 7]
  }
]

const AESTHETIC_FOCUS_SOURCE = [
  {
    key: 'chin',
    title: '下庭局部放大',
    source: AESTHETIC_CHIN_URL,
    summary: '从下庭局部放大细节来看，问题结合 7、9、11 号点位检测，主要是口周和下庭衔接过渡不够柔和，下巴长度偏短，唇颏之间的比例协调性不足，面下部立体感偏弱；解决可通过玻尿酸或假体隆下巴，适度延长下巴长度、优化唇颏间距，同时柔和口周衔接线条，以此调整面下部比例，提升整体面部精致度与协调感。',
    refs: [7, 9, 11]
  },
  {
    key: 'jawline',
    title: '轮廓局部放大',
    source: AESTHETIC_CONTOUR_URL,
    summary: '从您面部轮廓局部放大来看，问题 结合5、7、9、11、13 号轮廓点位，主要是下颌缘线条不够清晰利落，面部外轮廓衔接柔和，下颌区域软组织有轻微松弛堆积，上镜时下颌线条模糊，面部立体精致感不足。解决可针对性做下颌缘紧致提升，收紧下颌及颈部松弛软组织，强化外轮廓与下颌缘的线条平衡，让上镜轮廓线条更利落流畅，优化面部紧致度，提升整体上镜精致感。',
    refs: [5, 7, 9, 11, 13]
  },
  {
    key: 'nose',
    title: '鼻部局部放大',
    source: AESTHETIC_NOSE_URL,
    summary: '从您鼻部局部放大细节来看，问题结合28、32、34、36 号点位，主要是鼻尖支撑力不足，鼻头偏圆钝，鼻翼略宽，鼻背到鼻尖的立体线条不够流畅，中庭五官精致度偏弱，拉低了面部整体立体感。解决可通过鼻尖塑形强化支撑力，配合轻微收窄鼻翼，优化鼻背与鼻尖的衔接弧度，打造立体利落的鼻型，提升中庭精致感，让面部五官比例更协调。',
    refs: [28, 32, 34, 36]
  },
  {
    key: 'axis',
    title: '面部中轴局部放大',
    source: AESTHETIC_AXIS_URL,
    summary: '从您面部中轴局部放大细节来看，问题结合28、34 号点位，主要是面部中轴线存在轻微偏移，鼻梁到唇周的垂直线条不够顺直，鼻、唇、下巴的中轴线衔接协调性不足，两侧面部细微不对称，削弱了面部整体端正大气的观感。解决可针对性微调鼻梁中轴线，矫正轻微偏斜问题，优化鼻唇颏的垂直衔接关系，强化面部中轴线的规整度，让五官分布更对称均衡，提升整体面部端正感。',
    refs: [28, 34]
  }
]

const QUICK_ANSWERS = {
  '我想了解祛痣和轮廓提升项目可以同时做吗？顺序怎么安排更安全？': '这两个项目是可以联合规划的，根据需求及治疗目是否有创安排先后顺序，如抗衰需求强烈的可以先光电抗衰，最好间隔2周及一个月以上。但有明确的先后顺序，因为面部提升作用于面部深层组织，做完后皮肤即刻会有收紧提升，轻微泛红，数小时后泛红可消退。若先祛痣，至少间隔1个月以上，祛痣后新生皮肤可能不耐受光电刺激；另外口周的痣治疗后一周内注意创面修复，',
  '玻尿酸垫下巴和鼻尖塑形，会不会显得很假？能维持多久？': '结合你的面部基础，完全可以做到自然不假的效果。我们会采用少量多点精细化注射的方式，针对你下巴偏短、唇颏衔接平缓的问题，只做适度延长，不夸张加长；鼻尖塑形侧重强化鼻尖支撑力、轻微收窄鼻翼，不盲目垫高鼻梁，贴合你原生五官的比例，只优化立体度，不改变个人辨识度，上镜自然、日常也不突兀。 维持时长方面，垫下巴选择大分子玻尿酸，支撑力强，维持周期约 12~18 个月；鼻尖塑形使用中小分子玻尿酸，质地细腻贴合，维持约 10~12 个月，后期会随人体正常代谢慢慢吸收，不会残留硬块。如果后期想长期维持，也可以后续考虑假体下巴、综合鼻整形的方式。',
  '我日常剃须、吃饭总刺激到痣，有没有暂时的防护办法？不祛痣的话风险大吗？': '术后一周避免沾水，可用生理盐水清洁创面，外用抗生素乳膏及生长因子等促进组织修复，，有痂自然脱落，勿抠抓，结痂一般7-10天脱落，清淡饮食，注意防晒。针对下颌缘、口周的痣，剃须时尽量避开痣体区域，改用电动剃须刀或剪刀轻柔处理周边胡须；吃饭、说话时虽无法完全避免，但日常可以减少频繁用手触摸、抠挠痣体，出门做好面部防晒，紫外线会加重痣的色素沉着，同时加速痣细胞活跃。 其次关于风险，你这两颗痣属于交界痣 ，一般风险不高，如果短期内痣的颜色、大小、形态发生变化，建议及早治疗，注意观察即可，减少摩擦刺激。从医美角度，可激光祛除。'
}

function createDetailSection(section) {
  if (section.key === 'mole' || section.key === 'aesthetic') {
    const focusCards = (section.focusCards || []).map(buildFocusCard)
    return {
      key: section.key,
      title: section.title,
      modalTitle: section.title,
      modalIntro: section.note,
      previewCard: section.previewCard,
      image: section.src,
      focusTitle: section.key === 'mole' ? '痣局部放大图' : '美容局部放大图',
      focusCards,
      blocks: []
    }
  }

  return {
    key: section.key,
    title: section.title,
    modalTitle: section.title,
    modalIntro: section.note,
    image: section.src,
    focusTitle: '',
    focusCards: [],
    blocks: [
      {
        title: section.title,
        desc: section.note,
        images: []
      }
    ]
  }
}

const VISUAL_DETAIL_SECTIONS = [
  {
    key: 'skin',
    eyebrow: 'ORIGINAL',
    title: '原图',
    src: ORIGINAL_IMAGE_URL,
    note: '这张图主要用于观察整体面部轮廓、五官比例及面部整体形态，结合肤色情况，适合从医美整形角度对整体状态与优化重点做初步判断。',
    previewCard: null,
    focusCards: [],
    galleryImages: [{ title: '原图', src: ORIGINAL_IMAGE_URL }]
  },
  {
    key: 'skin_status',
    eyebrow: 'SKIN',
    title: '皮肤图',
    src: ORIGINAL_IMAGE_URL,
    note: '整体皮肤基础状态较好，肤色不均，目前存在T区毛孔略明显、局部见褐色斑片，散在分布的少量色素痣可按需选择处理，日常建议做好温和清洁与硬防晒，有进阶改善需求可到院做更全面的肤质检测面诊。',
    disableModal: true,
    previewCard: null,
    focusCards: [],
    galleryImages: [{ title: '皮肤图', src: ORIGINAL_IMAGE_URL }]
  },
  {
    key: 'mole',
    eyebrow: 'MOLE',
    title: '痣识别参考示意图',
    src: MOLE_OVERVIEW_URL,
    note: '这张图用于查看痣目标命中位置；下方 2 张局部图已准备好，可继续查看局部命中区域。',
    previewCard: Object.assign(buildPreviewCard([54, 5, 7]), { source: MOLE_OVERVIEW_URL }),
    focusCards: MOLE_FOCUS_SOURCE,
    galleryImages: [{ title: '痣识别参考示意图', src: MOLE_OVERVIEW_URL }]
  },
  {
    key: 'aesthetic',
    eyebrow: 'AESTHETIC',
    title: '美容整形参考示意图',
    src: AESTHETIC_IMAGE_URL,
    note: '此图为美容整形参考示意图，用于定位医美整形重点建议关联区域；下方 4 张局部细节图，基于 68 点关键点位图实时生成。',
    previewCard: Object.assign(buildPreviewCard([7, 9, 11, 28, 32, 34, 36]), { source: AESTHETIC_IMAGE_URL }),
    focusCards: AESTHETIC_FOCUS_SOURCE,
    galleryImages: [{ title: '美容整形参考示意图', src: AESTHETIC_IMAGE_URL }]
  }
]

Page({
  data: {
    ui: UI,
    report: REPORT,
    conversationId: '',
    displayImage: ORIGINAL_IMAGE_URL,
    hasImage: true,
    imageLabel: '面诊照片',
    imageHint: '点击查看大图',
    chatMessages: [],
    draftText: '',
    pendingImage: '',
    canSendChat: false,
    imageEchoList: [
      {
        title: '原图',
        image: ORIGINAL_IMAGE_URL,
        desc: '这张图主要用于观察整体面部轮廓、五官比例及面部整体形态，结合肤色情况，适合从医美整形角度对整体状态与优化重点做初步判断。',
        action: 'modal'
      },
      {
        title: '点击查看面部问题',
        image: AESTHETIC_CARD_URL,
        previewCard: Object.assign(buildPreviewCard([5, 7, 54]), { source: AESTHETIC_CARD_URL }),
        desc: '下面是详细的分析图，包含痣识别参考示意图和美容整形参考示意图。',
        action: 'toggle-drilldown'
      }
    ],
    imageEchoScrollLeft: 0,
    visualDetailSections: VISUAL_DETAIL_SECTIONS,
    showVisualDrilldown: false,
    activeDetailImageIndex: 0,
    activeEchoCardIndex: 0,
    showDetailModal: false,
    currentDetail: null,
    showFocusPreview: false,
    focusPreviewCard: null,
    overallSpeechText: '',
    speakingOverall: false,
    sendingChat: false,
    quickQuestions: Object.keys(QUICK_ANSWERS),
    pageScrollTop: 0,
    scrollIntoView: ''
  },

  onLoad() {
    this.setData({
      overallSpeechText: this.buildOverallSpeechText()
    })
  },

  onUnload() {
    if (this._staticAnswerTimer) {
      clearTimeout(this._staticAnswerTimer)
      this._staticAnswerTimer = null
    }
    this.stopSpeech()
  },

  preventBubble() {},

  handleMainScroll(e) {
    this._mainScrollTop = Number((e && e.detail && e.detail.scrollTop) || 0)
  },

  buildOverallSpeechText() {
    const pieces = [REPORT.overallIntro]
    REPORT.overallSections.forEach(item => {
      pieces.push(`${item.title}：${item.content}`)
    })
    return pieces.join('\n')
  },

  toggleOverallSpeech() {
    if (this.data.speakingOverall) {
      this.stopSpeech()
      return
    }
    this.startSpeech(this.data.overallSpeechText || this.buildOverallSpeechText())
  },

  startSpeech(text) {
    const plugin = getTtsPlugin()
    const chunks = splitSpeechText(text)
    if (!plugin || !plugin.textToSpeech) {
      wx.showToast({ title: '暂不支持朗读', icon: 'none' })
      return
    }
    if (!chunks.length) {
      wx.showToast({ title: '暂无可朗读内容', icon: 'none' })
      return
    }

    this.stopSpeech()
    const speechToken = `${Date.now()}_${Math.random()}`
    this._speechToken = speechToken
    this._speechChunks = chunks
    this._speechIndex = 0
    this.setData({ speakingOverall: true })
    this.playSpeechChunk(speechToken)
  },

  scheduleSpeechChunk(speechToken, retryCount, delay) {
    if (this._speechNextTimer) {
      clearTimeout(this._speechNextTimer)
      this._speechNextTimer = null
    }
    this._speechNextTimer = setTimeout(() => {
      this._speechNextTimer = null
      if (this._speechToken === speechToken) {
        this.playSpeechChunk(speechToken, retryCount || 0)
      }
    }, delay || TTS_NEXT_CHUNK_DELAY)
  },

  skipSpeechChunk(speechToken) {
    if (this._speechToken !== speechToken) {
      return
    }
    this._speechIndex += 1
    if (this._speechIndex < this._speechChunks.length) {
      this.scheduleSpeechChunk(speechToken, 0, TTS_NEXT_CHUNK_DELAY)
      return
    }
    this.finishSpeech(speechToken)
  },

  playSpeechChunk(speechToken, retryCount) {
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
          if (this._speechToken === speechToken && (retryCount || 0) < TTS_RETRY_LIMIT) {
            this.scheduleSpeechChunk(speechToken, (retryCount || 0) + 1, 500)
            return
          }
          this.skipSpeechChunk(speechToken)
          return
        }
        this.playSpeechAudio(filename, speechToken, retryCount || 0)
      },
      fail: () => {
        if (this._speechToken !== speechToken) {
          return
        }
        if ((retryCount || 0) < TTS_RETRY_LIMIT) {
          this.scheduleSpeechChunk(speechToken, (retryCount || 0) + 1, 500)
          return
        }
        this.skipSpeechChunk(speechToken)
      }
    })
  },

  playSpeechAudio(filename, speechToken, retryCount) {
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
      this.skipSpeechChunk(speechToken)
    })
    audio.onError(() => {
      if (finished || this._speechAudio !== audio) {
        return
      }
      audio.destroy()
      this._speechAudio = null
      if (this._speechToken !== speechToken) {
        return
      }
      if ((retryCount || 0) < TTS_RETRY_LIMIT) {
        this.scheduleSpeechChunk(speechToken, (retryCount || 0) + 1, 500)
        return
      }
      this.skipSpeechChunk(speechToken)
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
    if (this._speechNextTimer) {
      clearTimeout(this._speechNextTimer)
      this._speechNextTimer = null
    }
    this._speechAudio = null
    this.setData({ speakingOverall: false })
  },

  stopSpeech() {
    if (this._speechNextTimer) {
      clearTimeout(this._speechNextTimer)
      this._speechNextTimer = null
    }
    if (this._speechAudio) {
      this._speechAudio.stop()
      this._speechAudio.destroy()
      this._speechAudio = null
    }
    this._speechToken = ''
    this._speechChunks = []
    this._speechIndex = 0
    this.setData({ speakingOverall: false })
  },

  previewImage() {
    wx.previewImage({
      current: this.data.displayImage,
      urls: [this.data.displayImage]
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

  handleImageEchoTap(e) {
    const index = Number(e.currentTarget.dataset.index || 0)
    const item = (this.data.imageEchoList || [])[index]
    if (!item || !item.image) {
      return
    }

    if (item.action === 'toggle-drilldown') {
      const nextShow = !this.data.showVisualDrilldown
      const nextActiveIndex = nextShow ? index : 0
      const nextActiveEchoCardIndex = nextShow ? index : -1
      this.scrollImageEchoTo(nextActiveIndex)
      this.scrollMainToImageEchoCard(nextActiveIndex)
      this.setData({
        showVisualDrilldown: nextShow,
        activeEchoCardIndex: nextActiveEchoCardIndex,
        activeDetailImageIndex: nextShow ? 1 : 0,
        scrollIntoView: ''
      }, () => {
        if (nextShow) {
          setTimeout(() => {
            this.scrollMainToImageEchoCard(index)
          }, 120)
        }
      })
      return
    }

    this.setData({ activeEchoCardIndex: index })
    this.scrollImageEchoTo(index)
    this.scrollMainToImageEchoCard(index)
    wx.previewImage({
      current: item.image,
      urls: [item.image]
    })
  },

  previewVisualSectionImage(e) {
    const sectionIndex = Number(e.currentTarget.dataset.sectionIndex || 0)
    const section = (this.data.visualDetailSections || [])[sectionIndex]
    if (!section || section.disableModal) {
      return
    }
    this.setData({
      activeDetailImageIndex: sectionIndex,
      currentDetail: createDetailSection(section),
      showDetailModal: true,
      showFocusPreview: false,
      focusPreviewCard: null
    })
  },

  previewVisualFocusCard(e) {
    const sectionIndex = Number(e.currentTarget.dataset.sectionIndex || 0)
    const focusIndex = Number(e.currentTarget.dataset.focusIndex || 0)
    const section = (this.data.visualDetailSections || [])[sectionIndex]
    const card = section && Array.isArray(section.focusCards) ? buildFocusCard(section.focusCards[focusIndex]) : null
    if (!card) {
      return
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: card
    })
  },

  previewDetailBlockFocusCard(e) {
    const detail = this.data.currentDetail || {}
    const card = (detail.focusCards || [])[Number(e.currentTarget.dataset.focusIndex || 0)]
    if (!card) {
      return
    }
    this.setData({
      showFocusPreview: true,
      focusPreviewCard: card
    })
  },

  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      showFocusPreview: false,
      focusPreviewCard: null,
      activeEchoCardIndex: -1
    })
  },

  closeFocusPreview() {
    this.setData({
      showFocusPreview: false,
      focusPreviewCard: null
    })
  },

  previewChatImage(e) {
    const url = e.currentTarget.dataset.url || ''
    if (!url) {
      return
    }
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  previewModalImage(e) {
    const url = e.currentTarget.dataset.url || ''
    if (!url) {
      return
    }
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  onDraftInput(e) {
    const value = (e.detail.value || '').slice(0, 300)
    this.setData({
      draftText: value,
      canSendChat: !!(value.trim() || this.data.pendingImage)
    })
  },

  askQuickQuestion(e) {
    if (this.data.sendingChat) {
      return
    }
    this.sendStaticMessage(e.currentTarget.dataset.text || '')
  },

  sendChatMessage() {
    if (this.data.sendingChat) {
      return
    }
    const text = (this.data.draftText || '').trim()
    if (!text && !this.data.pendingImage) {
      return
    }
    this.sendStaticMessage(text)
  },

  sendStaticMessage(text) {
    const now = Date.now()
    const answer = QUICK_ANSWERS[text] || '这是静态面诊结果页，当前不会请求接口。你可以基于上方报告内容继续做本地展示或后续接入真实问答。'
    const userMessage = { id: `u_${now}`, role: 'user', content: text || '查看静态报告', image: this.data.pendingImage || '' }
    const thinkingMessage = { id: `thinking_${now}`, role: 'assistant', content: '', image: '', loading: true }
    const messages = (this.data.chatMessages || []).concat([userMessage, thinkingMessage])
    this.setData({
      chatMessages: messages,
      draftText: '',
      pendingImage: '',
      canSendChat: false,
      sendingChat: true
    }, () => this.scrollChatToBottom())

    this._staticAnswerTimer = setTimeout(() => {
      const nextMessages = (this.data.chatMessages || []).filter(item => item.id !== thinkingMessage.id).concat([
        { id: `a_${now}`, role: 'assistant', content: answer, image: '' }
      ])
      this.setData({
        chatMessages: nextMessages,
        sendingChat: false
      }, () => this.scrollChatToBottom())
      this._staticAnswerTimer = null
    }, 10000)
  },

  scrollChatToBottom() {
    const last = (this.data.chatMessages || []).slice(-1)[0]
    if (!last) {
      return
    }
    this.setData({
      scrollIntoView: `msg-${last.id}`
    })
  },

  chooseChatImage() {
    wx.showToast({ title: '静态页暂不选择图片', icon: 'none' })
  },

  removePendingImage() {
    this.setData({
      pendingImage: '',
      canSendChat: !!(this.data.draftText || '').trim()
    })
  }
})

