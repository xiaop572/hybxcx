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
    // 检查是否有cardid参数
    if (options.cardid) {
      this.setData({
        inputCardId: options.cardid
      });
    }

    // 解析参数
    if (options.fromid) {
      wx.setStorageSync('sponsor', options.fromid)
    }
    if (options.scene) {
      let arr = options.scene.split('&');
      if (arr.length < 2) {
        arr = options.scene.split('%26');
      }
      // 处理scene中的参数，可能是 fromid 或者 cardid
      // 假设scene格式为 cardid=xxx 或 xxx (fromid)
      // 这里简单处理，如果 scene 中包含 cardid
      if (arr[0].includes('cardid=')) {
         const sceneCardId = arr[0].split('=')[1];
         if (sceneCardId) {
             this.setData({ inputCardId: sceneCardId });
         }
      } else {
         wx.setStorageSync('sponsor', arr[0]);
      }
    }
  },

  /**
   * 获取指定福卡
   */
  getSpecificCard(inputId) {
    const openid = wx.getStorageSync('openid');
    
    // 映射外部ID到内部ID
    // 6: 健康福 -> 1
    // 7: 美丽福 -> 2
    // 8: 平安福 -> 3
    // 9: 好运福 -> 4
    // 10: 团圆福 -> 5
    const cardMap = {
      '6': '1',
      '7': '2',
      '8': '3',
      '9': '4',
      '10': '5'
    };
    
    const internalId = cardMap[inputId];
    
    if (!internalId) {
      // 如果不是指定的这些ID，提示错误
      console.log('未知的cardid:', inputId);
      wx.showToast({
        title: '无效的福卡参数',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 直接显示领取成功弹窗，不请求接口
    const cardInfo = this.data.cardTypes[internalId];
    this.setData({
      cardId: internalId,
      cardInfo: cardInfo,
      received: true
    });
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

    const openid = wx.getStorageSync('openid')
    wx.showLoading({ title: '领取中...' })

    req({
      url: baseUrl + '/newapi/api/weight/scanaddyearfuka',
      method: 'POST',
      data: {
        openid: openid,
        cardid: this.data.inputCardId
      },
      success: (res) => {
        wx.hideLoading()
        console.log('=== 领取福卡接口返回 ===', res.data)

        if (res.data && res.data.status) {
          wx.showToast({
            title: '恭喜获得' + this.data.cardInfo.name + '！',
            icon: 'success'
          })
          
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/jifu/jifu',
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.data?.msg || '领取失败',
            icon: 'none'
          })
          // 即使失败也跳转吗？通常失败可能是重复领取，这里根据用户习惯，也许应该跳转或者留在这里。
          // 暂时只提示错误，不跳转，让用户看清楚错误。
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
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
    if (this.data.inputCardId) {
      this.getSpecificCard(this.data.inputCardId);
    } else {
      wx.showToast({
        title: '缺少福卡参数',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/jifu/jifu',
        })
      }, 1500);
    }
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