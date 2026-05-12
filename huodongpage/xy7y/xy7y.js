// pages/jiankangjie/jiankangjie.js
const { req } = require('../../utils/request')
const util = require('../../utils/util')

// 4个Tab对应的stype：整形68、口腔62、健康体检60、产后修复63
const STYPE_MAP = [68, 62, 60, 63]
const LOTTERY_STORAGE_KEY = 'jiankangjie_lottery_chance'
const LOTTERY_DEFAULT_CHANCE = 0
const GIFT_CLAIMED_STORAGE_KEY = 'jiankangjie_gift_claimed'
const LOTTERY_PRIZES = [
  {
    id: 1,
    backendCode: 3018,
    title: '医用面膜一盒',
    image: 'https://wx.pmc-wz.com/materials/jkm7zp1.png',
    popupImage: 'https://wx.pmc-wz.com/materials/jkm7jp1.jpg'
  },
  {
    id: 2,
    backendCode: 3019,
    title: '肩颈疼痛调理1次',
    image: 'https://wx.pmc-wz.com/materials/jkm7zp2.png',
    popupImage: 'https://wx.pmc-wz.com/materials/jkm7jp2.jpg'
  },
  {
    id: 3,
    backendCode: 3016,
    title: '3M补牙1次',
    image: 'https://wx.pmc-wz.com/materials/jkm7zp3.png',
    popupImage: 'https://wx.pmc-wz.com/materials/jkm7jp3.jpg'
  },
  {
    id: 4,
    backendCode: 3017,
    title: 'C14幽门螺旋杆菌检测1次',
    image: 'https://wx.pmc-wz.com/materials/jkm7zp4.png',
    popupImage: 'https://wx.pmc-wz.com/materials/jkm7jp4.jpg'
  },
  {
    id: 5,
    backendCode: 3015,
    title: '舒敏之星1次',
    image: 'https://wx.pmc-wz.com/materials/jkm7zp5.png',
    popupImage: 'https://wx.pmc-wz.com/materials/jkm7jp5.jpg'
  },
  {
    id: 6,
    title: '周杰伦演唱会门票1张或7000元健康美基金',
    image: 'https://wx.pmc-wz.com/materials/jkm7zp7.png',
    popupImage: 'https://wx.pmc-wz.com/materials/jkm7jp6.jpg'
  }
]

function getTodayKey() {
  const date = new Date()
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

Page({
  data: {
    currentTab: 0,
    zxList:  [],
    kqList:  [],
    tjList:  [],
    chList:  [],
    products: [],
    loadedTabs: [],
    showGiftModal: false,  // 礼包弹框
    showHxGiftModal: false,
    isClaimGiftLoading: false,
    lotteryPrizes: LOTTERY_PRIZES,
    activeLotteryIndex: -1,
    lotteryChance: LOTTERY_DEFAULT_CHANCE,
    canDraw: false,
    isLotteryRunning: false,
    showLotteryResult: false,
    lotteryResult: null
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
    this.setData({ showGiftModal: !this.hasClaimedGift() })
  },

  onShow() {
    wx.hideLoading()
    const resetData = {}
    if (this.data.isClaimGiftLoading) {
      resetData.isClaimGiftLoading = false
    }
    // 从登录页返回后，强制复位抽奖交互状态，避免按钮被“抽奖中”状态静默拦截
    if (this.data.isLotteryRunning) {
      resetData.isLotteryRunning = false
    }
    if (this.data.activeLotteryIndex !== -1) {
      resetData.activeLotteryIndex = -1
    }
    if (Object.keys(resetData).length) {
      this.setData(resetData)
    }
  },

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

  hasClaimedGift() {
    const cache = wx.getStorageSync(GIFT_CLAIMED_STORAGE_KEY) || {}
    const openid = wx.getStorageSync('openid')
    return !!cache.claimed && !!openid && cache.openid === openid
  },

  markGiftClaimed() {
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      return
    }
    wx.setStorageSync(GIFT_CLAIMED_STORAGE_KEY, {
      claimed: true,
      openid
    })
  },

  isGiftAlreadyClaimedMessage(message) {
    const text = String(message || '')
    return text.includes('已领取') ||
      text.includes('已经领取') ||
      text.includes('领取过') ||
      text.includes('已领过') ||
      text.includes('不能重复领') ||
      text.includes('重复领')
  },

  openHxGiftModal() {
    this.setData({ showHxGiftModal: true })
  },

  closeHxGiftModal() {
    this.setData({ showHxGiftModal: false })
  },

  closeGiftModal() {
    this.setData({ showGiftModal: false })
  },

  claimGift() {
    if (this.data.isClaimGiftLoading) {
      return
    }
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userInfo')
    if (!openid || !userInfo) {
      wx.hideLoading()
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 300)
      return
    }
    this.setData({ isClaimGiftLoading: true })
    wx.showLoading({ title: '领取中...' })
    req({
      url: util.baseUrl + '/newapi/api/huodong/give7zheszhe',
      method: 'POST',
      data: {
        openid,
        money: 0,
        proid: 0,
        xinmin: '',
        mobile: ''
      },
      success: res => {
        wx.hideLoading()
        this.setData({ isClaimGiftLoading: false })
        if (res.data.status) {
          this.markGiftClaimed()
          this.setData({ showGiftModal: false })
          wx.showToast({ title:'领取成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateTo({
              url: '/subpackages/mycard/mycard',
            })
          }, 1500);
        } else {
          const message = res.data.data || res.data.msg || '领取失败'
          if (this.isGiftAlreadyClaimedMessage(message)) {
            this.markGiftClaimed()
            this.setData({ showGiftModal: false })
          }
          wx.showToast({ title: message, icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.setData({ isClaimGiftLoading: false })
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

  goMyCard() {
    this.setData({
      showLotteryResult: false
    })
    wx.navigateTo({
      url: '/subpackages/mycard/mycard'
    })
  },

  initLotteryChance() {
    // 不再接入 checkluckydraw，由开盒接口 open7yearbox 直接控制是否可抽奖
    this.updateLotteryChance(LOTTERY_DEFAULT_CHANCE)
  },

  updateLotteryChance(count) {
    const safeCount = count < 0 ? 0 : count
    this.setData({
      lotteryChance: safeCount,
      canDraw: safeCount > 0
    })
    wx.setStorageSync(LOTTERY_STORAGE_KEY, {
      date: getTodayKey(),
      count: safeCount
    })
  },

  getCachedLotteryChance() {
    const cache = wx.getStorageSync(LOTTERY_STORAGE_KEY) || {}
    const todayKey = getTodayKey()
    return cache.date === todayKey ? Number(cache.count) || 0 : LOTTERY_DEFAULT_CHANCE
  },

  parseLotteryChanceResponse(res) {
    const payload = res && res.data
    if (!payload) {
      return null
    }
    const data = payload.data
    if (data && typeof data === 'object' && typeof data.canDraw !== 'undefined') {
      return {
        canDraw: !!data.canDraw,
        currentTotal: Number(data.currentTotal) || 0
      }
    }
    if (typeof data === 'number' || typeof data === 'string') {
      const count = Number(data)
      if (Number.isNaN(count)) {
        return null
      }
      return {
        canDraw: count > 0,
        currentTotal: count
      }
    }
    if (data && typeof data === 'object') {
      const rawCount = data.currentTotal ?? data.count ?? data.num ?? data.luckydrawcount ?? data.lotteryChance ?? data.times ?? data.chance
      const count = Number(rawCount)
      if (Number.isNaN(count)) {
        return null
      }
      return {
        canDraw: count > 0,
        currentTotal: count
      }
    }
    return null
  },

  normalizePrizeText(text) {
    return String(text || '')
      .replace(/\s+/g, '')
      .replace(/[，。,！!？?、:：()（）\-]/g, '')
      .toLowerCase()
  },

  getPrizeMatchText(prize) {
    return this.normalizePrizeText(prize && prize.title)
  },

  findLotteryPrizeByResponse(payload) {
    const code = payload && payload.code
    const message = payload && (payload.msg || payload.data || '')
    const normalizedMessage = this.normalizePrizeText(message)
    const exactPrize = this.data.lotteryPrizes.find(item => String(item.backendCode) === String(code))
    if (exactPrize) {
      return exactPrize
    }
    const matchedPrize = this.data.lotteryPrizes.find(item => normalizedMessage.includes(this.getPrizeMatchText(item)))
    if (matchedPrize) {
      return matchedPrize
    }
    if (normalizedMessage.includes('医用面膜')) {
      return this.data.lotteryPrizes.find(item => item.id === 1) || null
    }
    if (normalizedMessage.includes('肩颈疼痛')) {
      return this.data.lotteryPrizes.find(item => item.id === 2) || null
    }
    if (normalizedMessage.includes('3m补牙')) {
      return this.data.lotteryPrizes.find(item => item.id === 3) || null
    }
    if (normalizedMessage.includes('c14') || normalizedMessage.includes('幽门螺旋杆菌')) {
      return this.data.lotteryPrizes.find(item => item.id === 4) || null
    }
    if (normalizedMessage.includes('舒敏之星')) {
      return this.data.lotteryPrizes.find(item => item.id === 5) || null
    }
    return null
  },

  runLotteryAnimation(targetPrize) {
    const targetIndex = this.data.lotteryPrizes.findIndex(item => item.id === targetPrize.id)
    if (targetIndex < 0) {
      this.setData({ isLotteryRunning: false })
      wx.showToast({
        title: '奖品配置异常',
        icon: 'none'
      })
      return
    }
    let currentIndex = -1
    const totalSteps = this.data.lotteryPrizes.length * 4 + targetIndex + 1
    let step = 0
    this.lotteryTimer = setInterval(() => {
      step += 1
      currentIndex = (currentIndex + 1) % this.data.lotteryPrizes.length
      this.setData({
        activeLotteryIndex: currentIndex
      })
      if (step >= totalSteps) {
        clearInterval(this.lotteryTimer)
        this.lotteryTimer = null
        wx.hideLoading()
        this.setData({
          activeLotteryIndex: targetIndex,
          isLotteryRunning: false,
          showLotteryResult: true,
          lotteryResult: targetPrize
        })
        this.initLotteryChance()
      }
    }, 180)
  },

  startLottery() {
    if (this.data.isLotteryRunning) {
      wx.showToast({
        title: '抽奖进行中，请稍候',
        icon: 'none'
      })
      return
    }
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userInfo')
    if (!openid || !userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 300)
      return
    }
    this.setData({
      isLotteryRunning: true,
      showLotteryResult: false,
      lotteryResult: null
    })
    req({
      url: util.baseUrl + '/newapi/api/topic/open7yearbox',
      method: 'POST',
      data: {
        openid
      },
      success: res => {
        const payload = res && res.data ? res.data : {}
        if (!payload.status) {
          wx.hideLoading()
          this.setData({ isLotteryRunning: false })
          wx.showToast({
            title: payload.msg || payload.data || '抽奖失败，请重试',
            icon: 'none'
          })
          return
        }
        const targetPrize = this.findLotteryPrizeByResponse(payload)
        if (!targetPrize) {
          wx.hideLoading()
          this.setData({ isLotteryRunning: false })
          wx.showToast({
            title: '未匹配到奖品',
            icon: 'none'
          })
          return
        }
        this.runLotteryAnimation(targetPrize)
      },
      fail: () => {
        wx.hideLoading()
        this.setData({
          isLotteryRunning: false
        })
        wx.showToast({
          title: '抽奖失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  closeLotteryResult() {
    this.setData({
      showLotteryResult: false
    })
  },

  preventBubble() {},
  onUnload() {
    if (this.lotteryTimer) {
      clearInterval(this.lotteryTimer)
      this.lotteryTimer = null
    }
  }
})
