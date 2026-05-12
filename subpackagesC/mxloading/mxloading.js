const { req } = require('../../utils/request')
const util = require('../../utils/util')

Page({
  data: {
    percent: 0,
    canvasPx: 280
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.canvasPx = Math.round(sys.windowWidth * 560 / 750)
    this.setData({ canvasPx: this.canvasPx })

    this._percent = 0
    this._lastPercent = -1
    this._apiDone = false
    this._minDurationDone = false
    this._navigated = false
    this._timer = null
    this._minDurationTimer = null
    this._loadStartedAt = 0
    this._minDurationMs = 8000
  },

  onReady() {
    this._loadStartedAt = Date.now()
    this.drawProgress(0)
    this.startAnimation()
    this.callApi()
  },

  startAnimation() {
    // 4 秒内线性增长到 99%，让加载时长稳定可控
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

  callApi() {
    const base64 = wx.getStorageSync('faceBase64') || ''

    if (!base64) {
      this._apiDone = true
      this.tryFinish()
      return
    }

    req({
      url: util.baseUrl + '/newapi/api/topic/faceanalysis',
      method: 'POST',
      timeout: 60000,
      data: {
        base64
      },
      success: res => {
        try {
          wx.setStorageSync('rawApiResponse', res.data)
        } catch (e) {}

        this._apiDone = true
        this.tryFinish()
      },
      fail: () => {
        this._apiDone = true
        this.tryFinish()
      }
    })
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
    setTimeout(() => {
      wx.redirectTo({ url: '/subpackagesC/mianzhenjieguo/mianzhenjieguo' })
    }, 120)
  },

  drawProgress(percent) {
    const size = this.canvasPx
    const ctx = wx.createCanvasContext('progressCanvas', this)
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.4
    const lw = size * 0.055

    ctx.clearRect(0, 0, size, size)

    const glow = ctx.createCircularGradient(cx, cy, r)
    glow.addColorStop(0, 'rgba(175,145,235,0.50)')
    glow.addColorStop(0.55, 'rgba(140,195,235,0.25)')
    glow.addColorStop(1, 'rgba(120,185,225,0.00)')
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
      const endAngle = startAngle + (percent / 100) * Math.PI * 2
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
    if (this._timer) clearInterval(this._timer)
    if (this._minDurationTimer) clearTimeout(this._minDurationTimer)
  }
})
