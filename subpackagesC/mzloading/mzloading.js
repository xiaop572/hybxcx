// subpackagesC/mzloading/mzloading.js
const { req } = require('../../utils/request')
const util    = require('../../utils/util')

Page({
  data: {
    percent: 0,
    canvasPx: 280
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.canvasPx = Math.round(sys.windowWidth * 560 / 750)
    this.setData({ canvasPx: this.canvasPx })

    this._percent      = 0
    this._apiDone      = false   // 接口已返回
    this._animPaused   = false   // 动画已停在90%等接口
    this._navigated    = false   // 防止重复跳转
    this._timer        = null
  },

  onReady() {
    this.drawProgress(0)
    this.startAnimation()
    this.callApi()
  },

  // 动画从 0 → 90%，分段降速：
  //   0-40%  每步 400ms  → 16s
  //   40-70% 每步 700ms  → 21s
  //   70-85% 每步 1000ms → 15s
  //   85-90% 每步 1600ms → 8s
  //   合计约 60s 到达 90%，匹配接口返回时间
  startAnimation() {
    const step = () => {
      if (this._percent >= 90) {
        this._timer = null
        this._animPaused = true
        if (this._apiDone) this.finishTo100()
        return
      }
      this._percent++
      this.setData({ percent: this._percent })
      this.drawProgress(this._percent)

      let delay
      if (this._percent < 40)      delay = 400
      else if (this._percent < 70) delay = 700
      else if (this._percent < 85) delay = 1000
      else                         delay = 1600

      this._timer = setTimeout(step, delay)
    }
    this._timer = setTimeout(step, 400)
  },

  // 调用皮肤分析接口
  callApi() {
    const base64 = wx.getStorageSync('faceBase64') || ''
    const openid = wx.getStorageSync('openid') || ''

    console.log('[mzloading] callApi start, base64长度:', base64.length, 'openid:', openid)

    req({
      url: util.baseUrl + '/newapi/api/Volc/generateImagepifu',
      method: 'POST',
      timeout: 60000,
      data: {
        Question: '请详细分析这张人脸照片的皮肤状况，包括水油度、肤色、敏感度、光滑度和衰老度',
        base64,
        openid
      },
      success: res => {
        console.log('[mzloading] 接口返回 statusCode:', res.statusCode)
        console.log('[mzloading] res.data类型:', typeof res.data)
        console.log('[mzloading] res.data原始值:', typeof res.data === 'string' ? res.data.slice(0, 200) : JSON.stringify(res.data).slice(0, 200))

        // 把原始数据直接存储，让 fuzhibaogao 去解析
        // 这样即使解析失败也不会丢失原始数据
        try {
          wx.setStorageSync('rawApiResponse', res.data)
        } catch (e) {
          console.error('[mzloading] 存原始数据失败:', e.message)
        }

        this._apiDone = true
        if (this._animPaused) this.finishTo100()
      },
      fail: (err) => {
        console.error('[mzloading] 接口请求失败:', JSON.stringify(err))
        this._apiDone = true
        if (this._animPaused) this.finishTo100()
      }
    })
  },

  // 从当前进度快速走到 100%，然后跳转
  finishTo100() {
    if (this._navigated) return
    const finish = setInterval(() => {
      this._percent += 2
      if (this._percent >= 100) {
        this._percent = 100
        clearInterval(finish)
        this.setData({ percent: 100 })
        this.drawProgress(100)
        if (this._navigated) return
        this._navigated = true
        console.log('[mzloading] 准备跳转到报告页')
        setTimeout(() => {
          wx.redirectTo({ url: '/subpackagesC/fuzhibaogao/fuzhibaogao' })
        }, 400)
        return
      }
      this.setData({ percent: this._percent })
      this.drawProgress(this._percent)
    }, 20)
  },

  drawProgress(percent) {
    const size = this.canvasPx
    const ctx  = wx.createCanvasContext('progressCanvas', this)
    const cx = size / 2, cy = size / 2
    const r  = size * 0.40
    const lw = size * 0.055

    ctx.clearRect(0, 0, size, size)

    const glow = ctx.createCircularGradient(cx, cy, r)
    glow.addColorStop(0,    'rgba(175,145,235,0.50)')
    glow.addColorStop(0.55, 'rgba(140,195,235,0.25)')
    glow.addColorStop(1,    'rgba(120,185,225,0.00)')
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.setFillStyle(glow)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.setStrokeStyle('rgba(195,180,245,0.28)')
    ctx.setLineWidth(lw)
    ctx.stroke()

    if (percent > 0) {
      const startAngle = -Math.PI / 2
      const endAngle   = startAngle + (percent / 100) * Math.PI * 2
      const grad = ctx.createLinearGradient(cx, cy + r, cx, cy - r)
      grad.addColorStop(0, '#7C5CF6')
      grad.addColorStop(1, '#5BC8F5')
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.setStrokeStyle(grad)
      ctx.setLineWidth(lw)
      ctx.setLineCap('round')
      ctx.stroke()
    }

    ctx.draw()
  },

  onUnload() {
    if (this._timer) clearTimeout(this._timer)
  }
})
