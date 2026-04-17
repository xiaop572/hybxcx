// subpackagesC/fuzhibaogao/fuzhibaogao.js

// ---- 将 API sub_item 转换为页面 detail 格式 ----
function parseSubItem(sub) {
  const d = sub.data || {}
  let tags = [], type = 'tags', chart = null

  if (d.oil_zones && Array.isArray(d.oil_zones)) {
    tags = d.oil_zones.map(z => ({ label: z, color: '#ff9500' }))
  } else if ('moisture_level' in d) {
    const lvMap = { '干燥': 15, '偏干': 30, '适中': 60, '偏湿': 78, '湿润': 90 }
    return {
      title: sub.name, subtitle: sub.image_description, tags: [],
      type: 'range', rangeMin: '干燥', rangeMax: '湿润',
      rangeVal: lvMap[d.moisture_level] !== undefined ? lvMap[d.moisture_level] : 55,
      text: sub.analysis, image: ''
    }
  } else if ('uniformity_level' in d) {
    tags = [{ label: d.uniformity_level, color: '#ff6b35' }]
  } else if (d.dull_zones && Array.isArray(d.dull_zones)) {
    tags = d.dull_zones.map(z => ({ label: z, color: '#888' }))
  } else if ('sensitivity_level' in d) {
    tags = [{ label: d.sensitivity_level, color: '#7C5CF6' }]
  } else if ('acne_marks' in d) {
    tags = [
      { label: '痘印', value: d.acne_marks || 0, color: '#ff4757' },
      { label: '丘疹', value: d.papules || 0, color: '#ff9500' },
      { label: '粉刺', value: d.comedones || 0, color: '#ff6b9d' },
      { label: '结节', value: d.nodules || 0, color: '#7C5CF6' }
    ]
  } else if ('blackhead_count' in d) {
    tags = [{ label: '黑头', value: d.blackhead_count, color: '#333' }]
  } else if ('pore_count' in d) {
    tags = [{ label: '毛孔', value: d.pore_count, color: '#ff6b35' }]
  } else if (d.wrinkle_distribution) {
    type = 'chart'
    tags = [
      { label: '粗纹', value: d.coarse_wrinkles || 0, color: '#7C5CF6', dash: true },
      { label: '细纹', value: d.fine_wrinkles || 0, color: '#aaa', dash: true }
    ]
    const sevMap = { '无': 0, '轻度': 1, '中度': 2, '重度': 3 }
    chart = {
      levels: ['重度', '中度', '轻度'],
      bars: d.wrinkle_distribution.map(w => ({ label: w.area, value: sevMap[w.severity] || 0 }))
    }
  } else {
    tags = [{ label: sub.indicator_label || '', color: '#7C5CF6' }]
  }

  return { title: sub.name, subtitle: sub.image_description, tags, type, text: sub.analysis, image: '', ...(chart ? { chart } : {}) }
}

const MOCK_REPORT = {
  title: '潜力之星',
  modalTitle: '皮肤质量解读结果',
  modalSubtitle: 'AI智能异常指标分析',
  skinAge: 25,
  skinType: '中性',
  summary: '您的皮肤状态整体表现优秀，特别在光滑度和衰老度方面尤为突出，但在水油度和黑眼圈问题上需要关注。建议优先使用含水杨酸的产品调理皮脂分泌，并搭配维生素C的眼霜改善黑眼圈，逐步恢复肌肤平衡。',
  totalScore: 90,
  items: [
    {
      name: '水油度', score: 70, desc: '皮肤油性区域和水分程度', icon: '💧',
      details: [
        { title: '油光', subtitle: '图片颜色代表油性区域', tags: [{ label: '油性区域', color: '#ff9500' }], type: 'tags', text: '皮肤油脂分泌较多，适当使用含水杨酸的洁面产品。', image: '' },
        { title: '水分', subtitle: '图片颜色深浅代表水分程度', tags: [], type: 'range', rangeMin: '干燥', rangeMax: '湿润', rangeVal: 60, text: '皮肤水分处于适中水平，保持日常补水习惯即可。', image: '' }
      ]
    },
    {
      name: '肤色', score: 89, desc: '根据肤质肤色均匀度分布', icon: '🎨',
      details: [
        { title: '均匀度', subtitle: '图片颜色代表肤色均匀程度', tags: [{ label: '轻微不均', color: '#ff6b35' }], type: 'tags', text: '肤色整体均匀，局部轻微色差，搭配烟酰胺精华改善。', image: '' },
        { title: '暗沉', subtitle: '图片颜色深浅代表暗沉程度', tags: [{ label: 'T区', color: '#888' }, { label: '脸颊', color: '#888' }], type: 'tags', text: '定期温和去角质加速代谢，配合防晒改善暗沉。', image: '' }
      ]
    },
    {
      name: '敏感度', score: 82, desc: '根据皮肤敏感程度评估分布', icon: '🛡️',
      details: [
        { title: '敏感区域', subtitle: '图片颜色深浅代表了皮肤敏感程度', tags: [{ label: '轻微', color: '#7C5CF6' }], type: 'tags', text: '皮肤耐受性良好，可以正常使用功效类护肤产品。', image: '' }
      ]
    },
    {
      name: '光滑度', score: 96, desc: '粗糙、毛孔、瑕疵清晰度', icon: '✨',
      details: [
        { title: '痘痘', subtitle: '图片点位代表对应瑕疵', tags: [{ label: '痘印', value: 0, color: '#ff4757' }, { label: '丘疹', value: 0, color: '#ff9500' }, { label: '粉刺', value: 3, color: '#ff6b9d' }, { label: '结节', value: 0, color: '#7C5CF6' }], type: 'tags', text: '无明显痘痘问题，日常注意清洁维持无痘状态。', image: '' },
        { title: '黑头', subtitle: '图片点位代表黑头位置', tags: [{ label: '黑头', value: 4, color: '#333' }], type: 'tags', text: '鼻翼少量黑头，每周使用水杨酸棉片擦拭出油区域。', image: '' },
        { title: '毛孔', subtitle: '图片点位代表毛孔位置', tags: [{ label: '毛孔', value: 37, color: '#ff6b35' }], type: 'tags', text: '可见毛孔较多，搭配控油精华调理皮脂改善出油型毛孔。', image: '' }
      ]
    },
    {
      name: '衰老度', score: 93, desc: '皱纹、松弛等衰老表现', icon: '⏱️',
      details: [
        {
          title: '皱纹', subtitle: '图片线条代表皱纹位置',
          tags: [{ label: '粗纹', value: 1, color: '#7C5CF6', dash: true }, { label: '细纹', value: 7, color: '#aaa', dash: true }],
          type: 'chart', text: '衰老程度符合当前年龄，尽早使用抗氧化精华预防纹路加深。', image: '',
          chart: { levels: ['重度', '中度', '轻度'], bars: [{ label: '嘴角纹', value: 0 }, { label: '眼部纹', value: 1 }, { label: '法令纹', value: 1 }, { label: '鱼尾纹', value: 0 }] }
        }
      ]
    }
  ],
  top_concerns: [
    { concern: '油脂分泌旺盛', priority: 1, suggestion: '使用含水杨酸的洁面产品每日清洁出油区域，每周1-2次用水杨酸棉片擦拭T区，避免油脂堵塞毛孔。' },
    { concern: '毛孔粗大、少量黑头', priority: 2, suggestion: '搭配烟酰胺精华调理皮脂，后续用清爽的保湿乳液补水，帮助调节水油平衡改善出油型毛孔。' },
    { concern: '肤色暗沉不均', priority: 3, suggestion: '每日做好防晒，夜间可以使用维生素C类精华帮助提亮肤色，改善局部暗沉。' }
  ],
  recommended_ingredients: [
    { ingredient: '水杨酸', purpose: '溶解油脂、疏通毛孔、改善黑头和出油情况', usage_time: '夜间', product_type: '洁面、棉片' },
    { ingredient: '烟酰胺', purpose: '调理皮脂分泌、提亮肤色、改善肤色不均', usage_time: '日夜均可', product_type: '精华、乳液' },
    { ingredient: '神经酰胺', purpose: '维护皮肤屏障、避免清洁后水分流失', usage_time: '日夜均可', product_type: '乳液、面霜' }
  ],
  aiRecommend: '你的肌肤需要适当调养，建议补水滋养并适当休息,小慧已为你找到了适合的商品，你愿意看看吗？'
}

Page({
  data: {
    report: {},
    showModal: false,
    activeTab: 0,
    radarPx: 280,
    radarRpx: 560,
    radarLabels: [],
    radarImagePath: ''
  },

  onLoad(options) {
    this.imagePath = options.imagePath || ''
    this.loadReport()
  },

  loadReport() {
    const rawResp = wx.getStorageSync('rawApiResponse')
    wx.removeStorageSync('rawApiResponse')

    console.log('[fuzhibaogao] rawResp类型:', typeof rawResp, ' 存在:', !!rawResp)

    if (!rawResp) {
      console.warn('[fuzhibaogao] 无接口数据，使用 MOCK')
      this.setData({ report: MOCK_REPORT })
      return
    }

    try {
      // 第1层：外层 res.data（可能是字符串）
      let resData = rawResp
      if (typeof resData === 'string') resData = JSON.parse(resData)
      console.log('[fuzhibaogao] resData.status:', resData.status)

      // 第2层：resData.data.Response（接口返回的核心 JSON 字符串）
      const inner = resData.data
      if (!inner) throw new Error('resData.data 为空')

      let parsed = inner.Response
      if (!parsed) throw new Error('inner.Response 为空')
      if (typeof parsed === 'string') parsed = JSON.parse(parsed)
      console.log('[fuzhibaogao] parsed keys:', Object.keys(parsed))

      // 第3层：新版接口把数据包在 parsed.report 里
      const r = parsed.report || parsed
      console.log('[fuzhibaogao] r.level_title:', r.level_title, ' r.overall_score:', r.overall_score)

      // ---- 将 dimensions.sub_items 转换为 items.details ----
      const ICON_MAP = { '水油度': '💧', '肤色': '🎨', '敏感度': '🛡️', '光滑度': '✨', '衰老度': '⏱️' }
      const items = (r.dimensions || []).map(dim => {
        const mockItem = MOCK_REPORT.items.find(m => m.name === dim.name) || {}
        const details = (dim.sub_items || []).map(parseSubItem)
        return {
          name:    dim.name,
          score:   dim.score,
          desc:    dim.description || mockItem.desc || '',
          icon:    ICON_MAP[dim.name] || mockItem.icon || '',
          details: details.length ? details : (mockItem.details || [])
        }
      })

      const report = Object.assign({}, MOCK_REPORT, {
        title:                  r.level_title                         || MOCK_REPORT.title,
        modalTitle:             r.title                               || MOCK_REPORT.modalTitle,
        modalSubtitle:          r.subtitle                            || MOCK_REPORT.modalSubtitle,
        skinAge:                r.skin_age                            || MOCK_REPORT.skinAge,
        skinType:               r.skin_type                          || MOCK_REPORT.skinType,
        summary:                r.overall_summary || r.overall_analysis || MOCK_REPORT.summary,
        totalScore:             r.overall_score  || r.total_score    || MOCK_REPORT.totalScore,
        items:                  items.length ? items                 : MOCK_REPORT.items,
        top_concerns:           r.top_concerns                        || MOCK_REPORT.top_concerns,
        recommended_ingredients: r.recommended_ingredients            || MOCK_REPORT.recommended_ingredients
      })

      console.log('[fuzhibaogao] 最终 title:', report.title, ' totalScore:', report.totalScore)
      this.setData({ report })
    } catch (e) {
      console.error('[fuzhibaogao] 解析失败:', e.message)
      this.setData({ report: MOCK_REPORT })
    }
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item
    wx.showToast({ title: item.name + ' ' + item.score + '分', icon: 'none' })
  },

  goFullReport() {
    const sys = wx.getSystemInfoSync()
    // 雷达图画布尺寸：560rpx 转 px
    const radarPx   = Math.round(sys.windowWidth * 560 / 750)
    const radarRpx  = 560

    // 5个顶点标签绝对位置（rpx），从顶部开始顺时针
    // 容器 560rpx，center = 280rpx，maxR ≈ 560*0.32 = 179rpx
    const cx = 280, cy = 280, maxR = 179
    const labels = this.data.report.items.map((item, i) => {
      const angle  = -Math.PI / 2 + i * (Math.PI * 2 / 5)
      const labelR = maxR + 60
      const x = cx + labelR * Math.cos(angle)
      const y = cy + labelR * Math.sin(angle)
      let align = 'center'
      if (Math.cos(angle) < -0.3) align = 'right'
      else if (Math.cos(angle) > 0.3) align = 'left'
      // 根据对齐方式设置 left 偏移（标签宽约 130rpx）
      const offsetX = align === 'right' ? -130 : align === 'left' ? 0 : -65
      // 标签高约 40rpx，垂直居中
      return { name: item.name, score: item.score, lx: Math.round(x + offsetX), ly: Math.round(y - 22), align }
    })

    this.setData({
      showModal: true,
      activeTab: 0,
      radarPx,
      radarRpx,
      radarLabels: labels,
      radarImagePath: ''   // 先清空，等绘制完再转图片
    })

    // 等 canvas 渲染后绘制，绘制完转图片
    setTimeout(() => { this.drawRadar(radarPx) }, 150)
  },

  closeModal() {
    this.setData({ showModal: false, radarImagePath: '' })
  },

  switchTab(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ activeTab: idx })
    // 滚动到对应 section
    this.setData({ scrollToId: 'metric-' + idx })
  },

  // ---- 雷达图绘制 ----
  drawRadar(size) {
    const ctx   = wx.createCanvasContext('radarCanvas', this)
    const cx    = size / 2
    const cy    = size / 2
    const maxR  = size * 0.32
    const n     = 5
    const step  = (Math.PI * 2) / n
    const start = -Math.PI / 2
    const scores = this.data.report.items.map(i => i.score / 100)

    // 背景网格（5层）
    for (let lv = 1; lv <= 5; lv++) {
      const r = maxR * lv / 5
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const a = start + i * step
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.setStrokeStyle('rgba(160, 140, 220, 0.20)')
      ctx.setLineWidth(1)
      ctx.stroke()
    }

    // 轴线
    for (let i = 0; i < n; i++) {
      const a = start + i * step
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a))
      ctx.setStrokeStyle('rgba(160, 140, 220, 0.20)')
      ctx.setLineWidth(1)
      ctx.stroke()
    }

    // 数据多边形（填充）
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const a = start + i * step
      const r = maxR * scores[i]
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
              : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
    }
    ctx.closePath()
    ctx.setFillStyle('rgba(124, 92, 246, 0.22)')
    ctx.setStrokeStyle('#7C5CF6')
    ctx.setLineWidth(2)
    ctx.fill()
    ctx.stroke()

    // 顶点小圆点
    for (let i = 0; i < n; i++) {
      const a = start + i * step
      const r = maxR * scores[i]
      ctx.beginPath()
      ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), size * 0.018, 0, Math.PI * 2)
      ctx.setFillStyle('#7C5CF6')
      ctx.fill()
    }

    // 绘制完成后转图片，替换 canvas（解决 scroll-view 内 canvas 抖动问题）
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'radarCanvas',
        x: 0, y: 0,
        width: size, height: size,
        destWidth: size * 2, destHeight: size * 2,
        success: res => { this.setData({ radarImagePath: res.tempFilePath }) },
        fail: () => {}
      }, this)
    })
  }
})
