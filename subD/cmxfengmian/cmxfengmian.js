// subpackagesC/cefuzhifengmian/cefuzhifengmian.js
Page({
  data: {
    type: '1'
  },

  onLoad(options) {
    const type = String((options && options.type) || '1')
    this.setData({ type: type === '2' ? '2' : '1' })
  },

  goCamera() {
    wx.navigateTo({
      url: `/subD/mianxiangfenxi/mianxiangfenxi?type=${this.data.type}`
    })
  }
})
