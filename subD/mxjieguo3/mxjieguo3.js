const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAIAAAAxBA+LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFt0lEQVR4nO3VMQEAAAjDMMC/5yFjRxMFfXpnZgYA4G8JWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJWAEsASuAJeAItUdUC+qBgAAAABJRU5ErkJggg=='
const TTS_CHUNK_BYTES = 180
const TTS_RETRY_LIMIT = 1
const TTS_NEXT_CHUNK_DELAY = 250
let ttsPlugin

const ORIGINAL_IMAGE_URL = 'https://wx.pmc-wz.com/materials/b1原图.jpg'
const MOLE_OVERVIEW_URL = 'https://wx.pmc-wz.com/materials/b2痣识别参考示意图.png'
const EYE_MOLE_URL = 'https://wx.pmc-wz.com/materials/b10眼周交界痣.png'
const MOUTH_MOLE_URL = 'https://wx.pmc-wz.com/materials/b9口周交界痣.png'
const AESTHETIC_CARD_URL = 'https://wx.pmc-wz.com/materials/b3美容整形参考示意图.png'
const AESTHETIC_IMAGE_URL = 'https://wx.pmc-wz.com/materials/b4美容整形参考示意图.png'
const AESTHETIC_CHIN_URL = 'https://wx.pmc-wz.com/materials/b5下庭局部放大.png'
const AESTHETIC_CONTOUR_URL = 'https://wx.pmc-wz.com/materials/b6面部轮廓局部放大.png'
const AESTHETIC_NOSE_URL = 'https://wx.pmc-wz.com/materials/b7面部鼻部点位.png'
const AESTHETIC_AXIS_URL = 'https://wx.pmc-wz.com/materials/b8面部中轴线点位评估.png'

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
  heroTitle: '面部美学评估与综合改善方案',
  heroSubtitle: '智能识别面部、皮肤、美容整形等问题',
  overallTitle: '总结分析',
  stop: '停止',
  speak: '朗读',
  drilldownTitle: '68 点位延展解读',
  drilldownSubtitle: '已从当前结果中展开原图、皮肤图、痣识别参考示意图和美容整形参考示意图；当前文字来自面部美学评估文档。',
  chatTitle: '接下来你可以继续这样问',
  chatTips: '下面这些问题来自面部美学评估文档，点击后会展示写死的静态回答。',
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
  title: '面部美学评估与综合改善方案',
  subtitle: '静态面诊报告',
  overallIntro: '从整体面部条件来看，您五官底子较好，主要短板集中在面部立体度不足、中轴线对称性欠佳、下颌轮廓线条模糊、下庭比例失衡，同时存在两处交界痣与轻微面部色斑、软组织松弛问题，整体面部硬朗精致感不足，五官比例有较大优化空间。',
  overallSections: [
    {
      index: '01',
      title: '识别判断',
      content: '经面部点位及结构精细化识别，鼻部存在鼻根低矮、鼻尖支撑力弱、鼻翼偏宽问题；面部中轴线鼻、唇、下巴衔接线条不顺直；下颌缘软组织松弛、两侧轻微不对称，轮廓线条不清晰；下庭下巴短缩后缩，唇颏比例欠佳；眼周、口周两处交界痣，处于眨眼、说话进食的高频活动区域，易反复受到摩擦刺激，存在健康隐患，面部同时伴随散在色素斑点。'
    },
    {
      index: '02',
      title: '治疗方案',
      content: '建议采用定制化综合改善方案，鼻部实施鼻综合整形，垫高鼻根、搭建鼻尖支撑结构并内收鼻翼；矫正面部中轴线，微调鼻骨形态，搭配假体或玻尿酸精修下巴以优化唇颏比例；通过紧致提升项目收紧下颌缘松弛软组织，塑造利落轮廓；采用激光微创祛除两处交界痣，同步改善面部色素斑点，整体调整面部结构与皮肤状态。'
    },
    {
      index: '03',
      title: '生活建议',
      content: '日常务必做好全脸防晒，避免紫外线加重色斑与痣体色素沉着；减少眼周、口周痣体部位的摩擦触碰；保持规律作息，避免熬夜加速软组织松弛；可使用紧致类护肤品维护皮肤状态，配合适度运动，促进面部循环，延缓面部老化。'
    },
    {
      index: '04',
      title: '预测建议',
      content: '完成综合改善后，面部中轴线可恢复端正协调，鼻部立体精致，下颌缘线条清晰硬朗，下巴形态优化后下庭比例舒展；交界痣祛除后消除健康隐患，面部干净清爽，整体五官比例协调，视觉上更显年轻干练，男性英气感与上镜精致度会得到显著提升。'
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
    key: 'eye_junctional_mole',
    title: '眼周交界痣',
    source: EYE_MOLE_URL,
    summary: '问题：您眼周这颗为交界痣，该位置日常易受眼部活动摩擦、紫外线照射刺激，存在一定的潜在安全隐患，同时也影响眼周皮肤的干净整洁度。 解决：建议先做专业皮肤检测评估，通过精准二氧化碳激光微创祛除，创口小、恢复期短，可规避痣体潜在变化风险，让眼周肌肤更清爽利落。同时交界痣会有复发的风险，眼周皮肤较薄，热损伤易形成凹陷性疤痕。',
    refs: []
  },
  {
    key: 'mouth_junctional_mole',
    title: '口周交界痣',
    source: MOUTH_MOLE_URL,
    summary: '问题：您口周这颗交界痣，处于日常说话、进食易反复摩擦的区域，长期刺激易增加痣体异变风险，也会拉低面部下半部分的精致整洁感。 解决：可采用二氧化碳祛痣方式精准祛除，术后做好基础护理，既能消除安全隐患，也能优化口周皮肤状态，提升面部整体干净度。',
    refs: []
  }
]

const AESTHETIC_FOCUS_SOURCE = [
  {
    key: 'chin',
    title: '下庭局部放大',
    source: AESTHETIC_CHIN_URL,
    summary: '从下庭局部放大细节来看，问题：结合 7、9、11 号点位来看您的下庭及口周衔接，下巴长度稍短、后缩感明显，唇颏衔接的线条不够流畅，下庭立体感偏弱，让面部下半段缺少硬朗利落的男士轮廓感； 解决：可通过适度填充或假体延长下巴长度、优化翘度，调整唇颏之间的衔接比例，让下庭线条更舒展立体，同时完善口周与下巴的过渡，提升整体面部的端正感与英气感。',
    refs: [7, 9, 11]
  },
  {
    key: 'jawline',
    title: '轮廓局部放大',
    source: AESTHETIC_CONTOUR_URL,
    summary: '从面部轮廓局部放大细节来看，问题：通过 5、7、9、11、13 号点位观察您的面部外轮廓与下颌缘，能看出下颌缘线条不够紧致利落，两侧轮廓轻微不对称，面部软组织有轻微松弛感，整体上镜线条柔和模糊，缺少硬朗精致的线条感； 解决：可通过收紧下颌缘松弛软组织、调整两侧轮廓对称度，优化下颌线条流畅度，强化下颌骨清晰轮廓感，让面部外轮廓更紧致立体，线条利落分明，提升整体英气感与上镜效果。',
    refs: [5, 7, 9, 11, 13]
  },
  {
    key: 'nose',
    title: '鼻部局部放大',
    source: AESTHETIC_NOSE_URL,
    summary: '从面部鼻部点位细节来看，问题：从 28、32、34、36 号点位综合观察，您鼻部存在鼻根高度偏弱、鼻尖支撑力不足，鼻翼比例稍宽，整体立体度欠缺的情况，使得面部中庭精致感不足； 解决：可通过垫高鼻根强化鼻部纵向支撑，同时调整鼻尖支架结构提升鼻尖挺翘度，再精细内收优化鼻翼宽窄比例，以此平衡鼻部整体形态，让鼻子更精致立体，提升面部整体协调感。',
    refs: [28, 32, 34, 36]
  },
  {
    key: 'axis',
    title: '面部中轴局部放大',
    source: AESTHETIC_AXIS_URL,
    summary: '从面部中轴线点位评估来看，问题：结合 28、34 号点位观察您面部中轴，可见鼻中轴线轻微偏斜，鼻、唇、下巴线条衔接不够顺直，面部中轴立体度不足，整体对称精致感欠佳； 解决：可通过微调鼻骨及鼻尖形态矫正中轴偏斜，同时优化鼻唇衔接弧度，配合下巴形态精修，让面中轴线条更顺直对称，提升面部整体端正感与协调度。',
    refs: [28, 34]
  }
]

const QUICK_ANSWERS = {
  '眼周和口周的交界痣祛除后，会不会留疤？整体恢复期大概多久？': '您这两处交界痣位置虽在面部活动区，但痣体本身不大，我们采用精准二氧化碳激光微创祛除，创伤非常浅。只要术后严格做好护理，正常是不会留下明显疤痕的。一般术后红肿、灼热感数小时可消退，皮肤七天不可碰水，七天后可清水冲洗；结痂一般 7-10 天左右脱落，切勿强行撕脱及揉搓痂皮；结痂脱落后个别局部有红斑，一般 2-3 月可自行消退。口周因为说话、进食会有轻微牵拉，结痂脱落会慢 2-3 天，掉痂后前 1 个月做好防晒，避免色素反黑，1-3 个月皮肤大概能恢复平整干净，和周边肤色融为一体，几乎看不出痕迹。个别色素痣较深，祛痣后短期内有浅的凹坑，一般 2-3 个月可恢复。',
  '针对我的鼻根垫高、下巴塑形，我该选玻尿酸填充还是假体改善，哪个更适配我的面部情况？': '结合您男士的面部需求和五官基础，我更建议优先考虑假体综合改善。您鼻根偏低、鼻尖支撑力不足，下巴还有轻微后缩，假体可以从骨骼层面做长久塑形，立体感更强、形态更硬朗，贴合男士大气干练的风格，效果是终身稳定的；玻尿酸更适合短期微调，维持时间只有 1 年左右，且鼻部用量过多容易变宽、透光，男士下巴填充玻尿酸容易因日常咀嚼移位。如果您想先试效果，也可以先打少量玻尿酸感受形态，再决定是否做假体手术。',
  '我的下颌缘线条模糊、软组织松弛，具体做什么项目改善最合适？效果能维持多久？': '您属于轻度软组织松弛 + 下颌缘轮廓不清晰，不用做侵入性手术，优先推荐超声炮下颌缘专项紧致。它可以精准收紧下颌缘松弛的筋膜层，收紧多余软组织，同时提拉线条，做完当下就能看到下颌轮廓利落很多，2-3 个月达到最佳紧致效果。正常做好日常抗衰维护，单次效果可以维持 1.5-2 年；如果想效果更持久，可搭配少量溶脂改善下颌缘轻微脂肪堆积，轮廓会更清晰，后期配合作息、防晒，能延缓软组织再次松弛的速度。'
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

