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
    showErrorPopup: false,
    errorMessage: '',
    blessingText: '',
    alreadyDrawn: false, // 今天是否已经抽过
    cardTypes: {
      '1': { name: '健康福', image: 'https://wx.pmc-wz.com/materials/cjkf.png', desc: '祝您身体健康' },
      '2': { name: '美丽福', image: 'https://wx.pmc-wz.com/materials/cmlf.png', desc: '让您焕发青春光彩' },
      '3': { name: '平安福', image: 'https://wx.pmc-wz.com/materials/cpaf.png', desc: '守护您平安喜乐' },
      '4': { name: '好运福', image: 'https://wx.pmc-wz.com/materials/chyf.png', desc: '祝您好运连连' },
      '5': { name: '团圆福', image: 'https://wx.pmc-wz.com/materials/cyyf.png', desc: '愿您阖家团圆' },
      '6': { name: '万能福', image: 'https://wx.pmc-wz.com/materials/wnf.png', desc: '万事如意心想事成' }
    },
    blessings: [
      '福至·身健·心明·人美，\n马年四件套请签收',
      '愿新的一年，跑出健康，\n跑出光彩，跑向属于自己的旷野！',
      '身如骏马般轻盈矫健，\n心似明镜般从容澄澈',
      '新的一年，愿你我体魄强健，\n神采飞扬',
      '愿您蹄跃福至，身健神昂；\n心明颜焕，岁岁春芳',
      '愿您马踏祥云，康健相随；\n风华常驻，福满年华',
      '愿您金鬃迎福，体韧如松；\n镜心玉貌，步履生风',
      '愿您马跃千川，身姿飒爽；\n心映韶光，颜华永彰',
      '愿您蹄声载福，身若云骏；\n神朗体健，颜华岁新',
      '愿您扬鬃送瑞，步履生辉；\n形魄双全，心镜长明',
      '愿您福驰如马，康驻似山；\n容光映日，美意延年',
      '愿您金蹄踏岁，形影翩然；\n气清神旺，福润华颜',
      '愿您马跃春山，体韧心宽；\n福泽养貌，风华自翩',
      '以马为梦，以健为程，\n福气与光彩，如影随形',
      '您的马年 “美” 运已送达，\n请查收这份容光焕发的快乐！',
      '身如骏马，美若朝霞。\n2026，为健康美加油！'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 直接调用接口获取随机福卡
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      wx.setStorageSync('sponsor', arr[0]);
    }
  },

  /**
   * 获取随机福卡
   */
  getRandomCard() {
    const openid = wx.getStorageSync('openid')

    req({
      url: baseUrl + '/newapi/api/weight/scangetfuka',
      method: 'POST',
      data: {
        openid: openid
      },
      success: (res) => {
        console.log('=== 获取随机福卡接口返回 ===')
        console.log('完整返回数据:', JSON.stringify(res.data))
        
        wx.hideLoading()
        
        if (res.data && res.data.status) {
          const data = res.data.data || {}
          // 确保 cardId 是字符串类型
          let cardId = String(data.cardid || data.cardId || '')
          
          console.log('=== 调试信息 ===')
          console.log('原始cardId:', data.cardid || data.cardId, '类型:', typeof (data.cardid || data.cardId))
          console.log('转换后cardId:', cardId, '类型:', typeof cardId)
          console.log('proname:', data.proname)
          console.log('完整data:', JSON.stringify(data))
          
          // 如果没有 cardId，尝试通过 proname 反向查找
          if ((!cardId || cardId === 'undefined' || cardId === 'null') && data.proname) {
            console.log('通过proname反向查找cardId:', data.proname)
            // 遍历 cardTypes 找到匹配的福卡
            for (let id in this.data.cardTypes) {
              if (this.data.cardTypes[id].name === data.proname) {
                cardId = id
                console.log('找到匹配的cardId:', cardId)
                break
              }
            }
          }
          
          console.log('最终cardId:', cardId)
          console.log('cardTypes键:', Object.keys(this.data.cardTypes))
          console.log('是否匹配到福卡:', !!this.data.cardTypes[cardId])
          
          // 判断是否抽到福卡 - 根据cardid判断
          if (cardId && cardId !== 'undefined' && cardId !== 'null' && this.data.cardTypes[cardId]) {
            // 抽到福卡了
            console.log('✅ 抽到福卡了，福卡ID:', cardId)
            const cardInfo = this.data.cardTypes[cardId]
            
            console.log('福卡信息:', cardInfo)
            
            this.setData({
              cardId: cardId,
              cardInfo: cardInfo,
              received: true
            })
          } else {
            // 没有抽到福卡或者福卡信息不存在
            console.log('❌ 没有抽到福卡或福卡信息不存在')
            console.log('cardId值:', cardId)
            console.log('是否为空:', !cardId)
            console.log('是否在cardTypes中:', !!this.data.cardTypes[cardId])
            
            const message = data.proname || res.data.msg || '很遗憾，没有抽到福卡'
            console.log('弹窗消息:', message)
            
            // 判断是否已经抽过（检测关键字）
            const isAlreadyDrawn = message.includes('已') && (
              message.includes('参与') || 
              message.includes('抽过') || 
              message.includes('领取') || 
              message.includes('明天')
            )
            
            let blessingText = ''
            if (isAlreadyDrawn) {
              // 今天已经抽过，显示固定文案
              blessingText = '明天再来福运更佳哦~'
            } else {
              // 没有抽中，随机选择一条祝福语
              const randomIndex = Math.floor(Math.random() * this.data.blessings.length)
              blessingText = this.data.blessings[randomIndex]
            }
            console.log('祝福语:', blessingText)
            
            // 使用自定义弹窗
            this.setData({
              showErrorPopup: true,
              errorMessage: message,
              blessingText: blessingText,
              alreadyDrawn: isAlreadyDrawn
            })
          }
        } else {
          console.log('接口返回失败')
          const message = res.data?.msg || '获取福卡失败'
          
          // 判断是否已经抽过（检测关键字）
          const isAlreadyDrawn = message.includes('已') && (
            message.includes('参与') || 
            message.includes('抽过') || 
            message.includes('领取') || 
            message.includes('明天')
          )
          
          let blessingText = ''
          if (isAlreadyDrawn) {
            // 今天已经抽过，显示固定文案
            blessingText = '明天再来福运更佳哦~'
          } else {
            // 没有抽中，随机选择一条祝福语
            const randomIndex = Math.floor(Math.random() * this.data.blessings.length)
            blessingText = this.data.blessings[randomIndex]
          }
          
          this.setData({
            showErrorPopup: true,
            errorMessage: message,
            blessingText: blessingText,
            alreadyDrawn: isAlreadyDrawn
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  },

  /**
   * 查看我的福卡（领取后跳转）
   */
  claimCard() {
    if (!this.data.received) {
      wx.showToast({
        title: '请稍等，正在获取福卡',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '恭喜获得' + this.data.cardInfo.name + '！',
      icon: 'success'
    })
    
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/jifu/jifu',
      })
    }, 1500)
  },

  /**
   * 关闭错误提示弹窗（收下祝福去集福）
   */
  closeErrorPopup() {
    this.setData({
      showErrorPopup: false
    })
    wx.switchTab({
      url: '/pages/jifu/jifu',
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
    this.getRandomCard()
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
      title: '健康美就是福·2026 新春马上有福，抱福打卡、扫福抽卡、抢福袋…五大玩法嗨不停',
      imageUrl: "https://wx.pmc-wz.com/materials/jifuftx.jpg",
      path: '/huodongpage/getfuka/getfuka?fromid=' + wx.getStorageSync('openid')
    }
  }
})