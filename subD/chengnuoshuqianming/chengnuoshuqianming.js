const EDIT_KEY = 'lianzhengSignatureEditing'
const RESULT_KEY = 'lianzhengSignatureResult'

Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0,
    hasDrawn: false
  },

  onLoad() {
    const editing = wx.getStorageSync(EDIT_KEY) || {}
    this._restorePath = editing.signatureImage || ''
    this._saved = false
  },

  onReady() {
    setTimeout(() => this.initCanvas(), 80)
  },

  onUnload() {
    if (!this._saved) {
      wx.removeStorageSync(EDIT_KEY)
    }
  },

  preventScroll() {},

  preventBubble() {},

  initCanvas() {
    wx.createSelectorQuery()
      .in(this)
      .select('.sign-canvas-wrap')
      .boundingClientRect(rect => {
        if (!rect) {
          return
        }
        const canvasWidth = Math.max(1, Math.round(rect.width))
        const canvasHeight = Math.max(1, Math.round(rect.height))
        this.setData({
          canvasWidth,
          canvasHeight,
          hasDrawn: !!this._restorePath
        }, () => {
          this.ctx = wx.createCanvasContext('signatureCanvas', this)
          this.ctx.setStrokeStyle('#193b4d')
          this.ctx.setLineWidth(3)
          this.ctx.setLineCap('round')
          this.ctx.setLineJoin('round')
          this.ctx.setFillStyle('#ffffff')
          this.ctx.fillRect(0, 0, canvasWidth, canvasHeight)
          if (this._restorePath) {
            this.ctx.drawImage(this._restorePath, 0, 0, canvasWidth, canvasHeight)
          }
          this.ctx.draw()
        })
      })
      .exec()
  },

  onTouchStart(e) {
    if (!this.ctx) {
      return
    }
    const touch = e.touches[0]
    this.lastPoint = { x: touch.x, y: touch.y }
    if (!this.data.hasDrawn) {
      this.setData({ hasDrawn: true })
    }
  },

  onTouchMove(e) {
    if (!this.ctx || !this.lastPoint) {
      return
    }
    const touch = e.touches[0]
    this.ctx.beginPath()
    this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y)
    this.ctx.lineTo(touch.x, touch.y)
    this.ctx.stroke()
    this.ctx.draw(true)
    this.lastPoint = { x: touch.x, y: touch.y }
  },

  onTouchEnd() {
    this.lastPoint = null
  },

  clearSignature() {
    if (!this.ctx) {
      return
    }
    this._restorePath = ''
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.ctx.setFillStyle('#ffffff')
    this.ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.ctx.draw()
    this.lastPoint = null
    this.setData({ hasDrawn: false })
  },

  saveSignature() {
    if (!this.data.hasDrawn) {
      wx.showToast({ title: '请先完成手写签字', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存签字...' })
    wx.canvasToTempFilePath({
      canvasId: 'signatureCanvas',
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      destWidth: this.data.canvasWidth * 2,
      destHeight: this.data.canvasHeight * 2,
      success: res => {
        this._saved = true
        wx.setStorageSync(RESULT_KEY, { signatureImage: res.tempFilePath })
        wx.removeStorageSync(EDIT_KEY)
        wx.hideLoading()
        wx.navigateBack()
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '签字保存失败，请重试', icon: 'none' })
      }
    }, this)
  },

  closeSignature() {
    wx.navigateBack()
  }
})
