// pages/jiankangjie/jiankangjie.js
const { req } = require('../../utils/request')
const util = require('../../utils/util')

// 4个Tab对应的stype：整形68、口腔62、健康体检60、产后修复63
const STYPE_MAP = [68, 62, 60, 63]

Page({
  data: {
    currentTab: 0,
    zxList:  [],
    kqList:  [],
    tjList:  [],
    chList:  [],
    products: [],
    loadedTabs: [],
    showGiftModal: false  // 礼包弹框
  },

  onLoad(options) {
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&')
      if (arr.length < 2) arr = options.scene.split('%26')
      wx.setStorageSync('sponsor', arr[0])
    }
    // 默认加载第一个Tab
    this.loadTabList(0)
  },

  onShow() {},

  onShareAppMessage() {
    return {
      title: '2026为健康美代言',
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid')
    }
  },

  // 切换Tab
  onTabChange(e) {
    const idx = Number(e.currentTarget.dataset.idx)
    this.setData({ currentTab: idx })
    this.loadTabList(idx)
  },

  // 加载对应Tab的产品列表（已加载过则直接读缓存）
  loadTabList(idx) {
    const listKeys = ['zxList', 'kqList', 'tjList', 'chList']
    const key = listKeys[idx]

    // 已有缓存，直接展示
    if (this.data.loadedTabs.includes(idx)) {
      this.setData({ products: this.data[key] })
      return
    }

    req({
      url: util.baseUrl + '/newapi/api/topic/topicpagelist',
      method: 'POST',
      data: {
        stype: STYPE_MAP[idx],
        curpage: 1,
        limt: 9999,
        searchkey: '',
        sort: 9
      },
      success: res => {
        const list = res.data.data || []
        const loadedTabs = [...this.data.loadedTabs, idx]
        this.setData({
          [key]: list,
          products: list,
          loadedTabs
        })
      },
      fail: () => {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      }
    })
  },

  goAiFace() {
    wx.navigateTo({ url: '/subpackagesC/diagnosis/diagnosis' })
  },

  goGift() {
    this.setData({ showGiftModal: true })
  },

  closeGiftModal() {
    this.setData({ showGiftModal: false })
  },

  claimGift() {
    wx.showLoading({ title: '领取中...' })
    req({
      url: util.baseUrl + '/newapi/api/huodong/givefreefour',
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid'),
        money: 0,
        proid: 0
      },
      success: res => {
        wx.hideLoading()
        this.setData({ showGiftModal: false })
        if (res.data.status) {
          wx.showToast({ title:'领取成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateTo({
              url: '/subpackages/mycard/mycard',
            })
          }, 1500);
        } else {
          wx.showToast({ title:res.data.data, icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      }
    })
  },

  goShare() {
    wx.navigateTo({ url: '/huodongpage/fxgs/fxgs' })
  },

  goProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/tcxq/tcxq?id=' + id })
  },

  preventBubble() {},
  onShareAppMessage() {
    return {
      title: "2026为健康美代言暨和平国际第四届女性健康节三重福利、爆品来袭！",
      imageUrl: "https://wx.pmc-wz.com/materials/jkjfxt.jpg",
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid'),
    }
  },
  onShareTimeline(){
    return {
      title: "2026为健康美代言暨和平国际第四届女性健康节三重福利、爆品来袭！",
      imageUrl: "https://wx.pmc-wz.com/materials/jkjfxt.jpg",
      path: '/pages/jiankangjie/jiankangjie?fromid=' + wx.getStorageSync('openid'),
    }
  },
})
