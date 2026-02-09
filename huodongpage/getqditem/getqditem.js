// huodongpage/getfuka/getfuka.js
const { req } = require('../../utils/request')
const { baseUrl, imgBaseUrl } = require('../../utils/util')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cardId: '',
    cardInfo: null,
    loading: false,
    received: false,
    cardTypes: {
      '2': { name: '焕颜卡', image: 'https://wx.pmc-wz.com/materials/hyfg.png', desc: '让您焕发青春光彩' },
      '3': { name: '皓齿卡', image: 'https://wx.pmc-wz.com/materials/gcfg.png', desc: '守护您的口腔健康' },
      '4': { name: '安康卡', image: 'https://wx.pmc-wz.com/materials/akfg.png', desc: '祝您身体健康平安' },
      '5': { name: '馨悦卡', image: 'https://wx.pmc-wz.com/materials/xyfg.png', desc: '愿您心情愉悦舒畅' }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const cardId = options.cardid || options.cardId
    if (cardId && this.data.cardTypes[cardId]) {
      this.setData({
        cardId: cardId,
        cardInfo: this.data.cardTypes[cardId]
      })
    } else {
      wx.showToast({
        title: '无效的福卡类型',
        icon: 'none'
      })
    }
  },

  /**
   * 领取福卡
   */
  claimCard() {
    if (this.data.loading) return

    const openid = wx.getStorageSync('openid')
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    req({
      url: baseUrl + '/newapi/api/weight/scanaddfuka',
      method: 'POST',
      data: {
        openid: openid,
        cardid: this.data.cardId
      },
      success: (res) => {
        console.log('领取福卡成功:', res)
        if (res.data && res.data.status) {
          this.setData({
            received: true,
            loading: false
          })
          wx.showToast({
            title: '恭喜获得' + this.data.cardInfo.name + '！',
            icon: 'success'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/huodongpage/jifu/jifu',
            })
          }, 1500);
        } else {
          // 如果返回失败，可能是已经领取过了
          this.setData({
            received: true,
            loading: false
          })
          wx.showToast({
            title: res.data.msg || '您已经领取过这张福卡了',
            icon: 'none'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/huodongpage/jifu/jifu',
            })
          }, 1500);
        }
      },
      fail: (err) => {
        console.error('领取福卡失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },



  /**
   * 查看我的福卡
   */
  viewMyCards() {
    wx.navigateTo({
      url: '/pages/mycards/mycards'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: `我获得了${this.data.cardInfo?.name}，快来一起领取福卡吧！`,
      path: `/huodongpage/getfuka/getfuka?cardid=${this.data.cardId}`
    }
  }
})